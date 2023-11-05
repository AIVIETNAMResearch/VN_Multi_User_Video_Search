# Keyframe extraction
- Run [transnetv2.ipynb](./transnetv2.ipynb) to extract shots from videos.
- Run [cutframe.ipynb](./cutframe.ipynb) to extract keyframes from shots.

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