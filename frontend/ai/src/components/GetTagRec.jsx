import React, { useState } from "react";
// import { words } from "../helper/words";
import { AiOutlineSearch } from "react-icons/ai";

function SearchTag({ addTag, web_url, recTags, setRecTags }) {
  const [query, setQuery] = useState("");
  // const [recTags, setRecTags] = useState([]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const getTypedRec = () => {
    // console.log(query);
    fetch(`${web_url}/getrec`, {
      method: "post",
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(query),
    })
      .then((data) => data.json())
      .then((result) => setRecTags(result))
      .catch((e) => alert("getrec failed!" + e));
  };

  return (
    <div className="relative w-full ">
      <div className="relative w-full">
        <input
          type="search"
          placeholder="Query to get tag recommendations"
          className="placeholder:italic text-slate-300 text-lg relative w-full p-1 pl-4 rounded-full bg-slate-600 hover:ease-in-out transition-all hover:drop-shadow-[0px_2px_1px_rgba(255,255,255,0.2)]"
          onChange={(e) => handleChange(e)}
        ></input>
        <button
          type="button"
          className="hover:ease-in-out hover:ring-2  ring-slate-400 mr-2 transition-all absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-slate-600 rounded-full hover:bg-slate-500"
          onClick={() => {
            getTypedRec();
          }}
        >
          <AiOutlineSearch />
        </button>
      </div>
      {recTags.length > 0 && (
        <div className="max-h-[100px] overflow-auto flex-wrap absolute top-12 p-1 bg-slate-800 text-white w-full rounded-md left-1/2 -translate-x-1/2 flex-auto flex">
          {recTags.map((tag) => (
            <span
              onClick={() => addTag(tag)}
              className="relative cursor-pointer hover:ring-2 ring-slate-400 w-max bg-slate-700 p-1 rounded-md mx-1 mb-1"
            >
              {tag.replace("_", " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchTag;
