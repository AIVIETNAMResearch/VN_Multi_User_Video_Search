import React from "react";
import { AiOutlineSelect } from "react-icons/ai";
import { BsArrowsFullscreen, BsDatabaseAdd } from "react-icons/bs";
import { BiFileFind, BiSolidVideos, BiHide } from "react-icons/bi";
import Image from "next/image";

function ImageListvideoPanel({
  imagepath,
  id,
  handleKNN,
  handleSelect,
  toggleFullScreen,
  id_show,
  handleIgnore,
  isIgnored,
  questionName,
  addView
}) {


  return (
    <div
      className={`m-0.5 group   group duration-300 shrink-0 bg-slate-300 p-0.5 h-max  relative rounded-lg inline-flex relative mb-0.5
         hover:drop-shadow-[0px_4px_3px_rgba(255,255,255,0.4)]`}
      key={id}
    >
      <div className="group inline-flex relative h-[120px] w-[213px]">
        <Image
          src={imagepath}
          fill={true}
          className="  duration-300 relative rounded-md"
          
        />
        (
        <div
          className={`flex gap-2 justify-center items-center  duration-300 group-hover:opacity-80 rounded-md absolute inset-0 bg-slate-900 opacity-0
        `}
        >
          <button
            type="button"
            id={"panelknn" + id}
            onClick={() => handleKNN(id)}
            className=" flex relative w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center
                    duration-300 hover:scale-90 pointer-cursor"
          >
            <BiFileFind color="black" fontSize="1.5rem" />
          </button>
          <button
            type="button"
            id={"panelshot" + id}
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
            type="button"
            id={"panelselect" + id}
            onClick={handleSelect}
            className={`flex relative w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90 pointer-cursor`}
          >
            <AiOutlineSelect color="black" fontSize="1.5rem" />
          </button>
          <button
            type="button"
            id={"panelselect" + id}
            onClick={() => addView(id)}
            className={`flex relative w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90 pointer-cursor`}
          >
            <BsDatabaseAdd color="black" fontSize="1.5rem" />
          </button>
        </div>
        )
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
        className={`rounded-lg ring-red-400 hover:ring-2 hover:bg-red-400 transition cursor-pointer p-0.5 absolute top-0 right-0 bg-slate-300 text-slate-900`}
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

export default ImageListvideoPanel;
