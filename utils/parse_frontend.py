import numpy as np

def parse_data(search_items, VisualEncoder):
    bboxes = []
    labels = []
    colors = []
    bboxes_colors = []
    for item in search_items['dragObject']:
      type_ = item['type']
      x0, y0, x1, y1 = item['position']['xTop'], item['position']['yTop'], item['position']['xBottom'], item['position']['yBottom']
      if type_ in VisualEncoder.colors:
        bboxes_colors.append([x0, y0, x1, y1])
        colors.append(type_)
      else:
        bboxes.append([x0, y0, x1, y1])
        labels.append(VisualEncoder.classes2idx[type_])
    
    if bboxes == []:
      bboxes = labels = None
    else:
      bboxes = np.array(bboxes)
      labels = np.array(labels)

    if bboxes_colors == []:
      bboxes_colors = colors = None
    else:
      bboxes_colors = np.array(bboxes_colors)
      colors = np.array(colors)

    input_encoded = VisualEncoder.encode(bboxes=bboxes, labels=labels, 
                                        bboxes_colors=bboxes_colors,
                                        colors=colors)

    tags = search_items['tags']
    if tags == []:
      input_encoded['tag'] = None
    else:
      input_encoded['tag'] = ' '.join(map(str, tags)) 

    amount = search_items['amount']
    if amount == "":
      input_encoded['number'] = None
    else:
      amount = amount.split(',')
      amount = [item.replace(' ', '')for item in amount]
      amount = ' '.join(map(str, amount))
      input_encoded['number'] = amount

    if all(value == None for value in input_encoded.values()):
      return None
    else:
      return input_encoded