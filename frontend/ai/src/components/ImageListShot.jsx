import React from "react";
import Image from "next/image";
import { AiOutlineSelect } from "react-icons/ai";
import { BsDatabaseAdd } from "react-icons/bs";



function ImageList({
  imagepath,
  id,
  id_show,
  handleSelect,
  addView
}) {
  return (
    <div
      className={`m-0.5 group hover:ease-in-out group duration-300 shrink-0 bg-slate-300 p-0.5 h-max  relative rounded-lg inline-flex relative mb-0.5
         hover:drop-shadow-[0px_4px_3px_rgba(255,255,255,0.4)]`}
      key={id}
    >
      <div className="group inline-flex relative h-[167px] w-[300px]">
        <Image
          src={imagepath}
          // src={"/shoes.jpg"}
          fill={true}
          className="hover:ease-in-out duration-300 relative rounded-md group-hover:opacity-80"
        />
        <div
          className={`group-hover:opacity-90 flex gap-2 justify-center items-center duration-300 rounded-md absolute inset-0 bg-slate-900 opacity-0`}
        >
          <button
            type="button"
            id={"select" + id}
            onClick={() => handleSelect(id)}
            className={`flex relative w-12 h-12 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90 pointer-cursor`}
          >
            <AiOutlineSelect color="black" fontSize="1.75rem" />
          </button>
          <button
            type="button"
            id={"addview" + id}
            onClick={() => addView(id)}
            className={`flex relative w-12 h-12 rounded-full bg-slate-200 flex justify-center items-center
                   duration-300 hover:scale-90 pointer-cursor`}
          >
            <BsDatabaseAdd color="black" fontSize="1.75rem" />
          </button>
        </div>
      </div>
      <div
        className={`rounded-md p-1 absolute top-0 left-0 bg-slate-300 text-lg text-slate-900 font-semibold`}
      >
        {id_show}
      </div>
    </div>
  );
}

export default ImageList;
