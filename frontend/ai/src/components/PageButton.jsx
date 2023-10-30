import React, { useEffect } from 'react'
import {
  AiFillCaretLeft,
  AiFillCaretRight,
} from "react-icons/ai";

function PageButton({ totalPage, autoFetch, isFilter, showAutoFetch, page, setPage, DivID, autoIgnore, handleAutoIgnore }) {
  useEffect(() => {
    if (DivID === "images" && autoIgnore && !isFilter) {
      if ((page === totalPage - 3 || (0 < totalPage && totalPage < 3)) && autoIgnore)
        autoFetch();
      if (page > totalPage) {
        showAutoFetch();
      }
    }
  }, [page])

  return (
    <div className="flex flex-wrap justify-center relative w-full my-1">
      {
        // page > 0 &&
        <button
          className={`bg-slate-800 text-gray-200 font-bold py-2 px-4 rounded-l transition ease-in-out enabled:hover:bg-indigo-700
          disabled:cursor-not-allowed disabled:opacity-50
            `}
          disabled={page <= 0}
          onClick={() => {
            document.getElementById(DivID).scrollTop = 0;
            setPage(page - 1);
          }}
        >
          <AiFillCaretLeft />
        </button>
      }
      <div className="bg-slate-800 py-2 px-2 text-sky-300 ">
        {page > totalPage ? totalPage : page}/{totalPage}
      </div>
      <button
        className="bg-slate-800 hover:bg-indigo-700 text-gray-200 font-bold py-2 px-4 rounded-r transition ease-in-out "
        onClick={() => {
          document.getElementById(DivID).scrollTop = 0;
          if (autoIgnore) handleAutoIgnore(page);
          setPage(page + 1);
        }}
      >
        <AiFillCaretRight />
      </button>
    </div>
  );
}

export default PageButton