import os
import sys
import glob
import scipy
import pickle
import numpy as np
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer

script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(script_dir, '..'))
grand_dir = os.path.abspath(os.path.join(parent_dir, '..'))
sys.path.extend([parent_dir, grand_dir])
from utils.combine_utils import merge_searching_results_by_addition

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
            clean_data_path,  # clean_data_path and context can't not be None at the same time
            save_tfids_object_path,
            update:bool,
            all_datatpye,
            context_data = None,
            ngram_range = (1, 1),
            input_datatype = 'txt',
    ):
        tfidf_transform = {}
        context_matrix = {}
        for data_type in all_datatpye:
            if (not os.path.exists(os.path.join(save_tfids_object_path, f'tfidf_transform_{data_type}.pkl'))):
                if context_data == None:
                    clean_data_paths = os.path.join(PROJECT_ROOT, clean_data_path[data_type])
                    context = self.load_context(clean_data_paths, input_datatype)
                    print(data_type)
                    print(context[0][:100])
                else:
                    context = context_data
                tfidf_transform[data_type] = TfidfVectorizer(input = 'content', ngram_range = ngram_range, token_pattern=r"(?u)\b[\w\d]+\b")
                context_matrix[data_type] = tfidf_transform[data_type].fit_transform(context).tocsr()
                print(tfidf_transform[data_type].get_feature_names_out()[:10])
                print(context_matrix[data_type].shape)
                with open(os.path.join(save_tfids_object_path, f'tfidf_transform_{data_type}.pkl'), 'wb') as f:
                    pickle.dump(tfidf_transform[data_type], f)
                scipy.sparse.save_npz(os.path.join(save_tfids_object_path, f'sparse_context_matrix_{data_type}.npz'), context_matrix[data_type])

    def load_context(self, clean_data_paths, input_datatype):
        context = []
        if input_datatype == 'txt':
            data_paths = []
            cxx_data_paths = glob.glob(clean_data_paths)
            cxx_data_paths.sort()
            for cxx_data_path in cxx_data_paths:
                data_path = glob.glob(cxx_data_path + '/*.txt')
                data_path.sort(reverse=False, key=lambda s:int(s[-7:-4]))
                data_paths += data_path
            for path in data_paths:
                with open(path, 'r', encoding='utf-8') as f:
                    data = f.readlines()
                    data = [item.strip() for item in data]
                    context += data
        elif input_datatype == 'json':
            context_paths = glob.glob(clean_data_paths)
            context_paths.sort()
            for cxx_context_path in context_paths:
                paths = glob.glob(cxx_context_path + '/*.json')
                paths.sort(reverse=False, key=lambda x: int(x[-8:-5]))
                for path in paths:
                    with open(path) as f:
                        context += [self.preprocess_text(' '.join(line)) for line in json.load(f)]
        else:
            print(f'not support reading the {input_datatype}')
            sys.exit()
        return context
    
    @staticmethod
    def preprocess_text(text:str):
        text = text.lower()
        # keep letter and number remove all remain
        reg_pattern = '[^a-z0-9A-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]'
        output = re.sub(reg_pattern, '', text)
        output = output.strip()
        return output

class object_retrieval(load_file):
    def __init__(
            self,
            clean_data_path = {
                'bbox':'dict/context_encoded/bboxes_encoded/*',
                'class':'dict/context_encoded/classes_encoded/*',
                'color':'dict/context_encoded/colors_encoded/*',
                'tag':'dict/context_encoded/tags_encoded/*',
                'number':'dict/context_encoded/number_encoded/*',
            },
            update:bool=False,
            save_tfids_object_path = os.path.join(PROJECT_ROOT, 'dict/bin/contexts_bin'),
            save_corpus_path = 'dict/tag/tag_corpus.txt'
    ):
        if not os.path.exists(os.path.join(PROJECT_ROOT, 'dict/bin')):
            os.mkdir(os.path.join(PROJECT_ROOT, 'dict/bin'))
        
        if not os.path.exists(save_tfids_object_path):
            os.mkdir(save_tfids_object_path)

        all_datatpye = [key for key in clean_data_path.keys() if (clean_data_path[key] != None)]
        super().__init__(
            clean_data_path = clean_data_path,
            save_tfids_object_path = save_tfids_object_path,
            update=update,
            all_datatpye=all_datatpye,
        )
        self.tfidf_transform = {}
        self.context_matrix = {}
        for data_type in all_datatpye:
            with open(os.path.join(save_tfids_object_path, f'tfidf_transform_{data_type}.pkl'), 'rb') as f:
                self.tfidf_transform[data_type] = pickle.load(f)
            self.context_matrix[data_type] = scipy.sparse.load_npz(os.path.join(save_tfids_object_path, f'sparse_context_matrix_{data_type}.npz'))

        self.clean_data_path = clean_data_path
        self.tag_corpus = self.tfidf_transform['tag'].get_feature_names_out()
        if not os.path.exists(save_corpus_path):
            corpus = [' '.join(words.split('_')) for words in self.tag_corpus]
            corpus = '\n'.join(corpus) + '\n'
            with open(save_corpus_path, 'w') as f:
                f.write(corpus)

    def transform_input(
            self,
            input_query:str,
            transform_type:str,
    ):
        '''
        This function transform input take from user to tf-idf array
        It remove all word not in the vocabulary/corpus
        
        input:
        input: a string text used as query take from user
        
        output:
        numpy array converted from query with tf-idf
        '''
        if transform_type in ['bbox', 'class', 'color', 'tag', 'number']:
            vectorize = self.tfidf_transform[transform_type].transform([input_query])
        else:
            print('this type does not support')
            sys.exit()
        return vectorize
    
    def __call__(
            self,
            texts,
            k=100,
            index=None,
    ):
        scores, idx_image = [], []
        for input_type in ['bbox', 'color', 'class', 'tag', 'number']:
            if texts[input_type] is not None:
                scores_, idx_image_ = self.find_similar_score(texts[input_type], input_type, k, index=index)
                scores.append(scores_)
                idx_image.append(idx_image_)
        
        scores, idx_image = merge_searching_results_by_addition(scores, idx_image)
        return scores, idx_image

    def find_similar_score(
            self,
            text:str,
            transform_type:str,
            k:int,
            index,
    ):
        vectorize = self.transform_input(text, transform_type)
        if index is None: #awesome_cossim_topn(a, b, N, 0.01, use_threads=True, n_jobs=4, return_best_ntop=True)
            #scores = cosine_similarity(vectorize, self.context_matrix[transform_type])[0]
            scores = vectorize.dot(self.context_matrix[transform_type].T).toarray()[0]
            sort_index = np.argsort(scores)[::-1][:k]
            scores = scores[sort_index]
        else:
            #scores = cosine_similarity(vectorize, self.context_matrix[transform_type][index,:])[0]
            scores = vectorize.dot(self.context_matrix[transform_type][index,:].T).toarray()[0]
            sort_index = np.argsort(scores)[::-1][:k]
            scores = scores[sort_index]
            sort_index = np.array(index)[sort_index]
        return scores, sort_index

if __name__ == '__main__':
    inputs = {
        'bbox': "a0kite b0kite",
        'class': "people1 tv1",
        'color':None,
        'tag':None,
        'number':None,
    }
    obj = object_retrieval()
    #list_answer = obj(inputs, k=3)
    #print(list_answer)
    # obj.transform_input('query', 'input_type') # input_type is bbox, color, class, tag
    # context_vector = obj.get_context_vector() # get context vector
    pass