import React from "react";
import LoadingIcon from "./LoadingIcon";

function Questions({ questions, username, setQuestionName, isLoading }) {
  // console.log('rerender')
  return (
    <>
      <div
        key={questions}
        className="w-80 top-10 left-0 h-80 bg-slate-900 rounded-md absolute flex-col gap-1y
         content-start p-1"
        id="questions"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{
          zIndex: 2,
          display: "none",
        }}
      >
        {isLoading ? (
          <LoadingIcon />
        ) : (
          <>
            <div className="flex flex-wrap overflow-y-scroll bg-slate-800 gap-1 p-1 content-start h-40 flex-auto">
              {questions.length > 0 &&
                username &&
                questions
                  .filter((question) => question.owned)
                  .map((question) => {
                    return (
                      <p
                        key={`${question.question}${question.owned}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById("questionName").focus();
                          setQuestionName(e.target.innerText);
                        }}
                        style={{ zIndex: 3 }}
                        className={`break-words w-fit hover:ring-2 ring-orange-400 duration-300 transition-all active:border-2 border-amber-500 h-fit text-slate-300 text-base p-px rounded-md 
                      bg-orange-800`}
                      >
                        {question.question}
                      </p>
                    );
                  })}
            </div>
            <div className="flex flex-wrap overflow-y-scroll bg-slate-800 gap-1 p-1 content-start h-40 flex-auto">
              {questions.length > 0 &&
                username &&
                questions
                  .filter((question) => !question.owned)
                  .map((question) => {
                    return (
                      <p
                        key={`${question.question}${question.owned}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById("questionName").focus();
                          setQuestionName(e.target.innerText);
                        }}
                        style={{ zIndex: 3 }}
                        className={`w-fit hover:ring-2 ring-orange-400 duration-300 transition-all active:border-2 border-amber-500 h-fit text-slate-300 text-base p-px rounded-md 
                      bg-slate-700`}
                      >
                        {question.question}
                      </p>
                    );
                  })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Questions;
