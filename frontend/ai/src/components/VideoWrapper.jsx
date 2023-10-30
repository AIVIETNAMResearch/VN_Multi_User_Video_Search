import React from 'react'
import {BiHide } from "react-icons/bi";



function VideoWrapper({ children, id,
  // lst_idxs,
  handleIgnore, 
  filterFB
  // isIgnored
}) {
  const styles = {
    flex: filterFB ? 'none' : ''
  }

  return (
    // ${isIgnored ? "backdrop-blur-lg" : ""}
    <div
      className={` relative w-full flex justify-start
    ${filterFB ? 'overflow-x-auto overflow-y-clip h-min flex-none flex-nowrap' :'flex-auto'}
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
        style={styles}
        classname={`relative flex h-max 
        ${filterFB ? 'flex-nowrap flex-none bg-slate-500': 'flex-wrap'}`}
      >
        {children}
      </div>
    </div>
  );
}

export default VideoWrapper