import { useState } from "react";
import SearchTag from "./SearchTag";
import React from "react";
import DragObject from "./DragObject.jsx";
import { icons } from "../helper/icons.js";
import Icon from "./Icon.jsx";
import { web_url, socket_url } from "../helper/web_url.js";
import ImageListVideoPanel from ".//ImageListVideoPanel.jsx";
import GetTagRec from "./GetTagRec";
import LoadingIcon from "./LoadingIcon";
import VideoWrapper from "./VideoWrapper.jsx";
import PageButton from "./PageButton";

const VIDEO_PER_PAGE = 7;

function panel({
  id,
  handleKNN,
  recTags,
  setRecTags,
  toggleFullScreen,
  handleSelect,
  handleIgnore,
  ignore,
  getIgnoredImages,
  questionName,
  autoIgnore,
  searchSpace,
  socket,
  addView
}) {
  const [asr, setAsr] = useState("");
  const [panelK, setPanelK] = useState(500);
  const [dragObject, setDragObject] = useState([]);
  const [videos, setVideos] = useState([]);
  const [useid, setUseid] = useState(true);
  const [page, setPage] = useState(0);
  const PANEL_SIZE = 270;
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSearch, setActiveSearch] = useState(icons);
  const [maxObj, setMaxObj] = useState("");
  const [ocr, setOcr] = useState("");
  //trie
  let trie = require("trie-prefix-tree");
  let myTrie = trie(icons);

  const handleChange = (e) => {
    if (e.target.value === "") setActiveSearch(icons);
    else setActiveSearch(myTrie.getPrefix(e.target.value).slice(0, 10));
  };

  const addTag = (tag) => {
    setTags([...tags, tag]);
  };

  const fetchGetObj = {
    method: "get",
    headers: new Headers({
      "ngrok-skip-browser-warning": "69420",
    }),
  };

  const handleCreate = (type) => {
    setDragObject([
      ...dragObject,
      {
        type: type,
        position: {
          xTop: 0,
          yTop: 0,
          xBottom: 0.1,
          yBottom: 0.1,
        },
      },
    ]);
  };

  const handleMove = () => {
    const newDragObject = dragObject.map((object, index) => {
      const { offsetTop, offsetLeft, offsetWidth, offsetHeight } =
        document.getElementById(`${object.type}${index}`);
      let [topRatio, leftRatio] = [
        offsetTop / PANEL_SIZE,
        offsetLeft / PANEL_SIZE,
      ];
      let diff =
        Math.sqrt(offsetHeight ** 2 + offsetWidth ** 2) /
        (PANEL_SIZE * Math.sqrt(2));
      let xBottom = topRatio + diff,
        yBottom = leftRatio + diff;
      if (topRatio < 0) topRatio = 0;
      if (leftRatio < 0) leftRatio = 0;
      if (topRatio + diff > 1) xBottom = 1;
      if (leftRatio + diff > 1) yBottom = 1;

      return {
        ...object,
        position: {
          xTop: topRatio,
          yTop: leftRatio,
          xBottom: xBottom,
          yBottom: yBottom,
        },
      };
    });
    setDragObject(newDragObject);
    // sendPanel();
  };

  const clearPanel = () => {
    setDragObject([]);
  };
  const clearTags = () => {
    setTags([]);
  };

  const panelFetch = (ignoreIndexes) => {
    fetch(`${web_url}/panel`, {
      method: "post",
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        tags: tags,
        dragObject: dragObject,
        id: id,
        useid: useid,
        amount: maxObj,
        ocr: ocr,
        asr: asr,
        k: panelK,
        ignore: ignore,
        ignore_idxs: ignoreIndexes,
        questionName: questionName,
        search_space: searchSpace
      }),
    })
      .then((data) => data.json())
      .then((res) => {
        console.log(res);
        setPage(0);
        setVideos(res);
        setLoading(false);
      })
      .catch((e) => alert("Fetch failed!" + e));
  };

  const sendPanel = () => {
    let ignoreIndexes;
    setLoading(true);
    if (ignore) {
      fetch(`${socket_url}/getignore`, {
        method: "post",
        headers: new Headers({
          "ngrok-skip-browser-warning": "69420",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          questionName: questionName,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          ignoreIndexes = data.data;
          panelFetch(ignoreIndexes);
        });
    } else panelFetch(ignoreIndexes);
  };

  const handleAutoIgnore = (page) => {
    if (questionName === "") alert("Type question first");
    else {
      const lst_video = videos.slice(
        page * VIDEO_PER_PAGE,
        page * VIDEO_PER_PAGE + VIDEO_PER_PAGE
      );
      let lst_idxs = [];
      lst_video.forEach((video) => {
        lst_idxs.push(...video.video_info.lst_idxs);
      });
      console.log(lst_idxs);
      // Remember to alert when user forgets to set questions
      socket.emit("ignore", {
        questionName: questionName,
        idx: lst_idxs,
        autoIgnore: true,
      });
    }
  };

  return (
    <div className="flex-col flex w-[728px] h-full flex-none">
      <div className="flex w-[728px] justify-around mt-2 flex-auto">
        {/* {search & icons} */}
        <div className="flex flex-col w-[210px] mx-1">
          <div className="mb-1 relative w-full hover:drop-shadow-[0px_2px_1px_rgba(255,255,255,0.2)]">
            <input
              tabIndex={-1}
              type="search"
              placeholder="Search icons"
              className="hover:ease-in-out transition-all placeholder:italic text-slate-300  relative w-full p-1 pl-4 rounded-full bg-slate-800"
              onChange={(e) => handleChange(e)}
            ></input>
          </div>
          <div className="flex flex-wrap h-[140px] overflow-auto">
            {activeSearch.map((icon) => (
              <Icon
                handleCreate={handleCreate}
                type={icon}
                color={false}
                key={icon + false}
              />
            ))}
          </div>
          <div className="flex flex-wrap h-[70px] overflow-auto">
            {[
              "red",
              "white",
              "yellow",
              "black",
              "blue",
              "brown",
              "gray",
              "green",
              "orange_",
              "pink",
              "purple",
            ].map((color) => (
              <Icon
                handleCreate={handleCreate}
                type={color}
                color={true}
                key={color + true}
              />
            ))}
          </div>
        </div>
        {/* {panel} */}
        <div className="shadow-lg shadow-slate-900 rounded relative h-[270px] w-[270px] shrink-0 grow-0 bg-slate-100">
          {[1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7].map((ratio) => (
            <div
              style={{ left: ratio * PANEL_SIZE }}
              className="absolute w-0.5 h-full bg-slate-800 opacity-50"
              key={`left ${ratio}`}
            ></div>
          ))}
          {[1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7].map((ratio) => (
            <div
              style={{ top: ratio * PANEL_SIZE }}
              key={`top ${ratio}`}
              className="absolute h-0.5 w-full bg-slate-800 opacity-50"
            ></div>
          ))}
          {/* <DragObject type="test" id="0" /> */}
          {dragObject &&
            dragObject.map((object, index) => {
              return (
                <DragObject
                  type={object.type}
                  id={index}
                  key={`${object.type + index}`}
                  handleMove={handleMove}
                />
              );
            })}
        </div>
        {/* {tags} */}
        <div className="w-[240px] flex flex-col">
          <div className="h-[115px] w-[240px]">
            <SearchTag addTag={addTag} />
          </div>
          <div className="h-[170px] w-[240px]">
            <GetTagRec
              setRecTags={setRecTags}
              recTags={recTags}
              addTag={addTag}
              web_url={web_url}
            />
          </div>
        </div>
      </div>
      <div className="ocr flex gap-1 w-[728px] mb-1">
        <div className="relative flex-auto">
          <input
            tabIndex={3}
            type="search"
            placeholder="OCR"
            className=" placeholder:italic text-slate-300 relative w-full p-1 pl-4 rounded-full bg-slate-800 hover:ease-in-out transition-all hover:drop-shadow-[0px_2px_1px_rgba(255,255,255,0.2)]"
            onChange={(e) => setOcr(e.target.value)}
          ></input>
        </div>
        <div className="relative flex-auto">
          <input
            tabIndex={3}
            type="search"
            placeholder="ASR"
            className=" placeholder:italic text-slate-300  relative w-full p-1 pl-4 rounded-full bg-slate-800 hover:ease-in-out transition-all hover:drop-shadow-[0px_2px_1px_rgba(255,255,255,0.2)]"
            onChange={(e) => setAsr(e.target.value)}
          ></input>
        </div>
      </div>
      {/* {selected tags} */}
      <div className="tagsAndButtons flex w-[728px] gap-1">
        <div className="h-[56px]  overflow-auto flex-wrap p-1 bg-slate-800 text-white w-32 gap-1 rounded-md flex-auto flex">
          {tags.length > 0 &&
            tags.map((tag) => (
              <span
                key={tag}
                className="h-8 relative cursor-pointer hover:ring-2 ring-slate-400 w-max bg-slate-800 p-0.5 rounded-md"
              >
                {tag.replace("_", " ")}
              </span>
            ))}
        </div>
        <textarea
          value={maxObj}
          tabIndex={2}
          type="text"
          placeholder="Specify maximum number of objects..."
          className="scroll-smooth flex-auto placeholder:italic resize-none text-slate-300 relative w-32 p-1 pl-2 rounded-md  bg-slate-800"
          onChange={(e) => setMaxObj(e.target.value)}
        ></textarea>
        <input
          tabIndex={-1}
          id="panelK"
          type="search"
          placeholder="K"
          className="w-12 flex-none transition-all hover:drop-shadow-[0px_4px_3px_rgba(255,255,255,0.2)] placeholder:italic  text-slate-300  relative p-0.5 indent-1 rounded-md bg-slate-800"
          onChange={(e) => {
            setPanelK(e.target.value);
          }}
          value={panelK}
        ></input>
        <div className="ml-auto flex gap-1">
          <label
            htmlFor="use id"
            className="flex-col flex justify-center items-center cursor-pointer pl-0.5  w-8 h-14  rounded-md bg-slate-800 hover:bg-slate-800 hover:border transition hover:scale-90"
          >
            <input
              defaultChecked={true}
              onChange={(e) => {
                setUseid(e.target.checked);
              }}
              id="use id"
              type="checkbox"
              className=" cursor-pointer rounded-md hover:ease-in-out duration-200 accent-slate-600 bg-gray-900 border-gray-300 rounded hover:ring-slate-500 "
            />
            <span className="bg text-center">ID</span>
          </label>
          <button
            onClick={() => {
              setVideos([]);
            }}
            type="button"
            className="w-14 h-14 rounded-md bg-slate-800 hover:bg-slate-800 hover:border transition hover:scale-90"
          >
            Clear
          </button>
          <button
            onClick={() => {
              clearPanel();
            }}
            type="button"
            className="w-14 h-14 rounded-md bg-slate-800 hover:bg-slate-800 hover:border transition hover:scale-90"
          >
            Clear Panel
          </button>
          <button
            onClick={() => {
              clearTags();
            }}
            type="button"
            className="w-14 h-14  rounded-md bg-slate-800 hover:bg-slate-800 hover:border transition hover:scale-90"
          >
            Clear Tags
          </button>
          <button
            onClick={() => {
              handleMove();
              const K = document.getElementById("K").value;
              if (panelK > parseInt(K) && useid) {
                alert("Cannot use id while having panel's K larger than K");
              } else {
                sendPanel();
              }
            }}
            type="button"
            className="w-14 h-14 border-orange-400 border-2 focus:bg-gradient-to-tr hover:bg-gradient-to-bl from-orange-400 via-red-500 to-red-400 rounded-md bg-slate-800 hover:bg-slate-800 hover:border transition-all hover:scale-90 focus:text-slate-900 hover: focus:font-semibold"
          >
            Send
            {/* {Clear & Send button} */}
          </button>
        </div>
      </div>
      {/* {images} */}
      {/* <div className="container mx-auto relative max-w-full w-screen max-h-[570px] overflow-auto flex flex-auto flex-wrap justify-around"> */}
      <div
        id="panel_images"
        className="relative flex-auto flex-col overflow-auto flex h-full "
      >
        {/* {console.log(dragObject)} */}
        {loading && <LoadingIcon />}
        {!loading &&
          videos.length > 0 &&
          videos
            .slice(
              page * VIDEO_PER_PAGE,
              page * VIDEO_PER_PAGE + VIDEO_PER_PAGE
            )
            .map((video, indexVideo) => {
              const video_info = video.video_info;
              return (
                <>
                  <VideoWrapper
                    id={video.video_id}
                    handleIgnore={() => handleIgnore(video_info.lst_idxs)}
                    // isIgnored={getIsIgnored(indexVideo)}
                  >
                    {video_info.lst_keyframe_paths.map((path, index) => (
                      <ImageListVideoPanel
                        addView={addView}
                        imagepath={path}
                        questionName={questionName}
                        id={video_info.lst_idxs[index]}
                        id_show={video_info.lst_keyframe_idxs[index]}
                        handleKNN={handleKNN}
                        handleIgnore={handleIgnore}
                        isIgnored={getIgnoredImages(video_info.lst_idxs[index])}
                        handleSelect={() =>
                          handleSelect(
                            video_info.lst_keyframe_idxs[index],
                            video.video_id
                          )
                        }
                        toggleFullScreen={() =>
                          toggleFullScreen({
                            imgpath: path,
                            id: video_info.lst_idxs[index],
                          })
                        }
                      />
                    ))}
                  </VideoWrapper>
                  <hr class="border-1 my-6 bg-orange-400 border-slate-700"></hr>
                </>
              );
            })}
      </div>
      {videos.length > 0 && !loading && (
        <PageButton
          totalPage={Math.floor(videos.length / 7)}
          page={page}
          setPage={setPage}
          autoIgnore={autoIgnore}
          handleAutoIgnore={handleAutoIgnore}
          DivID={"panel_images"}
        />
      )}
    </div>
    // </div>
  );
}

export default panel;
