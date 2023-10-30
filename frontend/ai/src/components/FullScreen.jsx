import React from "react";
import {
  AiFillPlayCircle,
} from "react-icons/ai";
import ImageListRelated from "./ImageListRelated";
import Image from 'next/image'


function FullScreen({fullScreenImg, setFullScreenImg, relatedObj}) {
  if (fullScreenImg != null) {
    return (
      <div
        onClick={() => setFullScreenImg(null)}
        className="fullscreenbackground justify-around w-screen h-screen bg-slate-950 flex absolute justify-center items-center bottom-auto right-auto rounded-md z-10"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-md relative bg-slate-300 flex flex-col justify-center"
        >
          <div className="relative w-[1000px] h-[562px] rounded-md">
            <Image
              src={fullScreenImg["imgpath"]}
              fill={true}
              className="rounded-md opacity-100"
            />
          </div>
          {Object.keys(relatedObj).length !== 0 && (
            <>
              <a
                href={`${relatedObj.video_url}&t=${relatedObj.video_range[0]}s`}
                target="_blank"
                className="my-1 drop-shadow relative justify-center items-center flex left-1/2 -translate-x-1/2 bottom-0 h-10 w-10 rounded-full border border-black bg-orange-800 hover:bg-orange-600 transition-all"
              >
                <AiFillPlayCircle fontSize="1.5rem" />
              </a>
              <p className="overflow-auto w-[400px] text-center bg-slate-800 mx-auto rounded-md">
                {fullScreenImg.imgpath}
              </p>
            </>
          )}
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="related_img h-[800px] pt-1 flex flex-wrap justify-around items-start rounded-md bg-slate-500 overflow-auto w-[320px]"
        >
          {Object.keys(relatedObj).length !== 0 &&
            relatedObj.near_keyframes.map((image) => (
              <ImageListRelated image={image} />
            ))}
        </div>
      </div>
    );
  }
}

export default FullScreen;
