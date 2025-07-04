import { useEffect, useState } from 'react';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import { BsCheckCircle, BsExclamationCircle } from 'react-icons/bs';
import useTeamStatus from '../store/useTeamStatus';
import useUserStore from '../store/useUserStore';
import LoadingSpinner from './LoadingSpinner';

const TeamView = () => {
  const { team, fetchTeam, loading, error } = useTeamStatus();
  const { user } = useUserStore();

  const [openTeam, setOpenTeam] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTeam({ all: true });
    } else if (user?.team) {
      fetchTeam({ team: user.team });
    }
  }, [user]);

  const todayDate = new Date();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 1);

  const currentHour = todayDate.getHours();
  const isAfter2PM = currentHour >= 14;

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const groupedByTeam = Array.isArray(team)
    ? team.reduce((acc, member) => {
      const key = member.team || 'No Team';
      if (!acc[key]) acc[key] = [];
      acc[key].push(member);
      return acc;
    }, {})
    : {};

  const getEffectiveStatus = (status, date = new Date()) => {
    if (isWeekend(date)) return 'Weekend';
    if (!status) return 'Present';

    if (status === 'Full Day' || status === 'Absent') return 'Absent (Full Day)';

    if (status === 'First Half') {
      return isAfter2PM ? 'Present (Second Half)' : 'Absent (First Half)';
    }

    if (status === 'Second Half') {
      return isAfter2PM ? 'Absent (Second Half)' : 'Present (First Half)';
    }

    return 'Present';
  };

  const getDisplayStatus = (effectiveStatus, dayLabel) => {
    return `${dayLabel}: ${effectiveStatus}`;
  };

  const getStatusStyle = (status) => {
    if (status.includes('Absent')) return 'bg-red-50 text-red-700';
    if (status.includes('Present')) return 'bg-green-50 text-green-700';
    if (status === 'Weekend') return 'bg-blue-50 text-blue-700';
    return 'bg-gray-50 text-gray-700';
  };

  const getStatusIcon = (status) => {
    if (status.includes('Absent')) return <BsExclamationCircle className="text-red-500" />;
    if (status.includes('Present')) return <BsCheckCircle className="text-green-500" />;
    if (status === 'Weekend') return <BsCheckCircle className="text-blue-500" />;
    return <BsCheckCircle className="text-gray-500" />;
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-md p-8 w-full">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-20 rounded-3xl">
          <LoadingSpinner />
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Team Status</h2>
      </div>

      {error && <div className="text-red-500 text-center mb-4">Error: {error}</div>}

      {team?.length === 0 && !loading ? (
        <div className="text-center text-gray-500">No team data available.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groupedByTeam).map(([teamName, members]) => (
            <div
              key={teamName}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-lg"
            >
              <div
                className="flex justify-between items-center p-5 cursor-pointer hover:brightness-95 rounded-t-3xl"
                onClick={() =>
                  setOpenTeam((prev) => (prev === teamName ? null : teamName))
                }
              >
                <h3 className="text-2xl font-semibold text-blue-800">{teamName}</h3>
                {openTeam === teamName ? (
                  <AiOutlineUp className="text-blue-700 text-2xl" />
                ) : (
                  <AiOutlineDown className="text-blue-700 text-2xl" />
                )}
              </div>

              {openTeam === teamName && (
                <div className="p-6 bg-white rounded-b-3xl">
                  <div className="grid gap-5">
                    {members.map((member, index) => {
                      const todayEffective = getEffectiveStatus(member.today, todayDate);
                      const tomorrowEffective = getEffectiveStatus(member.tomorrow, tomorrowDate);
                      const uniqueKey = member._id || `${member.name}-${index}`;

                      return (
                        <div
                          key={uniqueKey}
                          className={`flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-2xl shadow-sm hover:shadow-md transition ${todayEffective.includes('Absent') &&
                              tomorrowEffective.includes('Absent')
                              ? 'bg-red-50'
                              : 'bg-gray-50'
                            }`}
                        >
                          {/* Name */}
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Name</span>
                            <span className="font-semibold text-lg">{member.name}</span>
                          </div>

                          {/* Today Status */}
                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getStatusStyle(
                              todayEffective
                            )}`}
                          >
                            {getStatusIcon(todayEffective)}
                            <div className="font-medium text-sm">
                              {getDisplayStatus(todayEffective, 'Today')}
                            </div>
                          </div>

                          {/* Tomorrow Status */}
                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getStatusStyle(
                              tomorrowEffective
                            )}`}
                          >
                            {getStatusIcon(tomorrowEffective)}
                            <div className="font-medium text-sm">
                              {getDisplayStatus(tomorrowEffective, 'Tomorrow')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamView;
