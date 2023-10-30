# Multi-User Video Search: Bridging the Gap Between Text and Embedding Queries

## Pipeline
<img src="./figs/pipeline.jpg" alt="image" style="zoom:50%;" />

## Dataset preparation
Dataset structure:
```
|- dict 
   |- ...
   |- faiss_clip_cosine.bin
   |- faiss_clipv2_cosine.bin
|- frontend
   |- ai
   |   |- public
   |   |   |- data
   |   |   |   |- KeyFrames
   |   |   |   |   |-L01
   |   |   |   |   |-L01_extra
   |   |   |   |   |-....
```

### Dict
Download dict zip file: [dict](https://drive.google.com/file/d/1pjArVhbXljkpCLpFGg71rh2yzwXGeJWi/view?usp=sharing)

### Vector embeddings:
Download bin file: 
   - [faiss_clip_cosine.bin](https://drive.google.com/file/d/1_3Z-iR5b3cT-QAfY6u1oUf9__YNju4m1/view?usp=sharing)
   - [faiss_clipv2_cosine.bin](https://drive.google.com/file/d/1CZDLrRlOK7jmvTc-p6jARR4BA6PSA61M/view?usp=sharing)

### Keyframes
Download keyframes zip file and extract to folder frontend/ai/public/data.\
Data part 1:
   - [AIC_KeyframesB1_Reduced](https://www.kaggle.com/datasets/khitrnhxun/aic-keyframesb1-reduced)
   - [AIC_KeyframesB1_Extra_Reduced](https://www.kaggle.com/datasets/khitrnhxun/aic-keyframesb1-extra-reduced)

Data part 2:
   - [AIC_KeyframesB2_Reduced](https://www.kaggle.com/datasets/khitrnhxun/aic-keyframesb2-reduced)
   - [AIC_KeyframesB2_Extra_Reduced](https://www.kaggle.com/datasets/khitrnhxun/aic-keyframesb2-extra-reduced)

Data part 3:
   - [AIC_KeyframesB3_Reduced](https://www.kaggle.com/datasets/khitrnhxun/aic-keyframesb3-reduced)
   - [AIC_KeyframesB2_Extra_Reduced_0](https://www.kaggle.com/code/khitrnhxun/aic-keyframesb3-extra-reduced-notebook-0)
   - [AIC_KeyframesB2_Extra_Reduced_1](https://www.kaggle.com/code/khitrnhxun/aic-keyframesb3-extra-reduced-notebook-1)
   - [AIC_KeyframesB2_Extra_Reduced_2](https://www.kaggle.com/code/khitrnhxun/aic-keyframesb3-extra-reduced-notebook-2)

## Raw video from AIChallenge 2023
Data part 1:
   - [AIC_VideoB1v1](https://www.kaggle.com/datasets/superheroinmordenday/c00-vidieo)
   - [AIC_VideoB1v2](https://www.kaggle.com/datasets/khitrnhxun/aic-videob1v2)

Data part 2:
   - [AIC_VideoB2](https://www.kaggle.com/datasets/superheroinmordenday/aic-vidieob1v2)

Data part 3:
   - [AIC_VideoB3v1](https://www.kaggle.com/datasets/khitrnhxun/aic-videob3-0)
   - [AIC_VideoB3v2](https://www.kaggle.com/datasets/superheroinmordenday/aic-b2-v3)
   - [AIC_VideoB3v3](https://www.kaggle.com/datasets/nguynlngnamanh/aic-videob3-2)

## Dataset extraction
Detailed on dataset extraction: [data](dataset_extraction/README.md)

## Installation
- ### Backend
```
conda create -n AIChallenge2023
conda activate AIChallenge2023
pip install git+https://github.com/openai/CLIP.git
pip install -r requirements.txt
```

- ### Frontend
Install nodejs: https://nodejs.org/en/download
```
npm install
```

- ### DB Sever
```
pip install flask
pip install flask-cors
pip install flask-socketio
pip install pyngrok==4.1.1
ngrok authtoken your_token # Add your ngrok authentication
```

## Usage
It is recommended to configure the environment using Anaconda. Linux support only.

- ### Backend
Using local machine, from root of repo:
```
python3 app.py
```
Using colaboratory, run appNotebook (App section) for starting the backend.

- ### Frontend
Change url in frontend/ai/src/helper/web_url.js. 
```
cd frontend/ai/
npm run dev
```

- ### DB Sever
Open 2 terminal and run:
```
python appStorage.py
```
```
ngrok http 5000
```

- ### Interface
<img src="./figs/interface.jpg" alt="image" style="zoom:50%;" />


