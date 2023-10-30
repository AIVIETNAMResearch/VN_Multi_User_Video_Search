import os
import json
from flask_cors import CORS
from flask_socketio import emit, SocketIO
from flask import Flask, jsonify, request

app = Flask(__name__, template_folder="templates")
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

###################### Initialize dict ########################
json_path = "dict/id2img_fps.json"
back_up_folder = "back_up"
if not os.path.exists(back_up_folder):
    os.mkdir(back_up_folder)
with open(json_path, "r") as f:
    DictImagePath = json.load(f)
    DictImagePath = {int(k): v for k, v in DictImagePath.items()}
with open("dict/map_keyframes.json", "r") as f:
    KeyframesMapper = json.load(f)

if os.path.exists(f"{back_up_folder}/answer.json"):
    with open(f"{back_up_folder}/answer.json", "r") as f:
        AnswerDict = json.load(f)
else:
    AnswerDict = dict()

if os.path.exists(f"{back_up_folder}/user.json"):
    with open(f"{back_up_folder}/user.json", "r") as f:
        UserDict = json.load(f)
else:
    UserDict = dict()

if os.path.exists(f"{back_up_folder}/reorder_status.json"):
    with open(f"{back_up_folder}/reorder_status.json", "r") as f:
        ReorderStatus = json.load(f)
else:
    ReorderStatus = dict()

if os.path.exists(f"{back_up_folder}/answer_ignore.json"):
    with open(f"{back_up_folder}/answer_ignore.json", "r") as f:
        AnswerIgnoreDict = json.load(f)
else:
    AnswerIgnoreDict = dict()
###############################################################

####################### Helper Utils ##########################
def store_answer():
    with open(f"{back_up_folder}/answer.json", "w") as f:
        json.dump(AnswerDict, f)

def store_user():
    with open(f"{back_up_folder}/user.json", "w") as f:
        json.dump(UserDict, f)

def store_status():
    with open(f"{back_up_folder}/reorder_status.json", "w") as f:
        json.dump(ReorderStatus, f)

def store_ignore():
    with open(f"{back_up_folder}/answer_ignore.json", "w") as f:
        json.dump(AnswerIgnoreDict, f)

def add_submit(ques_name, ques_idx):
    ques_idx = int(ques_idx)
    if not AnswerDict.get(ques_name, False):
        AnswerDict[ques_name] = [ques_idx]
    else:
        if ques_idx not in AnswerDict[ques_name]:
            AnswerDict[ques_name].append(ques_idx)
    if not ReorderStatus.get(ques_name, False):
        ReorderStatus[ques_name] = dict(status=False, owner="")
        store_status()
    store_answer()

def add_ignore(ques_name, ques_idx, autoIgnore):
    if not isinstance(ques_idx, list):
        ques_idx = [ques_idx]
    
    for i in range(len(ques_idx)):
        ques_idx[i] = int(ques_idx[i])

    if not AnswerIgnoreDict.get(ques_name, False):
        AnswerIgnoreDict[ques_name] = ques_idx
    else:
        for idx in ques_idx:
            if idx not in AnswerIgnoreDict[ques_name]:
                AnswerIgnoreDict[ques_name].append(idx)
            elif not autoIgnore:
                AnswerIgnoreDict[ques_name].remove(idx)
    store_ignore()

def add_user(user, ques_name):
    if not UserDict.get(user, False):
        UserDict[user] = [ques_name]
    else:
        if ques_name not in UserDict[user]:
            UserDict[user].append(ques_name)
            UserDict[user] = sorted(UserDict[user])
    store_user()

def clear_submit_helper(ques_name, ques_idx):
    if AnswerDict.get(ques_name, False):
        if ques_idx in AnswerDict[ques_name]:
            AnswerDict[ques_name].remove(ques_idx)
    else:
        print(f"Question name: {ques_name} not exist")
    store_answer()

def clear_ignore_helper(ques_name, ques_idx):
    if AnswerIgnoreDict.get(ques_name, False):
        if ques_idx in AnswerIgnoreDict[ques_name]:
            AnswerIgnoreDict[ques_name].remove(ques_idx)
    else:
        print(f"Question name: {ques_name} not exist")
    store_ignore()

def index2info(lst_idxs):
    info = {
        "lst_idxs": lst_idxs,
        "lst_keyframe_idxs": [],
        "lst_keyframe_paths": [],
        "lst_video_idxs": [],
    }
    for idx in lst_idxs:
        image_path = DictImagePath[idx]["image_path"]
        data_part, video_id, frame_id = (
            image_path.replace("/data/KeyFrames/", "").replace(".webp", "").split("/")
        )
        key = f"{data_part}_{video_id}".replace("_extra", "")
        if "extra" not in data_part:
            frame_id = KeyframesMapper[key][str(int(frame_id))]
        frame_id = int(frame_id)

        info["lst_keyframe_idxs"].append(frame_id)
        info["lst_keyframe_paths"].append(image_path)
        info["lst_video_idxs"].append(key)
    return info

def check_owned_all(username):
    # return all questions after getting checked ownership
    all_ques = sorted(list(AnswerDict.keys()))
    checked_ques = []

    if not UserDict.get(username, False):
        for ques in all_ques:
            checked_ques.append({"question": ques, "owned": False})
        return checked_ques

    # if user exists
    for ques in all_ques:
        if ques in UserDict[username]:
            checked_ques.append({"question": ques, "owned": True})
        else:
            checked_ques.append({"question": ques, "owned": False})

    print(f"res: {checked_ques}")
    return checked_ques

def check_ignore():
    return list(AnswerIgnoreDict.keys())
###############################################################

##################### Submit ##################################
@socketio.on("submit")
def submit(data):
    print("submit")
    ques_name = data["questionName"]
    ques_idx = int(data["idx"])
    user = data["user"]
    add_submit(ques_name, ques_idx)
    add_user(user, ques_name)
    result = {"questionName": ques_name, "data": index2info(AnswerDict[ques_name])}
    emit("submit", result, broadcast=True)

@socketio.on("clearsubmit")
def clear_submit(data):
    print("clear submit")
    ques_name = data["questionName"]
    ques_idx = int(data["idx"])
    clear_submit_helper(ques_name, ques_idx)
    result = {"questionName": ques_name, "data": index2info(AnswerDict[ques_name])}
    emit("clearsubmit", result, broadcast=True)

##################### Ignore #################################
@socketio.on("ignore")
def ignore(data):
    print("ignore")
    ques_name = data["questionName"]
    ques_idx = data["idx"]
    add_ignore(ques_name, ques_idx, data["autoIgnore"])
    result = {"questionName": ques_name, "data": AnswerIgnoreDict[ques_name]}
    emit("ignore", result, broadcast=True)

@socketio.on("clearignore")
def clear_ignore(data):
    print("clear ignore")
    ques_name = data["questionName"]
    ques_idx = data["idx"]
    clear_ignore_helper(ques_name, ques_idx)
    result = {"questionName": ques_name, "data": index2info(AnswerIgnoreDict[ques_name])}
    emit("clearsubmit", result, broadcast=True)

##################### Reorder #################################
@socketio.on("reorder")
def reorder(data):
    print("re order")
    ques_name = data["questionName"]
    lst_idxs = data["data"]["lst_idxs"]
    if AnswerDict.get(ques_name, False):
        AnswerDict[ques_name] = lst_idxs
        store_answer()
    
    # Reset status of active_reorder once received reroder
    ReorderStatus[ques_name]["status"] = False
    ReorderStatus[ques_name]["owner"] = ""

    result = {"questionName": ques_name, "data": index2info(AnswerDict[ques_name])}
    emit("reorder", result, broadcast=True)

@socketio.on("activereorder")
def active_reorder(data):
    print("active reorder")
    ques_name = data["questionName"]
    user = data["user"]
    is_admin = data["isAdmin"]
    status = {
        "ques_name": ques_name,
        "user": user,
        "is_accepted": False,
    }
    # If is_admin: pass
    if ReorderStatus[ques_name]["status"] and not is_admin:
        print("Reorder an active question error !!!!")
        # emit's first argument must be the same name as that of the channel on client-side
        emit("activereorder", status, broadcast=True)
    else:
        ReorderStatus[ques_name]["status"] = True
        ReorderStatus[ques_name]["owner"] = user
        status["is_accepted"] = True
        emit("activereorder", status, broadcast=True)

@socketio.on("viewsubmitted")
def view_submitted(data):
    print("view submitted")
    ques_name = data["questionName"]
    if AnswerDict.get(ques_name, False):
        result = {"questionName": ques_name, "data": index2info(AnswerDict[ques_name])}
        emit("viewsubmitted", result, broadcast=True)
    else:
        emit("viewsubmitted", {}, broadcast=True)

@app.route("/getallques")
def get_all_ques():
    all_ques = sorted(list(AnswerDict.keys()))
    return jsonify(all_ques)

@app.route("/getsubmitques", methods=["POST"], strict_slashes=False)
def get_submit_ques():
    user = request.json["user"]
    if UserDict.get(user, False):
        return jsonify(UserDict[user])
    else:
        return jsonify([])

@app.route("/getquestions", methods=["POST"], strict_slashes=False)
def get_questions():
    username = request.json['username']
    checked_ques = check_owned_all(username)
    return jsonify(checked_ques)

@app.route("/getignoredquestions", methods=["POST"], strict_slashes=False)
def get_ignored_questions():
    return jsonify(check_ignore())

@app.route("/getignore", methods=["POST"], strict_slashes=False)
def get_ignore():
    ques_name = request.json['questionName']
    if AnswerIgnoreDict.get(ques_name, False):
        result = {"questionName": ques_name, "data": AnswerIgnoreDict[ques_name]}
    else:
        result = {"questionName": ques_name, "data": []}
    return jsonify(result)

# Running app
if __name__ == "__main__":
    socketio.run(app)
