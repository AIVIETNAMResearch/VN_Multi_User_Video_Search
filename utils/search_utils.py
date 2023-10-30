import copy
import numpy as np
from utils.combine_utils import merge_searching_results_by_addition

def group_result_by_video(lst_scores, list_ids, list_image_paths, KeyframesMapper):
  result_dict = dict()
  for i, image_path in enumerate(list_image_paths):
    data_part, video_id, frame_id = image_path.replace('/data/KeyFrames/', '').replace('.webp', '').split('/')
    key = f'{data_part}_{video_id}'.replace('_extra', '')
    if 'extra' not in data_part:
      frame_id = KeyframesMapper[key][str(int(frame_id))]

    frame_id = int(frame_id)

    if not result_dict.get(key, False):
      result_dict[key] = {
          'lst_keyframe_paths': [],
          'lst_idxs': [],
          'lst_keyframe_idxs': [],
          'lst_scores': []
      }

    result_dict[key]['lst_keyframe_paths'].append(image_path)
    result_dict[key]['lst_idxs'].append(int(list_ids[i]))
    result_dict[key]['lst_keyframe_idxs'].append(frame_id)
    result_dict[key]['lst_scores'].append(float(lst_scores[i]))

  result = [{'video_id': key, 'video_info': value} for key, value in result_dict.items()]
  result = sorted(result, key= lambda x:x['video_info']['lst_scores'][0], reverse=True)

  return result

def search_by_filter(prev_result, text_query, k, mode, model_type, range_filter, ignore_index, keep_index, Sceneid2info, DictImagePath, CosineFaiss, KeyframesMapper):
  ignore_videos = None
  if ignore_index is not None:
    ignore_videos = dict()
    for idx in ignore_index:
      image_path = DictImagePath[idx]['image_path']
      data_part, video_id, frame_id = image_path.replace('/data/KeyFrames/', '').replace('.webp', '').split('/')
      key = f'{data_part}_{video_id}'.replace('_extra', '')
      if ignore_videos.get(key, False):
        ignore_videos[key].append(idx)
      else:
        ignore_videos[key] = [idx]
  
  filter_idx = []
  result_dict = dict()
  for item in prev_result:
    key = item['video_id']

    ignore_video = None
    if ignore_videos is not None and ignore_videos.get(key, False):
      ignore_video = ignore_videos[key]   
  
    if not result_dict.get(key, False):
      result_dict[key] = {
          'video_info': {
              'lst_keyframe_paths': [],
              'lst_idxs': [],
              'lst_keyframe_idxs': [],
              'lst_scores': []
          },
          'video_info_prev': item['video_info']
      }
    lst_idxs = item['video_info']['lst_idxs']
    lst_shots = []
    for idx in lst_idxs:
      scene_idx = DictImagePath[idx]['scene_idx']

      if scene_idx in lst_shots:
        continue

      if ignore_video is not None and idx in ignore_video:
        continue

      lst_shots.append(scene_idx)
      scene_idx = scene_idx.split('/')
      video_info = copy.deepcopy(Sceneid2info[scene_idx[0]][scene_idx[1]][scene_idx[2]])
      if mode == 1:
        start, end = int(scene_idx[3])+1, int(scene_idx[3])+range_filter
      else:
        start, end = int(scene_idx[3])-range_filter, int(scene_idx[3])-1

      for i in range(start, end):
        if 0 <= i < len(video_info):
          filter_idx.extend(video_info[str(i)]['lst_keyframe_idxs'])

  filter_idx = list(set(filter_idx))
  filter_idx = np.array(filter_idx).astype('int64')

  if keep_index is not None:
    filter_idx = np.intersect1d(filter_idx, keep_index)

  k = min(k, len(filter_idx))

  if model_type == 'both':
    scores_clip, list_clip_ids, _, _ = CosineFaiss.text_search(text_query, index=filter_idx, k=k, model_type='clip')
    scores_clipv2, list_clipv2_ids, _, _ = CosineFaiss.text_search(text_query, index=filter_idx, k=k, model_type='clipv2')
    lst_scores, list_ids = merge_searching_results_by_addition([scores_clip, scores_clipv2],
                                                               [list_clip_ids, list_clipv2_ids])
    infos_query = list(map(CosineFaiss.id2img_fps.get, list(list_ids)))
    list_image_paths = [info['image_path'] for info in infos_query]
  else:
    lst_scores, list_ids, _, list_image_paths = CosineFaiss.text_search(text_query, index=filter_idx, k=k, model_type=model_type)

  for i, image_path in enumerate(list_image_paths):
    data_part, video_id, frame_id = image_path.replace('/data/KeyFrames/', '').replace('.webp', '').split('/')
    key = f'{data_part}_{video_id}'.replace('_extra', '')
    if 'extra' not in data_part:
      frame_id = KeyframesMapper[key][str(int(frame_id))]

    result_dict[key]['video_info']['lst_keyframe_paths'].append(image_path)
    result_dict[key]['video_info']['lst_idxs'].append(int(list_ids[i]))
    result_dict[key]['video_info']['lst_keyframe_idxs'].append(int(frame_id))
    result_dict[key]['video_info']['lst_scores'].append(float(lst_scores[i]))

  result = []
  for key, value in result_dict.items():
    if value['video_info']['lst_keyframe_paths'] != []:
      result.append({
          'video_id': key,
          'video_info': value['video_info'],
          'video_info_prev': value['video_info_prev']
      })
  result = sorted(result, key= lambda x:x['video_info']['lst_scores'][0] + x['video_info_prev']['lst_scores'][0], reverse=True)

  return result