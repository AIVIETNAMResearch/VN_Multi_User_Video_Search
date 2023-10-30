import numpy as np
from rank_bm25 import BM25Okapi
import glob
import os
from numpy.linalg import norm
import pickle
import faiss
import pandas as pd
import scipy

def GET_PROJECT_ROOT():
    # goto the root folder of LogBar
    current_abspath = os.path.abspath(__file__)
    while True:
        if os.path.split(current_abspath)[1] == 'AIChallenge2023':
            project_root = current_abspath
            break
        else:
            current_abspath = os.path.dirname(current_abspath)
    return project_root

PROJECT_ROOT = GET_PROJECT_ROOT()

class load_file:
    def __init__(
            self,
            clean_data_path,
            save_tfids_object_path,
            save_corpus_path,
            update:bool=False,
    ):
        self.bm25_transform = {}
        for data_type in ['bbox', 'color', 'class', 'tag']:
            if clean_data_path[data_type] is not None:
                if (not os.path.exists(os.path.join(save_tfids_object_path, f'bm25_transform_{data_type}.pkl'))) or update :
                    clean_data_paths = os.path.join(PROJECT_ROOT, clean_data_path[data_type])
                    data_paths = glob.glob(clean_data_paths)
                    data_paths.sort(reverse=False, key=lambda s:int(s[-5:-4]))
                    context = []
                    for path in data_paths:
                        with open(path, 'r', encoding='utf-8') as f:
                            data = f.readlines()
                            data = [item.strip().split() for item in data]
                            context += data
                    self.bm25_transform[data_type] = BM25Okapi(context)
                    if data_type == 'tag':
                        corpus = []
                        for data in context:
                            corpus += data
                        tag_corpus = '\n'.join([word.replace('_', ' ') for word in set(corpus)]) + '\n'
                        with open(save_corpus_path, 'w') as f:
                            f.write(tag_corpus)
                    with open(os.path.join(save_tfids_object_path, f'bm25_transform_{data_type}.pkl'), 'wb') as f:
                        pickle.dump(self.bm25_transform[data_type], f)
                else:
                    with open(os.path.join(save_tfids_object_path, f'bm25_transform_{data_type}.pkl'), 'rb') as f:
                        self.bm25_transform[data_type] = pickle.load(f)

class tf_idf_retrieval(load_file):
    def __init__(
            self,
            clean_data_path = {
                'bbox':'dict/contexts/bboxes_encoded/*.txt',
                'class':'dict/contexts/classes_encoded/*.txt',
                'color':'dict/contexts/colors_encoded/*.txt',
                'tag':'dict/contexts/tags_encoded/*.txt',
            },
            update:bool=False,
            save_tfids_object_path = os.path.join(PROJECT_ROOT, 'dict/contexts_bin'),
            save_corpus_path = 'dict/tag/tag_corpus.txt'
    ):
        super().__init__(
            clean_data_path,
            save_tfids_object_path,
            save_corpus_path,
            update=update,
        )
        self.clean_data_path = clean_data_path
    
    def __call__(self, texts, k=3):
      scores, idx_image = [], []

      if texts["bbox"] is not None:
        scores_ = self.find_similar_score(texts["bbox"], 'bbox')
        scores.append(scores_)
        idx_image.append(idx_image_[0])
      if texts["color"] is not None:
        scores_, idx_image_ = self.find_similar_score(texts["color"], 'color')
        scores.append(scores_[0])
        idx_image.append(idx_image_[0])
      if texts["class"] is not None:
        scores_, idx_image_ = self.find_similar_score(texts["class"], 'class')
        scores.append(scores_[0])
        idx_image.append(idx_image_[0])
      if texts["tag"] is not None:
        scores_, idx_image_ = self.find_similar_score(texts["tag"], 'tag')
        scores.append(scores_[0])
        idx_image.append(idx_image_[0])

      scores = np.concatenate(scores, axis=0)
      idx_image = np.concatenate(idx_image, axis=0)
      df = pd.DataFrame(data=[idx_image, scores]).T
      df.columns=['idx_image','scores']
      df = df.groupby(['idx_image']).aggregate(sum).sort_values(by=['scores'], ascending=False)
      df_numpy = np.array(df.to_records().tolist())
      idx_image = df_numpy[:, 0].astype(int)
      scores = df_numpy[:, 1]
      
      return scores, idx_image

    def find_similar_score(self, text:str, transform_type:str):
        scores = self.bm25_transform[transform_type].get_scores(text.split())
        return scores

if __name__ == '__main__':
    # inputs = {
    #     'bbox': "a0kite b0kite",
    #     'class': "people1 tv1",
    #     'color':None,
    #     'tag':None
    # }
    # obj = tf_idf_retrieval()
    # list_answer = obj(inputs, k=3)
    # print(list_answer)
    # obj.transform_input('query', 'input_type') # input_type is bbox, color, class, tag
    # context_vector = obj.get_context_vector() # get context vector
    pass