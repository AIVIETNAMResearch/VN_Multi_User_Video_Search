# Keyframe vector embeddings extraction
- Run [clip.ipynb](./clip.ipynb) for CLIP from [openai](https://github.com/openai/CLIP).
- Run [clipv2.ipynb](./clipv2.ipynb) for CLIP from [open_clip](https://github.com/mlfoundations/open_clip).

## Input directory:
```
|- Keyframes
   |- L01
   |- L01_extra
   |- L02
   |- L02_extra
   |- ...
```

## Output directory:
```
|- CLIP_features 
   |- L01
   |- L01_extra
   |- L02
   |- L02_extra
   |- ...
|- CLIPv2_features 
   |- L01
   |- L01_extra
   |- L02
   |- L02_extra
   |- ...
```