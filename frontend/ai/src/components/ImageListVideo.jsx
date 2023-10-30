import React from "react";
import { AiOutlineSelect, AiFillLike, AiFillDislike } from "react-icons/ai";
import { BsArrowsFullscreen, BsDatabaseAdd } from "react-icons/bs";
import { BiFileFind, BiSolidVideos, BiHide } from "react-icons/bi";
import Image from "next/image";

function ImageList({
  imagepath,
  id,
  handleKNN,
  handleSelect,
  toggleFullScreen,
  id_show,
  feedbackMode,
  handleFeedback,
  imgFeedback,
  handleIgnore,
  isIgnored,
  addView,
  questionName,
}) {
  const handleOpacity = () => {
    if (feedbackMode && imgFeedback !== undefined) return "opacity-90";
    else return "group-hover:opacity-90";
  };

  return (
    <div
      className={`m-0.5 group duration-300 shrink-0 bg-slate-300 p-0.5 h-max  relative rounded-lg inline-flex relative mb-0.5
         
      `}
      key={id}
    >
      <div className="group inline-flex relative h-[120px] w-[213px]">
        <Image
          src={imagepath}
          // src={"/shoes.jpg"}
          fill={true}
          className=" duration-300 relative rounded-md"
        />
        <div
          className={`flex gap-1 justify-center items-center  duration-300  rounded-md absolute inset-0 bg-slate-900 opacity-0
        ${handleOpacity()}
        `}
        >
          {feedbackMode ? (
            // true
            <>
              <button
                type="button"
                id={"like" + id}
                onClick={() => {
                  handleFeedback(id, "lst_pos_idxs");
                }}
                className={`flex relative w-12 h-12 rounded-full bg-slate-100 flex justify-center items-center
                 duration-300 hover:scale-90
                 ${
                   imgFeedback === "like"
                     ? `scale-75 bg-gradient-to-br from-lime-600 to-emerald-600`
                     : ""
                 }
                 `}
              >
                <AiFillLike
                  className={`
                    ${
                      imgFeedback === "like" ? `text-lime-50` : "text-lime-600 "
                    }
                `}
                  fontSize="1.75rem"
                />
              </button>
              <button
                type="button"
                id={"dislike" + id}
                onClick={() => {
                  handleFeedback(id, "lst_neg_idxs");
                }}
                className={`flex relative w-12 h-12 rounded-full bg-slate-100 flex justify-center items-center
                 duration-300 hover:scale-90
                 ${
                   imgFeedback === "dislike"
                     ? `scale-75 bg-gradient-to-br from-orange-700 to-red-600`
                     : ""
                 }`}
              >
                <AiFillDislike
                  className={`
                    ${
                      imgFeedback === "dislike" ? `text-red-50` : "text-red-600"
                    }
                `}
                  fontSize="1.75rem"
                />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                id={"knn" + id}
                onClick={() => handleKNN(id)}
                className=" flex relative w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90 pointer-cursor"
              >
                <BiFileFind color="black" fontSize="1.5rem" />
                {/* <Tooltip
                  anchorId={"knn" + id}
                  place="bottom"
                  content="KNN"
                  className="tracking-wider font-semibold"
                  style={{
                    backgroundColor: "rgb(226 232 240)",
                    color: "rgb(2 6 23)",
                    fontSize: "large",
                  }}
                ></Tooltip> */}
              </button>
              <button
                type="button"
                id={"shot" + id}
                className=" flex relative w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90"
              >
                <a
                  target="_blank"
                  href={`shot?id=${id}&questionName=${questionName}`}
                  className="flex items-center justify-center w-full h-full rounded-full pointer-cursor"
                >
                  <BiSolidVideos color="black" fontSize="1.5rem" />
                </a>
              </button>
              <button
                id={"select" + id}
                onClick={handleSelect}
                className={`flex relative w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90 pointer-cursor`}
              >
                <AiOutlineSelect color="black" fontSize="1.5rem" />
              </button>
              <button
                id={"sendView" + id}
                onClick={() => addView(id)}
                className={`flex relative w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90 pointer-cursor`}
              >
                <BsDatabaseAdd color="black" fontSize="1.5rem" />
              </button>
            </>
          )}
        </div>
      </div>
      {isIgnored && (
        <div className="border absolute bottom-2 left-1/2 rounded-full -translate-x-1/2  bg-slate-900 flex items-center justify-center text-red-500">
          <BiHide className="w-10 h-8" />
        </div>
      )}
      <div
        className={`rounded-md p-1 absolute top-0 left-0 bg-slate-300 text-lg text-slate-900 font-semibold`}
      >
        {id_show}
      </div>
      <div
        onClick={() => handleIgnore(id)}
        className={`rounded-lg ring-red-400 hover:ring-2 hover:bg-red-400  transition cursor-pointer p-0.5 absolute top-0 right-0 bg-slate-300 text-slate-900`}
      >
        <BiHide className="w-5 h-5" />
      </div>
      <div
        onClick={toggleFullScreen}
        className="cursor-pointer rounded-md p-1 absolute bottom-0 right-0 bg-slate-300 text-lg text-slate-900 font-semibold"
      >
        <BsArrowsFullscreen />
      </div>
    </div>
  );
}

export default ImageList;
