// import { useEffect, useState } from 'react';
// import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
// import { BsCheckCircle, BsExclamationCircle } from 'react-icons/bs';
// import useTeamStatus from '../store/useTeamStatus';
// import useUserStore from '../store/useUserStore';
// import LoadingBar from './commonComponent/LoadingBar';

// const TeamView = () => {
//   const { team, fetchTeam, loading, error } = useTeamStatus();
//   const { user } = useUserStore();

//   const [openTeam, setOpenTeam] = useState(null);
//   const [openSubteam, setOpenSubteam] = useState({});

//   useEffect(() => {
//     if (user?.role === 'admin') {
//       fetchTeam({ all: true });
//     } else if (user?.team) {
//       fetchTeam({ team: user.team });
//     }
//   }, [user]);

//   const todayDate = new Date();
//   const tomorrowDate = new Date();
//   tomorrowDate.setDate(todayDate.getDate() + 1);
//   const currentHour = todayDate.getHours();
//   const isAfter2PM = currentHour >= 14;

//   const isWeekend = (date) => {
//     const day = date.getDay();
//     return day === 0 || day === 6;
//   };

//   const getEffectiveStatus = (status, date = new Date()) => {
//     if (isWeekend(date)) return 'Weekend';
//     if (!status) return 'Present';
//     if (status === 'Full Day' || status === 'Absent') return 'Absent (Full Day)';
//     if (status === 'First Half') return isAfter2PM ? 'Present (Second Half)' : 'Absent (First Half)';
//     if (status === 'Second Half') return isAfter2PM ? 'Absent (Second Half)' : 'Present (First Half)';
//     return 'Present';
//   };

//   const getDisplayStatus = (effectiveStatus, dayLabel) => `${dayLabel}: ${effectiveStatus}`;

//   const getStatusStyle = (status) => {
//     if (status.includes('Absent')) return 'bg-red-50 text-red-700';
//     if (status.includes('Present')) return 'bg-green-50 text-green-700';
//     if (status === 'Weekend') return 'bg-blue-50 text-blue-700';
//     return 'bg-gray-50 text-gray-700';
//   };

//   const getStatusIcon = (status) => {
//     if (status.includes('Absent')) return <BsExclamationCircle className="text-red-500" />;
//     if (status.includes('Present')) return <BsCheckCircle className="text-green-500" />;
//     if (status === 'Weekend') return <BsCheckCircle className="text-blue-500" />;
//     return <BsCheckCircle className="text-gray-500" />;
//   };

//   // Grouping by team → subteam and no-subteam
//   const groupedByTeam = Array.isArray(team)
//     ? team.reduce((acc, member) => {
//       const teamKey = member.team || 'No Team';

//       if (!acc[teamKey]) {
//         acc[teamKey] = { withSubteams: {}, withoutSubteam: [] };
//       }

//       if (member.subteam) {
//         if (!acc[teamKey].withSubteams[member.subteam]) {
//           acc[teamKey].withSubteams[member.subteam] = [];
//         }
//         acc[teamKey].withSubteams[member.subteam].push(member);
//       } else {
//         acc[teamKey].withoutSubteam.push(member);
//       }

//       return acc;
//     }, {})
//     : {};

//   return (
//     <div className="relative bg-white rounded-3xl shadow-md p-8 w-full">
//       <div className="flex items-center gap-3 mb-2">
//         <div className="w-1 h-8 bg-blue-600 rounded"></div>
//         <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Team Status</h2>
//       </div>

//       {loading && <LoadingBar />}
//       {error && <div className="text-red-500 text-center mb-4">Error: {error}</div>}

//       {team?.length === 0 && !loading ? (
//         <div className="text-center text-gray-500">No team data available.</div>
//       ) : (
//         <div className="flex flex-col gap-6">
//             {Object.entries(groupedByTeam).map(([teamName, { withSubteams, withoutSubteam }]) => (
//             <div
//               key={teamName}
//               className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-lg"
//             >
//                 {/* Team Header */}
//               <div
//                 className="flex justify-between items-center p-5 cursor-pointer hover:brightness-95 rounded-t-3xl"
//                 onClick={() =>
//                   setOpenTeam((prev) => (prev === teamName ? null : teamName))
//                 }
//               >
//                 <h3 className="text-2xl font-semibold text-blue-800">{teamName}</h3>
//                 {openTeam === teamName ? (
//                   <AiOutlineUp className="text-blue-700 text-2xl" />
//                 ) : (
//                   <AiOutlineDown className="text-blue-700 text-2xl" />
//                 )}
//               </div>

//                 {/* Team Content */}
//               {openTeam === teamName && (
//                   <div className="p-6 bg-white rounded-b-3xl space-y-6">
//                     {/* No-subteam users */}
//                     {withoutSubteam.map((member, index) => {
//                       const todayEffective = getEffectiveStatus(member.today, todayDate);
//                       const tomorrowEffective = getEffectiveStatus(member.tomorrow, tomorrowDate);
//                       const uniqueKey = member._id || `${member.userName}-${index}`;

//                       return (
//                         <div
//                           key={uniqueKey}
//                           className={`flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-2xl shadow-sm hover:shadow-md transition ${todayEffective.includes('Absent') && tomorrowEffective.includes('Absent')
//                             ? 'bg-red-50'
//                             : 'bg-gray-50'
//                             }`}
//                         >
//                           <div className="flex flex-col">
//                             <span className="text-sm text-gray-500">Name</span>
//                             <span className="font-semibold text-lg">
//                               {member.name || member.userName}
//                             </span>
//                           </div>

//                           <div
//                             className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getStatusStyle(
//                               todayEffective
//                             )}`}
//                           >
//                             {getStatusIcon(todayEffective)}
//                             <div className="font-medium text-sm">
//                               {getDisplayStatus(todayEffective, 'Today')}
//                             </div>
//                           </div>

//                           <div
//                             className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getStatusStyle(
//                               tomorrowEffective
//                             )}`}
//                           >
//                             {getStatusIcon(tomorrowEffective)}
//                             <div className="font-medium text-sm">
//                               {getDisplayStatus(tomorrowEffective, 'Tomorrow')}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}

//                     {/* Subteam users */}
//                     {Object.entries(withSubteams).map(([subteamName, members]) => (
//                       <div key={subteamName} className="border rounded-xl overflow-hidden shadow">
//                         <div
//                           className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer"
//                           onClick={() =>
//                             setOpenSubteam((prev) => ({
//                               ...prev,
//                               [teamName + '-' + subteamName]: !prev[teamName + '-' + subteamName],
//                             }))
//                           }
//                         >
//                           <h4 className="text-lg font-medium text-gray-700">{subteamName}</h4>
//                           {openSubteam[teamName + '-' + subteamName] ? (
//                             <AiOutlineUp className="text-gray-600 text-xl" />
//                           ) : (
//                             <AiOutlineDown className="text-gray-600 text-xl" />
//                           )}
//                         </div>

//                         {openSubteam[teamName + '-' + subteamName] && (
//                           <div className="p-4 bg-white space-y-4">
//                             {members.map((member, index) => {
//                               const todayEffective = getEffectiveStatus(member.today, todayDate);
//                               const tomorrowEffective = getEffectiveStatus(
//                                 member.tomorrow,
//                                 tomorrowDate
//                               );
//                               const uniqueKey = member._id || `${member.userName}-${index}`;

//                               return (
//                                 <div
//                                   key={uniqueKey}
//                                 className={`flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 rounded-xl shadow-sm hover:shadow-md transition ${todayEffective.includes('Absent') &&
//                                   tomorrowEffective.includes('Absent')
//                                   ? 'bg-red-50'
//                                   : 'bg-gray-50'
//                                   }`}
//                               >
//                                 <div className="flex flex-col">
//                                   <span className="text-sm text-gray-500">Name</span>
//                                   <span className="font-semibold text-lg">
//                                     {member.name || member.userName}
//                                   </span>
//                                 </div>

//                                 <div
//                                   className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getStatusStyle(
//                                     todayEffective
//                                   )}`}
//                                 >
//                                   {getStatusIcon(todayEffective)}
//                                   <div className="font-medium text-sm">
//                                     {getDisplayStatus(todayEffective, 'Today')}
//                                   </div>
//                                 </div>

//                                   <div
//                                     className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getStatusStyle(
//                                       tomorrowEffective
//                                     )}`}
//                                   >
//                                     {getStatusIcon(tomorrowEffective)}
//                                     <div className="font-medium text-sm">
//                                       {getDisplayStatus(tomorrowEffective, 'Tomorrow')}
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeamView;
import { useEffect, useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import useTeamStatus from "../store/useTeamStatus";
import useUserStore from "../store/useUserStore";
import LoadingBar from "./commonComponent/LoadingBar";

const TeamView = () => {
  const { team, fetchTeam, loading, error } = useTeamStatus();
  const { user } = useUserStore();

  const [expandedTeam, setExpandedTeam] = useState(null);
  const [expandedSubteam, setExpandedSubteam] = useState(null);
  const [groupedTeams, setGroupedTeams] = useState({});

  useEffect(() => {
    if (user?.role === "admin") {
      fetchTeam({ all: true });
    } else if (user?.team) {
      fetchTeam({ team: user.team });
      setExpandedTeam(user.team);
    }
  }, [user]);

  useEffect(() => {
    if (!Array.isArray(team)) return;

    const teams = {};
    team.forEach((member) => {
      const teamName = member.team || "Unknown Team";
      if (!teams[teamName]) {
        teams[teamName] = [];
      }
      teams[teamName].push(member);
    });

    setGroupedTeams(teams);
  }, [team]);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const after2pm = today.getHours() >= 14;

  const isWeekend = (d) => [0, 6].includes(d.getDay());

  const getEffectiveStatus = (status, date) => {
    if (isWeekend(date)) return "Weekend";
    if (!status) return "Present";
    if (["Full Day", "Absent"].includes(status)) return "Absent (Full Day)";
    if (status === "First Half") return after2pm ? "Present (Second Half)" : "Absent (First Half)";
    if (status === "Second Half") return after2pm ? "Absent (Second Half)" : "Present (First Half)";
    return "Present";
  };

  const getStatusClass = (status) => {
    if (status.includes("Absent")) return "bg-red-100 text-red-800";
    if (status.includes("Present")) return "bg-green-100 text-green-800";
    if (status === "Weekend") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const renderUser = (u) => {
    const te = getEffectiveStatus(u.today, today);
    const to = getEffectiveStatus(u.tomorrow, tomorrow);
    return (
      <div key={u._id} className="pl-6 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="font-medium text-gray-900">{u.name || u.userName}</div>
          <div className="flex gap-2">
            <span className={`px-2 mx-2 py-1  text-xs font-medium ${getStatusClass(te)}`}>
              Today: {te}
            </span>
            <span className={`px-2 py-1 mx-1 text-xs font-medium ${getStatusClass(to)}`}>
              Tomorrow: {to}
            </span>
          </div>
        </div>
        {u.designation && (
          <div className="text-xs text-gray-500 mt-1">{u.designation}</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Availability</h2>
        <p className="text-gray-500 text-sm mt-1">
          View your team's current and upcoming availability status
        </p>
      </div>

      {loading && <LoadingBar />}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading team data</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-2">
        {Object.entries(groupedTeams).map(([teamName, members]) => {
          const isTeamOpen = expandedTeam === teamName;

          const subteams = {};
          const direct = [];

          members.forEach((m) => {
            const sub = m.subteam || "No Subteam";
            if (sub === "No Subteam") {
              direct.push(m);
            } else {
              if (!subteams[sub]) subteams[sub] = [];
              subteams[sub].push(m);
            }
          });

          return (
            <div key={teamName} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setExpandedTeam(isTeamOpen ? null : teamName);
                  setExpandedSubteam(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 ${isTeamOpen ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-900">{teamName}</span>
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
                {isTeamOpen ? (
                  <BsChevronDown className="text-gray-500" />
                ) : (
                    <BsChevronRight className="text-gray-500" />
                )}
              </button>

              {isTeamOpen && (
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  {/* Subteams */}
                  <div className="space-y-3">
                    {Object.entries(subteams).map(([subteam, users]) => {
                      const isSubOpen = expandedSubteam === subteam;
                      return (
                        <div key={subteam} className="border border-gray-200 rounded-md overflow-hidden">
                          <button
                            onClick={() => setExpandedSubteam(isSubOpen ? null : subteam)}
                            className={`w-full flex items-center justify-between px-4 py-2 ${isSubOpen ? 'bg-white' : 'bg-gray-50'} hover:bg-white transition-colors`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-gray-800">{subteam}</span>
                              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                {users.length} {users.length === 1 ? 'member' : 'members'}
                              </span>
                            </div>
                            {isSubOpen ? (
                              <BsChevronDown className="text-gray-500 text-sm" />
                            ) : (
                              <BsChevronRight className="text-gray-500 text-sm" />
                            )}
                          </button>
                          {isSubOpen && (
                            <div className="bg-white divide-y divide-gray-200">
                              {users.map(renderUser)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Direct Members */}
                  {direct.length > 0 && (
                    <div className="mt-4">
                      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                        {direct.map(renderUser)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamView;