import re
import os
import clip
import open_clip
import torch
import json
import glob
import faiss
import numpy as np
from utils.nlp_processing import Translation
from utils.combine_utils import merge_searching_results_by_addition
from utils.ocr_retrieval_engine.ocr_retrieval import ocr_retrieval
from utils.semantic_embed.speech_retrieval import speech_retrieval
from utils.object_retrieval_engine.object_retrieval import object_retrieval

class MyFaiss:
    def __init__(self, bin_clip_file: str, bin_clipv2_file: str, json_path: str, audio_json_path:str, img2audio_json_path:str):    
        self.index_clip = self.load_bin_file(bin_clip_file)
        self.index_clipv2 = self.load_bin_file(bin_clipv2_file)
        self.object_retrieval = object_retrieval()
        self.ocr_retrieval = ocr_retrieval()
        self.asr_retrieval = speech_retrieval()

        self.id2img_fps = self.load_json_file(json_path)
        self.audio_id2img_id = self.load_json_file(audio_json_path)
        self.img_id2audio_id = self.load_json_file(img2audio_json_path)
        self.translater = Translation()
        self.__device = "cuda" if torch.cuda.is_available() else "cpu"
        self.clip_model, _ = clip.load("ViT-B/16", device=self.__device)
        self.clipv2_model, _, _ = open_clip.create_model_and_transforms('ViT-L-14', device=self.__device, pretrained='datacomp_xl_s13b_b90k')
        self.clipv2_tokenizer = open_clip.get_tokenizer('ViT-L-14')

    def load_json_file(self, json_path: str):
      with open(json_path, 'r') as f: 
        js = json.load(f)
      return {int(k):v for k,v in js.items()}
    
    def load_bin_file(self, bin_file: str):
        return faiss.read_index(bin_file)

    def image_search(self, id_query, k):
        query_feats = self.index_clip.reconstruct(id_query).reshape(1,-1)

        scores, idx_image = self.index_clip.search(query_feats, k=k)
        idx_image = idx_image.flatten()

        infos_query = list(map(self.id2img_fps.get, list(idx_image)))
        
        image_paths = [info['image_path'] for info in infos_query]
        return scores.flatten(), idx_image, infos_query, image_paths

    def text_search(self, text, index, k, model_type):
        text = self.translater(text)

        ###### TEXT FEATURES EXTRACTING ######
        if model_type == 'clip':
            text = clip.tokenize([text]).to(self.__device)  
            text_features = self.clip_model.encode_text(text)
        else:
            text = self.clipv2_tokenizer([text]).to(self.__device)  
            text_features = self.clipv2_model.encode_text(text)
        
        text_features /= text_features.norm(dim=-1, keepdim=True)
        text_features = text_features.cpu().detach().numpy().astype(np.float32)

        ###### SEARCHING #####
        if model_type == 'clip':
            index_choosed = self.index_clip
        else:
            index_choosed = self.index_clipv2
        
        if index is None:
          scores, idx_image = index_choosed.search(text_features, k=k)
        else:
          id_selector = faiss.IDSelectorArray(index)
          scores, idx_image = index_choosed.search(text_features, k=k, 
                                                   params=faiss.SearchParametersIVF(sel=id_selector))
        idx_image = idx_image.flatten()

        ###### GET INFOS KEYFRAMES_ID ######
        infos_query = list(map(self.id2img_fps.get, list(idx_image)))
        image_paths = [info['image_path'] for info in infos_query]
        return scores.flatten(), idx_image, infos_query, image_paths

    def asr_post_processing(self, tmp_asr_scores, tmp_asr_idx_image, k):
        result = dict()
        for asr_idx, asr_score in zip(tmp_asr_idx_image, tmp_asr_scores):
            lst_ids = self.audio_id2img_id[asr_idx]
            for idx in lst_ids: 
                if result.get(idx, None) is None:
                    result[idx] = asr_score
                else:
                    result[idx] += asr_score

        result = sorted(result.items(), key=lambda x:x[1], reverse=True)
        asr_idx_image = [item[0] for item in result]
        asr_scores = [item[1] for item in result]
        return np.array(asr_scores)[:k], np.array(asr_idx_image)[:k]
    
    def asr_retrieval_helper(self, asr_input, k, index, semantic, keyword):
        # Map img_id to audio_id
        if index is not None:
            audio_temp = dict()
            for idx in index:
                audio_idxes = self.img_id2audio_id[idx]
                for audio_idx in audio_idxes:
                    if audio_temp.get(audio_idx, None) is None:
                        audio_temp[audio_idx] = [idx]
                    else:
                        audio_temp[audio_idx].append(idx)

            audio_index = np.array(list(audio_temp.keys())).astype('int64')
            tmp_asr_scores, tmp_asr_idx_image = self.asr_retrieval(asr_input, k=len(audio_index), index=audio_index, semantic=semantic, keyword=keyword)
            
            result = dict()
            for asr_idx, asr_score in zip(tmp_asr_idx_image, tmp_asr_scores):
                for idx in audio_temp[asr_idx]:
                    if result.get(idx, None) is None:
                        result[idx] = asr_score
                    else:
                        result[idx] += asr_score
            result = sorted(result.items(), key=lambda x:x[1], reverse=True)
            asr_idx_image = np.array([item[0] for item in result])[:k]
            asr_scores = np.array([item[1] for item in result])[:k]
        else:
            tmp_asr_scores, tmp_asr_idx_image = self.asr_retrieval(asr_input, k=k, index=None, semantic=semantic, keyword=keyword)
            asr_scores, asr_idx_image = self.asr_post_processing(tmp_asr_scores, tmp_asr_idx_image, k)
        return asr_scores, asr_idx_image

    def context_search(self, object_input, ocr_input, asr_input, k, semantic=False, keyword=True, index=None, useid=False):
        '''
        Example:
        inputs = {
            'bbox': "a0person",
            'class': "person0, person1",
            'color':None,
            'tag':None
        }
        '''
        scores, idx_image = [], []
        ###### SEARCHING BY OBJECT #####
        if object_input is not None:
            object_scores, object_idx_image = self.object_retrieval(object_input, k=k, index=index)
            scores.append(object_scores)
            idx_image.append(object_idx_image)

        ###### SEARCHING BY OCR #####
        if ocr_input is not None:
            ocr_scores, ocr_idx_image = self.ocr_retrieval(ocr_input, k=k, index=index)
            scores.append(ocr_scores)
            idx_image.append(ocr_idx_image)

        ###### SEARCHING BY ASR #####
        if asr_input is not None:
            if not useid:
                asr_scores, asr_idx_image = self.asr_retrieval_helper(asr_input, k, None, semantic, keyword)
            else:
                asr_scores, asr_idx_image = self.asr_retrieval_helper(asr_input, k, index, semantic, keyword)
            scores.append(asr_scores)
            idx_image.append(asr_idx_image)
        
        scores, idx_image = merge_searching_results_by_addition(scores, idx_image)

        ###### GET INFOS KEYFRAMES_ID ######
        infos_query = list(map(self.id2img_fps.get, list(idx_image)))
        image_paths = [info['image_path'] for info in infos_query]
        return scores, idx_image, infos_query, image_paths

    def reranking(self, prev_result, lst_pos_vote_idxs, lst_neg_vote_idxs, k):
        '''
        Perform reranking using user feedback
        '''
        lst_vote_idxs = []
        lst_vote_idxs.extend(lst_pos_vote_idxs)
        lst_vote_idxs.extend(lst_neg_vote_idxs)
        lst_vote_idxs = np.array(lst_vote_idxs).astype('int64')        
        len_pos = len(lst_pos_vote_idxs)

        result = dict()
        for item in prev_result:
            for id, score in zip(item['video_info']['lst_idxs'], item['video_info']['lst_scores']):
                result[id] = score

        for key in lst_neg_vote_idxs:
            result.pop(key)

        id_selector = faiss.IDSelectorArray(np.array(list(result.keys())).astype('int64'))
        query_feats = self.index_clip.reconstruct_batch(lst_vote_idxs)
        lst_scores, lst_idx_images = self.index_clip.search(query_feats, k=min(k, len(result)),
                                                            params=faiss.SearchParametersIVF(sel=id_selector))

        for i, (scores, idx_images) in enumerate(zip(lst_scores, lst_idx_images)):
            for score, idx_image in zip(scores, idx_images):
                if 0 <= i < len_pos:
                    result[idx_image] += score
                else:
                    result[idx_image] -= score

        result = sorted(result.items(), key=lambda x:x[1], reverse=True)
        list_ids = [item[0] for item in result]
        lst_scores = [item[1] for item in result]
        infos_query = list(map(self.id2img_fps.get, list(list_ids)))
        list_image_paths = [info['image_path'] for info in infos_query]

        return lst_scores, list_ids, infos_query, list_image_paths

        
def main():
  ##### CREATE JSON AND BIN FILES #####
  #create_file = File4Faiss('./Database')
  #create_file.write_json_file(json_path='./', shot_frames_path='./scenes_txt')
  #create_file.write_bin_file(bin_path='./', json_path='./keyframes_id.json', method='cosine')

  ##### TESTING #####
  bin_file='dict/faiss_cosine.bin'
  json_path = 'dict/keyframes_id.json'

  cosine_faiss = MyFaiss('data/TransNetDatabase/KeyFrames' , bin_file, json_path)

  ##### IMAGE SEARCH #####
  i_scores, _, infos_query, i_image_paths = cosine_faiss.image_search(id_query=0, k=9)
  # cosine_faiss.write_csv(infos_query, des_path='/content/submit.csv')
  cosine_faiss.show_images(i_image_paths)

  ##### TEXT SEARCH #####
  text = 'Người nghệ nhân đang tô màu cho chiếc mặt nạ một cách tỉ mỉ. \
        Xung quanh ông là rất nhiều những chiếc mặt nạ. \
        Người nghệ nhân đi đôi dép tổ ong rất giản dị. \
        Sau đó là hình ảnh quay cận những chiếc mặt nạ. \
        Loại mặt nạ này được gọi là mặt nạ giấy bồi Trung thu.'

  scores, _, infos_query, image_paths = cosine_faiss.text_search(text, k=9)
  # cosine_faiss.write_csv(infos_query, des_path='/content/submit.csv')
  cosine_faiss.show_images(image_paths)

if __name__ == "__main__":
    main()