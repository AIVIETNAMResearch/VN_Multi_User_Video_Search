import React from "react";
import { AiOutlineLock, AiOutlineUnlock } from "react-icons/ai";

function Lock({ lock, setLock }) {
  return (
    <div
      id="lock"
      onClick={() => {
        setLock((old) => {
          if (old === true)
            document.getElementById("username").focus()
          return !old
        });
      }}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md cursor-pointer hover:outline-1">
      {lock ? (
        <AiOutlineLock className="w-6 h-6" />
      ) : (
        <AiOutlineUnlock className="w-6 h-6" />
      )}
    </div>
  );
}

export default Lock;
