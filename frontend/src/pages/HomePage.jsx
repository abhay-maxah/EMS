import { useState } from "react";
import Clock from "../components/Clock";
import TeamView from "../components/TeamView";
import { BsPeople } from "react-icons/bs";

const HomePage = () => {
  const [isTeamOpen, setIsTeamOpen] = useState(false);

  const toggleTeamView = () => {
    setIsTeamOpen(!isTeamOpen);
  };

  return (
    <div className="relative flex h-[90vh] overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 z-10 bg-white shadow-xl h-full 
          ${isTeamOpen ? "w-96" : "w-0"} overflow-hidden min-w-0`}
      >
        <div className="h-full overflow-y-auto">
          {isTeamOpen && <TeamView />}
        </div>
      </div>

      {/* Toggle Button (fixed outside the sidebar edge) */}
      <button
        onClick={toggleTeamView}
        className={`absolute top-4 z-20 flex items-center justify-center bg-blue-800 text-white text-sm px-2 py-3 rounded-r-xl hover:bg-blue-900 transition-all
          ${isTeamOpen ? "left-96" : "left-0"}`} // moves with sidebar edge
        title={isTeamOpen ? "Collapse Team View" : "Open Team View"}
      >
        <BsPeople size={20} />
      </button>

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
