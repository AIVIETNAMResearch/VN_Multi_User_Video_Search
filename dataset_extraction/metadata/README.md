# Metadata extraction
- Run [color.ipynb](./color.ipynb) to extract colors from keyframes.
- Run [ocr.ipynb](./ocr.ipynb) to detect ocr from keyframes.
- Run [od.ipynb](./od.ipynb) to detect objects from keyframes.
- Run [tag.ipynb](./od.ipynb) to extract tags from keyframes.

## Input directory:
```
|- Keyframes 
   |- L01
   |- L01_extra
   |- ...
```

## Output directory:
```
|- context_encoded 
   |- bboxes_encoded
   |- classes_encoded
   |- colors_encoded
   |- number_encoded
   |- tags_encoded
|- ocr
   |- L01
   |- L01_extra
   |- ...
```