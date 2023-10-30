import { Switch } from "@headlessui/react";

export default function Example({admin, setAdmin}) {

  return (
    <div className="">
      <Switch
        checked={admin}
        onChange={setAdmin}
        className={`${admin ? "bg-blue-700 border border-red-500" : "bg-blue-500"}
          relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${admin ? "translate-x-9" : "translate-x-0"}
            text-center items-center text-sky-700 indent-1.5
            pointer-events-none inline-flex h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        >
          {admin ? "On" : "Off"} 
        </span>
      </Switch>
    </div>
  );
}

