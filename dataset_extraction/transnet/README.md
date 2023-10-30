# Keyframe extraction
- Run [transnetv2.ipynb](./transnetv2.ipynb) to extract shots from videos.
- Run [cutframe.ipynb](./cutframe.ipynb) to extract keyframes from shots.

## Input directory:
```
|- AIC_Video 
   |- Videos_L01
   |- Videos_L02
   |- ...
```

## Output directory:
```
|- SceneJSON 
   |- L01
   |- L02
   |- ...
|- Keyframes
   |- L01_extra
   |- L02_extra
   |- ...
```