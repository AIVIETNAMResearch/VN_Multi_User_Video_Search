import os
import glob
import torch
import json
import numpy as np
import sys
from typing import List
import torch.nn.functional as F
import faiss
from transformers import AutoTokenizer, AutoModel
import gc
from tqdm import tqdm

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

class semantic_extract:
    def __init__(
            self,
            model = 'sentence-transformers/stsb-xlm-r-multilingual',
            context_path = os.path.join(PROJECT_ROOT, "dict/captions"),
            context_vector_path = os.path.join(PROJECT_ROOT, "data/TransNetDatabase/CaptionFeatures/context_vector.npy"),
            input_datatype = 'txt',
            output_datatype = 'torch',
    ):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = AutoModel.from_pretrained(model).to(self.device)
        self.tokenizer = AutoTokenizer.from_pretrained(model)
        self.context_path = context_path
        self.context_vector_path = context_vector_path
        if not os.path.exists(context_vector_path):
            self.raw_data = self.generate_context_embedding(context_path, context_vector_path, output_datatype, input_datatype)
        else:
            self.raw_data = self.generate_raw_data(context_path, input_datatype)

    def get_embedding(
            self,
            inputs:List,
    ):
        encode_inputs = self.tokenizer(inputs, padding=True, truncation=True, return_tensors='pt', return_token_type_ids=True, return_attention_mask =True,)
        with torch.no_grad():
            model_output = self.model(
                input_ids = encode_inputs['input_ids'].to(self.device),
                attention_mask = encode_inputs['attention_mask'].to(self.device),
                token_type_ids = encode_inputs['token_type_ids'].to(self.device),
            )
            sentences_embed = self.mean_pooling(model_output, encode_inputs['attention_mask'].to(self.device))
            sentences_embed = F.normalize(sentences_embed, p=2, dim=1)
        gc.collect()
        torch.cuda.empty_cache()
        return sentences_embed
    
    @staticmethod
    def mean_pooling(model_output, attention_mask):
        token_embeddings = model_output[0] #First element of model_output contains all token embeddings
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    
    @staticmethod
    def generate_raw_data(
            context_path,
            type_input:str='txt',
    ):
        raw_data = []
        if type_input=='txt':
            # context_path is a list of file path
            if isinstance(context_path, list):
                paths = glob.glob(context_path +'/*.txt')
                for path in paths:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = f.readlines()
                        data = [word.strip() for word in data]
                        raw_data.extend(data)
            else:
                # context path is one string
                with open(context_path, 'r', encoding='utf-8') as f:
                    raw_data = f.readlines()
                    raw_data = [word.strip() for word in raw_data]
        elif type_input=='json': #input type json
            context_paths = glob.glob(os.path.join(context_path, '*'))
            context_paths.sort()
            for cxx_context_path in context_paths:
                paths = glob.glob(cxx_context_path + '/*.json')
                paths.sort(reverse=False, key=lambda x: int(x[-8:-5]))
                for path in paths:
                    with open(path) as f:
                        data = ["nan" if (x =='' or x==[]) else x for x in json.load(f)]
                        raw_data += data
        else:
            print(f'not support reading {type_input}')
            sys.exit()
        return raw_data

    def generate_context_embedding(
            self,
            context_path,
            save_tensor_path,
            type_output:str,
            type_input:str='txt',
    ):
        raw_data = self.generate_raw_data(context_path, type_input)
        chunk_range = 100
        context_embedding = []
        print('running embedding: ')
        for i in tqdm(range(0, len(raw_data), chunk_range)):
            context_embedding.append(self.get_embedding(raw_data[i:i+chunk_range]))
        context_embedding = torch.cat(context_embedding)

        if not os.path.exists(os.path.abspath(os.path.join(save_tensor_path, '..'))):
            os.mkdir(os.path.abspath(os.path.join(save_tensor_path, '..')))
        
        if type_output=='numpy':
            numpy_context_embedding = context_embedding.cpu().numpy()
            np.save(save_tensor_path, numpy_context_embedding)
        elif type_output=='torch':
            torch_context_embedding = context_embedding.cpu()
            torch.save(torch_context_embedding, save_tensor_path)
        elif type_output=='bin':
            index = faiss.IndexFlatL2(context_embedding.shape[-1])
            print('running save faiss: ')
            for vector in tqdm(context_embedding.cpu().numpy()):
                index.add(vector.reshape(1, -1))
            faiss.write_index(index, save_tensor_path)
        return raw_data