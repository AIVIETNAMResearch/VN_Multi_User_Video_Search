import cv2
import torch
import numpy as np
import matplotlib.pyplot as plt
from torchvision.ops import box_iou

class VisualEncoding:
  def __init__(self,
                classes = ('person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train',
                           'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign',
                           'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep',
                           'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
                           'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard',
                           'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard',
                           'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork',
                           'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
                           'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
                           'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv',
                           'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave',
                           'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase',
                           'scissors', 'teddy bear', 'hair drier', 'toothbrush'),
                colors = ('black', 'blue', 'brown', 'green', 'grey', 'orange_', 'pink', 'purple',
                          'red', 'white', 'yellow'),
                row_str = ["0", "1", "2", "3", "4", "5", "6"],
                col_str = ["a", "b", "c", "d", "e", "f", "g"]):
    self.classes = classes
    self.colors = colors
    self.classes2idx = dict()
    for i, class_ in enumerate(classes):
      self.classes2idx[class_] = i
    self.n_row = len(row_str)
    self.n_col = len(col_str)

    x_pts = np.linspace(0, 1, self.n_row+1)
    y_pts = np.linspace(0, 1, self.n_col+1)

    self.grid_bboxes = []
    self.grid_labels = []
    for i in range(self.n_row):
      for j in range(self.n_col):
        label = col_str[j] + row_str[i]
        self.grid_bboxes.append([x_pts[j], y_pts[i], x_pts[j+1], y_pts[i+1]])
        self.grid_labels.append(label)

    self.grid_bboxes = np.array(self.grid_bboxes)

  def visualize_grid(self, grid_vis=None):
    if grid_vis is None:
      grid_vis = np.zeros((500, 500, 1))

    vis_h, vis_w, _ = grid_vis.shape
    font = cv2.FONT_HERSHEY_SIMPLEX
    fontScale = 0.5
    color = (255, 0, 0)
    thickness = 2
    for i in range(self.n_row*self.n_col):
      x_start, y_start, x_end, y_end = self.grid_bboxes[i]
      label = self.grid_labels[i]
      org = (int((x_start + (x_end-x_start)/2)*vis_w), int((y_start + (y_end-y_start)/2)*vis_h))

      # Draw text
      grid_vis = cv2.putText(grid_vis, label, org, font,
                            fontScale, color, thickness, cv2.LINE_AA)
      # Draw grid
      grid_vis = cv2.rectangle(grid_vis, (int(x_start*vis_w), int(y_start*vis_h)), (int(x_end*vis_w), int(y_end*vis_h)), color, thickness)


    plt.imshow(grid_vis)

  def encode_bboxes(self, bboxes, labels):
    '''
    Args:
        bboxes: np.array: (n_bboxes, 4) - expected normalized bbox in form (x0, y0, x1, y1)
        labels: np.array: (n_bboxes, )
    '''
    iou = box_iou(torch.as_tensor(bboxes), torch.as_tensor(self.grid_bboxes))
    bboxes_idx, locs_idx = np.nonzero(iou.numpy())

    context = []
    for bbox_idx, loc_idx in zip(bboxes_idx, locs_idx):
      context.append(self.grid_labels[loc_idx] + self.classes[labels[bbox_idx]].replace(" ", ""))
    context = ' '.join(map(str, context))
    return context

  def encode_classes(self, labels):
    '''
    Args:
        labels: np.array: (n_bboxes, )
    '''
    unique_classes, counts = np.unique(labels, return_counts=True)
    context = []
    for unique_class, count in zip(unique_classes, counts):
      for i in range(count):
        context.append(self.classes[unique_class].replace(" ", "") + str(i))
    context = ' '.join(map(str, context))
    return context
  
  def encode_colors(self, bboxes, colors):
    '''
    Args:
        bboxes: np.array: (n_bboxes, 4) - expected normalized bbox in form (x0, y0, x1, y1)
        colors: np.array: (n_bboxes, )
    '''
    iou = box_iou(torch.as_tensor(bboxes), torch.as_tensor(self.grid_bboxes))
    bboxes_idx, locs_idx = np.nonzero(iou.numpy())

    context = []
    for bbox_idx, loc_idx in zip(bboxes_idx, locs_idx):
      context.append(self.grid_labels[loc_idx] + colors[bbox_idx].replace("_", ""))
    context = ' '.join(map(str, context))
    return context

  def encode(self, bboxes=None, labels=None, bboxes_colors=None, colors=None):
    '''
    Args:
        bboxes: np.array: (n_bboxes, 4) - expected normalized bbox in form (x0, y0, x1, y1)
        labels: np.array: (n_bboxes, )
    '''
    results = dict()
    if bboxes is not None:
      results['bbox'] = self.encode_bboxes(bboxes, labels)
      results['class'] = None
    else:
      results['bbox'] = results['class'] = None
    
    if bboxes_colors is not None:
      results['color'] = self.encode_colors(bboxes_colors, colors)
    else:
      results['color'] = None

    return results
