import React from 'react'
import useDragger from "../hooks/useDragger";
import Image from "next/image"

function DragObject({type, id, handleMove}) {

  useDragger(type + id, handleMove)

  return (
    <div
      id={`${type}${id}`}
      className="hover:border border-slate-900 transition select-none overflow-hidden resize box top-0 left-0 absolute h-[80px] w-[80px] cursor-pointer rounded-md"
      >
      <Image
        onDragStart={(e) => e.preventDefault()}
        src={`/icons/${type}.png`}
        alt="dragObject"
        layout='fill'
        className=" select-none"
      />
    </div>
  );
}

export default DragObject