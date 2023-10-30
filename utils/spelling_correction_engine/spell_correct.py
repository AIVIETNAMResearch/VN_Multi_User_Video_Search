from transformers import pipeline
import torch
from typing import List
import sys

class spelling:
    def __init__(
            self,
            model = "bmd1905/vietnamese-correction",
    ):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.corrector = pipeline("text2text-generation", model=model, device=self.device)
    
    def __call__(self, texts):
        if isinstance(texts, str):
            return self.corrector(texts)
        elif isinstance(texts, List):
            result = []
            for text in texts:
                result.append(self.corrector(text))
            return result
        else:
            print("Not support this data type for spelling correction only support list or string")
            sys.exit()

if __name__ == '__main__':
    # obj = spelling()
    # inputs= "cau lày viết sai chính tỏa"
    # print(obj("inputs"))
    pass