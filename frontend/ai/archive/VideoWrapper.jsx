import React from 'react'
import {BiHide } from "react-icons/bi";



function VideoWrapper({ children, id,
  // lst_idxs,
  handleIgnore, 
  // isIgnored
}) {


  return (
    // ${isIgnored ? "backdrop-blur-lg" : ""}
    <div
      className={`flex-none relative w-full h-min overflow-x-auto overflow-y-clip flex flex-nowrap justify-start
    `}
    >
      <div
        style={{zIndex: 2}}
        className="flex flex-col items-center justify-around text-amber-500 sticky top-0 left-0 bg-slate-950 rounded-md h-24 w-14 my-auto "
      >
        <span
          className="flex flex-wrap text-center break-all w-12 relative"
        >{`${id}`}</span>
        <div
          onClick={() => handleIgnore()}
          className={`flex-none rounded-full ring-red-400 hover:ring-2 hover:bg-red-400 hover:scale-90 transition cursor-pointer p-0.5 bg-slate-300 text-slate-900`}
        >
          <BiHide className="w-5 h-5" />
        </div>
      </div>
      <div
        style={{
          overflowX: "clip",
          flex: "none",
          overflowY: "clip",
        }}
        classname="relative flex-none flex flex-nowrap h-max flex-auto"
      >
        {children}
      </div>
    </div>
  );
}

export default VideoWrapper