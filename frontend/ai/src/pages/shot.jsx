import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoadingIcon from "../components/LoadingIcon";
import ImageListShot from "../components/ImageListShot";
import { web_url, socket_url, server, session } from "../helper/web_url";
import Questions from "../components/Questions";
import Lock from "../components/Lock";
// import useSpeechToText from 'react-hook-speech-to-text';

const io = require("socket.io-client");
const socket = io(socket_url, {
  withCredentials: true,
  extraHeaders: {
    "ngrok-skip-browser-warning": "69420",
  },
});

let videoId;
function video() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [username, setUsername] = useState("");
  const [lockUsernameInput, setLockUsernameInput] = useState(true);
  const [questionName, setQuestionName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (router.query.questionName !== "") {
      setQuestionName(router.query.questionName);
    }
    if (router.query.id !== undefined)
      fetch(`${web_url}/getvideoshot?imgid=${router.query.id}`, {
        method: "get",
        headers: new Headers({
          "ngrok-skip-browser-warning": "69420",
        }),
      })
        .then((data) => data.json())
        .then((data) => {
          console.log(router);
          setVideos(data);
          videoId = `${data.collection}_${data.video_id}`;
          setLoading(false);
        })
        .catch((e) => console.log(e));
  }, [router.isReady]);

  useEffect(() => {
    console.log(videos.selected_shot);
    const selected = document.getElementById(videos.selected_shot);
    if (selected) {
      selected.className += `ring-2 p-2 ring-orange-500 bg-red-300 my-8`;
      selected.scrollIntoView();
    }
  }, [videos]);

  const getOwnedQuestions = (username) => {
    setQuestionsLoading(true);
    fetch(`${socket_url}/getquestions`, {
      method: "post",
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        username: username,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        // console.log(res);
        if (JSON.stringify(res) !== JSON.stringify(questions)) {
          // console.log("set");
          setQuestions(res);
        }
        setQuestionsLoading(false);
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    if (
      localStorage.getItem("username") === undefined
      // localStorage.getItem("username").length === 0
    ) {
      alert("Input username (only first time)");
      document.getElementById("username").focus();
    } else {
      setUsername(localStorage.getItem("username"));
      // getOwnedQuestions(localStorage.getItem("username"));
    }
  }, []);

  const handleUsername = (name) => {
    localStorage.setItem("username", name);
    setUsername(name);
  };

  useEffect(() => {
    getOwnedQuestions(username);
  }, [username]);

  const handleSelect = (id, video) => {
    if (window.confirm(`Do you want to submit id ${id} in video ${video}?`)) {
      fetch(`${server}?item=${video}&frame=${id}&session=${session}`)
        .then((res) => res.json())
        .then((res) => {
          alert(`Description: ${res.description}. Status: ${res.status}`);
        })
        .catch((e) => alert(e));
    }
  };

  const addView = (id) => {
    if (questionName === "") {
      alert("Choose question first");
    } else {
      socket.emit("submit", {
        questionName: questionName,
        idx: id,
        user: username,
      });
    }
  };

  if (loading) return <LoadingIcon />;
  else if (Object.keys(videos).length !== 0) {
    return (
      <div
        className="flex flex-col"
        onClick={() => {
          document.getElementById("questions").style.display = "none";
        }}
      >
        <div className="w-full flex justify-around fixed top-0 items-center z-10 bg-slate-950 flex-auto">
          <h1 className=" text-center text-4xl my-2 ml-14">
            Collection:{" "}
            <span className="text-orange-500">{videos.collection}</span> Video
            id: <span className="text-amber-500">{videos.video_id}</span>
          </h1>
          <div className="ml-auto questionname h-fit w-fit flex flex-col relative">
            <input
              value={questionName}
              id="questionName"
              tabIndex={1}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  document.getElementById("send").click();
                }
              }}
              onFocus={(e) => {
                // e.stopPropagation();
                document.getElementById("questions").style.display = "flex";
              }}
              onClick={(e) => {
                e.stopPropagation();
                getOwnedQuestions(username);
              }}
              type="search"
              placeholder="Get Question..."
              className="w-40 relative transition-all hover:drop-shadow-[0px_4px_3px_rgba(255,255,255,0.2)] placeholder:italic text-slate-300 relative  p-1 pl-4 rounded-full bg-slate-800"
              onChange={(e) => {
                setQuestionName(e.target.value);
              }}
            />
            <Questions
              isLoading={questionsLoading}
              questions={questions}
              username={username}
              setQuestionName={setQuestionName}
            />
          </div>
          <div className="relative username mr-12">
            <input
              tabIndex={1}
              id="username"
              value={username}
              autoComplete="off"
              // disabled={lockUsernameInput}
              readOnly={lockUsernameInput}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  document.getElementById("lock").click();
                }
              }}
              type="search"
              placeholder="Username..."
              className={`w-28 transition-all  
              placeholder:italic text-slate-300 relative p-1 pl-4 rounded-full
              ${
                lockUsernameInput
                  ? "bg-transparent border border-white/50 outline-none cursor-no-drop"
                  : "bg-slate-800"
              }
              `}
              onChange={(e) => {
                handleUsername(e.target.value);
              }}
            />
            <Lock lock={lockUsernameInput} setLock={setLockUsernameInput} />
          </div>
        </div>
        <div className=" flex-auto flex-col overflow-auto flex  h-full py-4 gap-2 border-md">
          {Object.values(videos.shots).map((shot, idx) => {
            const index = Object.keys(videos.shots)[idx];
            return (
              <div
                id={index}
                className="rounded-md flex-none relative mx-20 h-min overflow-x-auto overflow-y-clip flex flex-nowrap justify-start"
              >
                <span
                  style={{ overflowWrap: "break-word", zIndex: 2 }}
                  className="flex-none text-amber-500 sticky top-0 left-0 text-3xl bg-slate-950 rounded-md h-fit w-fit text-center my-auto "
                >
                  {index}
                </span>
                <div
                  style={{
                    overflowX: "auto",
                    flex: "none",
                    overflowY: "clip",
                    justifyContent: "space-around",
                  }}
                  classname="relative flex-none overflow-x-auto overflow-y-clip flex flex-nowrap h-max flex-auto justify-around"
                >
                  {shot.lst_keyframe_paths.map((path, index) => (
                    <ImageListShot
                      addView={addView}
                      imagepath={path}
                      id_show={shot.lst_keyframe_idxs[index]}
                      id={shot.lst_idxs[index]}
                      handleSelect={() =>
                        handleSelect(shot.lst_keyframe_idxs[index], videoId)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default video;
