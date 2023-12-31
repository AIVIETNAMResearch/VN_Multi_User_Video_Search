# Dataset extraction
## Pipeline
<p align="center" width="100%">
    <img width="25%" src="../figs/data_preprocessing.jpg"> 
</p>

## Data directory
Prepare data directory as:
```
|- AIC_Video 
   |- Videos_L01
   |- Videos_L02
   |- ...
|- AIC_Video 
   |- Videos_L01
   |- Videos_L02
   |- ...

```

## Usage
- Keyframe extraction: [transnet](transnet/README.md)
- Audio extraction: [audio](audio/README.md)
- Metadata extraction: [metadata](metadata/README.md)
- Clip features extraction:: [clip](clip/README.md)
- Run [create.ipynb](./create.ipynb) for bin generation
- Run [data_preparation.ipynb](./data_preparation.ipynb)