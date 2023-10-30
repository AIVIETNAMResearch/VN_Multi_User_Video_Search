import React from "react";
import Image from "next/image";
import { BsArrowsFullscreen } from "react-icons/bs";
import { BiSolidVideos } from "react-icons/bi";
import { AiOutlineDelete, AiOutlineSelect } from "react-icons/ai";

function ImageList({
  imagepath,
  id,
  id_show,
  toggleFullScreen,
  handleDelete,
  handleSelect,
  questionName
}) {
  return (
    <div
      className={`m-0.5 flex-none bg-slate-300 group p-0.5 h-min inline-flex relative rounded-lg mb-0.5
         `}
      key={id}
    >
      <div className=" relative h-[167px] w-[300px]">
        <Image
          onDragStart={(e) => e.preventDefault()}
          src={imagepath}
          // src={"/shoes.jpg"}
          fill={true}
          className=" relative rounded-md "
        />
        <div
          className={`flex gap-2 justify-center items-center  duration-300 group-hover:opacity-80 rounded-md absolute inset-0 bg-slate-900 opacity-0
        `}
        >
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
            type="button"
            id={"panelselect" + id}
            onClick={handleSelect}
            className={`flex relative w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90 pointer-cursor`}
          >
            <AiOutlineSelect color="black" fontSize="1.5rem" />
          </button>
        </div>
      </div>

      <div
        className={`rounded-md p-1 absolute top-0 left-0 bg-slate-300 text-lg text-slate-900 font-semibold`}
      >
        {id_show}
      </div>
      <div
        onClick={() => handleDelete(id)}
        className={`rounded-full ring-red-400 hover:ring-2 hover:bg-red-400 hover:scale-90 transition cursor-pointer p-0.5 absolute top-0 right-0 bg-slate-300 text-slate-900 translate-x-1/4 -translate-y-1/4`}
      >
        <AiOutlineDelete className="w-5 h-5" />
      </div>
      <div
        onClick={toggleFullScreen}
        className="cursor-pointer hover:scale-90 transtion-all rounded-md p-1 absolute bottom-0 right-0 bg-slate-300 text-lg text-slate-900 font-semibold"
      >
        <BsArrowsFullscreen />
      </div>
    </div>
  );
}

export default ImageList;
