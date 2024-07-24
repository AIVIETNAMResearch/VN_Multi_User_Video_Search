import sys
import os
import pickle
import numpy as np
import re
import scipy
script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(script_dir, '..'))
grand_dir = os.path.abspath(os.path.join(parent_dir, '..'))
sys.path.extend([parent_dir, grand_dir])

from utils.object_retrieval_engine.object_retrieval import load_file

def GET_PROJECT_ROOT():
    # goto the root folder of LogBar
    current_abspath = os.path.abspath(__file__)
    while True:
        if os.path.split(current_abspath)[1] == 'VN_Multi_User_Video_Search':
            project_root = current_abspath
            break
        else:
            current_abspath = os.path.dirname(current_abspath)
    return project_root

PROJECT_ROOT = GET_PROJECT_ROOT()

class ocr_retrieval(load_file):
    def __init__(
            self,
            ocr_context_path='dict/ocr/*',
            ocr_embed_path=os.path.join(PROJECT_ROOT, 'dict/bin/ocr_bin'),
    ):
        if not os.path.exists(os.path.join(PROJECT_ROOT, 'dict/bin')):
            os.mkdir(os.path.join(PROJECT_ROOT, 'dict/bin'))
        
        if not os.path.exists(ocr_embed_path):
            os.mkdir(ocr_embed_path)

        super().__init__(
            clean_data_path={'ocr':ocr_context_path},
            save_tfids_object_path=ocr_embed_path,
            all_datatpye=['ocr'],
            context_data = None,
            ngram_range = (1, 3),
            update=False,
            input_datatype='json'
        )
        with open(os.path.join(ocr_embed_path, 'tfidf_transform_ocr.pkl'), 'rb') as f:
            self.tfidf_transform_ocr = pickle.load(f)
        self.context_sparse_matrix_ocr = scipy.sparse.load_npz(os.path.join(os.path.join(PROJECT_ROOT, ocr_embed_path), f'sparse_context_matrix_ocr.npz'))

    def __call__(
            self,
            query:str,
            k:int,
            index=None,
    ):
        '''
        query_embed = self.get_embedding([query.lower()]).cpu().numpy()
        if index is not None:
            id_selector = faiss.IDSelectorArray(index)
            ocr_semantic_score, ocr_semantic_index = self.ocr_context_embed.search(query_embed, k=k, params=faiss.SearchParametersIVF(sel=id_selector))
        else:
            ocr_semantic_score, ocr_semantic_index = self.ocr_context_embed.search(query_embed, k=k)
        '''
        ocr_tfidf_score, ocr_tfidf_index = self.get_tfidf_score(query.lower(), k, index)
        return ocr_tfidf_score, ocr_tfidf_index

        '''
        scores, idx_image = merge_searching_results_by_addition([ocr_semantic_score.flatten(), ocr_tfidf_score], [ocr_semantic_index.flatten(), ocr_tfidf_index])
        return scores, idx_image
        '''

    def get_tfidf_score(
            self,
            query:str,
            k:int,
            index,
    ):
        vectorize = self.tfidf_transform_ocr.transform([query])
        if index is None:
            #scores = cosine_similarity(vectorize, self.context_sparse_matrix_ocr)[0]
            scores = vectorize.dot(self.context_sparse_matrix_ocr.T).toarray()[0]
            sort_index = np.argsort(scores)[::-1][:k]
            scores = scores[sort_index]
        else:
            #scores = cosine_similarity(vectorize, self.context_sparse_matrix_ocr[index,:])[0]
            scores = vectorize.dot(self.context_sparse_matrix_ocr[index,:].T).toarray()[0]
            sort_index = np.argsort(scores)[::-1][:k]
            scores = scores[sort_index]
            sort_index = np.array(index)[sort_index]
        return scores, sort_index
        

if __name__ == '__main__':
    obj = ocr_retrieval()
    score, index = obj("Dùng nuóc sát khẩn chúa Methanol nguy hiểm tói tính mạng", 3) # return index of top k result
    print(score)
    print(index)
    pass