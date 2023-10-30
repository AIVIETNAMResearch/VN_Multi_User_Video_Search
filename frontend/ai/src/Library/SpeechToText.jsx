import React, { useEffect } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { BsFillMicFill } from "react-icons/bs";

export default function AnyComponent({ setQuery }) {
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    speechRecognitionProperties: {
      lang: "vi-VN",
      interimResults: true, // Allows for displaying real-time speech results
    },
  });

  if (error) alert("Web Speech API is not available in this browser 🤷‍");

  // useEffect(() => {
  //   if (results.length > 0) {
  //     console.log(results)
  //     setQuery((old) => old + " " + results[results.length - 1].transcript);

  //   }
  // }, [results]);
  useEffect(() => {
    if (interimResult) {
      const newWord = interimResult.split(" ").slice(-1)[0];
      setQuery((old) => old + " " + newWord);
    }
  }, [interimResult]);
  

  return (
    // <div>
    //   <h1>Recording: {isRecording.toString()}</h1>
    <button
      className="rounded-full bg-white border border-red-500 p-1 hover:scale-90 transition"
      onClick={isRecording ? stopSpeechToText : startSpeechToText}
    >
      <BsFillMicFill
        className={`${isRecording ? " text-red-500" : "text-slate-900"} 
        rounded-full w-6 h-6
        `}
      />
      {/* {isRecording ? "Stop Recording" : "Start Recording"} */}
    </button>
    // <ul>
    //   {/* {results.map((result) => (
    //     <li key={result.timestamp} id={result.timestamp}>{result.transcript}</li>
    //   ))} */}
    //   {interimResult && setQuery(interimResult)}
    // </ul>
    // </div>
  );
}
