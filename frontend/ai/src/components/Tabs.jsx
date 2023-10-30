import React from "react";
import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { HiChevronUpDown } from "react-icons/hi2";
import { AiOutlineCheck } from "react-icons/ai";

export default function Tabs({ queryHistory, handleHistory, selected, setSelected }) {
  const [query, setQuery] = useState("");

  const filteredHistory =
    query === ""
      ? queryHistory
      : queryHistory.filter((history) =>
          history.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <div className="w-40 rounded-lg">
      <Combobox
        value={selected}
        onChange={(e) => {
          setSelected(e);
          console.log("combobox changed!")
          handleHistory(e.id);
        }}
      >
        <div className="relative mt-1 rounded-lg hover:ring transition-all ring-orange-600">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md sm:text-sm">
            {queryHistory.length > 0 ? (
              <Combobox.Input
                autoComplete="false"
                className="w-full rounded-lg border-none py-2 pl-3 pr-10 text-sm leading-5 bg-slate-100 text-gray-900 focus:ring-0"
                displayValue={(history) => `${history.id}. ${history.name}`}
                onChange={(event) => setQuery(event.target.value)}
              />
            ) : (
              <Combobox.Input
                autoComplete="false"
                className="w-full rounded-lg border-none py-2 pl-3 pr-10 text-sm leading-5 bg-slate-100 text-gray-900 focus:ring-0"
                displayValue={``}
              />
            )}
            <Combobox.Button className="rounded-lg absolute inset-y-0 right-0 flex items-center pr-2">
              <HiChevronUpDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition-all "
            enterFrom="opacity-0 -translate-y-10"
            enterTo="opacity-100 translate-y-0"
            leave="transition-all ease-in-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 -translate-y-10	"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
              {queryHistory.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Search something first.
                </div>
              ) : filteredHistory.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredHistory.map((history) => (
                  <Combobox.Option
                    key={history.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-orange-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={history}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {`${history.id}. ${history.name}`}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-orange-600"
                            }`}
                          >
                            <AiOutlineCheck
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
