import { useState } from "react";
import Clock from "../components/Clock";
import TeamView from "../components/TeamView";
import { BsChevronRight, BsChevronLeft } from "react-icons/bs";

const HomePage = () => {
  const [isTeamOpen, setIsTeamOpen] = useState(false);

  const toggleTeamView = () => {
    setIsTeamOpen(!isTeamOpen);
  };

  return (
    <div className="relative flex h-[90vh] overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <div
        className={`relative transition-all duration-300 z-10 bg-white shadow-xl h-full 
          ${isTeamOpen ? "w-96" : "w-0"} overflow-hidden min-w-0`}
      >
        {isTeamOpen && (
          <>
            <div className="h-full overflow-y-auto">
              <TeamView />
            </div>

            {/* Close Button on right edge */}
            <button
              onClick={toggleTeamView}
              className="absolute top-4 -right-0 flex  items-center justify-center bg-blue-800 text-white text-sm px-2 py-3 rounded-xl hover:bg-blue-900 transition-all"
              title="Collapse Team View"
            >

              <BsChevronLeft size={16} />
            </button>
          </>
        )}
      </div>

      {/* Open Button */}
      {!isTeamOpen && (
        <button
          onClick={toggleTeamView}
          className="absolute top-4 left-0 z-20 flex flex-col items-center bg-blue-800 text-white text-sm px-2 py-3 rounded-r-xl hover:bg-blue-900 transition-all"
          title="Open Team View"
        >
          {"TEAM".split("").map((char, i) => (
            <span key={i} className="leading-none text-xs">
              {char}
            </span>
          ))}
          <BsChevronRight size={18} className="mt-1" />
        </button>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex items-center justify-center px-4 transition-all ${isTeamOpen ? "pl-12" : ""}`}>
        <div className="w-full max-w-[600px]">
          <Clock />
        </div>
      </div>
    </div>
  );
};

export default HomePage;