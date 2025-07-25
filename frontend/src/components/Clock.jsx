import { useEffect, useState, useRef } from 'react';
import useUserStore from '../store/useUserStore';
import useReportStore from '../store/useReportStore';
import useCompanyStore from '../store/useCompanyStore';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  FaClock,
  FaPlay,
  FaPause,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';

const Clock = () => {
  const { user, userInfo } = useUserStore();
  const { addReport, updateReport } = useReportStore();
  const { getCompanyById, company } = useCompanyStore();

  const [time, setTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [clockInTimestamp, setClockInTimestamp] = useState(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [lastWorkDuration, setLastWorkDuration] = useState(null);

  const intervalRef = useRef(null);
  const userId = user?.id || userInfo?.id;

  const getStorageKey = () => `clockState_${userId}`;

  useEffect(() => {
    const companyId = user?.companyId || userInfo?.companyId;
    if (!companyId) return;

    const localCompanyData = localStorage.getItem('company');
    if (localCompanyData) {
      const parsedCompany = JSON.parse(localCompanyData);
      if (parsedCompany?.id === companyId) return;
    }

    getCompanyById(companyId).catch(console.error);
  }, [user?.companyId, userInfo?.companyId, getCompanyById]);

  useEffect(() => {
    if (!userId) return;
    const stored = JSON.parse(localStorage.getItem(getStorageKey()));
    if (stored?.isClockedIn && stored?.clockInTimestamp) {
      const elapsed = Math.floor(
        (Date.now() - new Date(stored.clockInTimestamp).getTime()) / 1000
      );
      setIsClockedIn(true);
      setClockInTimestamp(stored.clockInTimestamp);
      setWorkSeconds(elapsed);
      setIsOnBreak(stored.isOnBreak || false);
      setCurrentReportId(stored.reportId || null);
    }
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isClockedIn && !isOnBreak) {
      intervalRef.current = setInterval(() => {
        setWorkSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isClockedIn, isOnBreak]);

  useEffect(() => {
    if (!userId) return;
    if (isClockedIn) {
      localStorage.setItem(
        getStorageKey(),
        JSON.stringify({
          isClockedIn,
          isOnBreak,
          clockInTimestamp,
          reportId: currentReportId,
        })
      );
    } else {
      localStorage.removeItem(getStorageKey());
    }
  }, [isClockedIn, isOnBreak, clockInTimestamp, currentReportId, userId]);

  const formatWorkDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const MAX_WORK_SECONDS = 64799;

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleClockIn = async () => {
    try {
      const newReport = await addReport();
      const timestamp = new Date().toISOString();
      setClockInTimestamp(timestamp);
      setCurrentReportId(newReport.id);
      setIsClockedIn(true);
      setIsOnBreak(false);
      setWorkSeconds(0);
      setLastWorkDuration(null);
      toast.success('🟢 Clock In successful!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Clock In failed');
    }
  };

  const handleClockOut = () => setShowNoteModal(true);

  const confirmClockOut = async () => {
    try {
      const cappedWorkSeconds =
        workSeconds > MAX_WORK_SECONDS ? MAX_WORK_SECONDS : workSeconds;
      const totalWorkingHours = formatWorkDuration(cappedWorkSeconds);
      await updateReport(totalWorkingHours, noteInput || 'No note');

      setIsClockedIn(false);
      setIsOnBreak(false);
      setWorkSeconds(0);
      setClockInTimestamp(null);
      setCurrentReportId(null);
      setLastWorkDuration(totalWorkingHours);

      setShowNoteModal(false);
      setNoteInput('');
      toast.success('🔴 Clock Out successful!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Clock Out failed');
    }
  };

  const handleTakeBreak = () => setIsOnBreak(true);
  const handleResumeWork = () => setIsOnBreak(false);

  if (!userId) return <LoadingSpinner />;

  const userName = user?.name || userInfo?.name || 'Guest';

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">
          {company?.name || 'Company Name'}
        </h1>
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <FaClock /> {time.toLocaleString()}
        </div>
      </div>

      {/* Alerts */}
      {(!userName || userName === 'Guest') && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 shadow-sm">
          <span className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600" />
            Please complete your profile.
          </span>
          <Link
            to="/profile"
            className="text-sm underline hover:text-red-800 font-medium"
          >
            Fix Profile
          </Link>
        </div>
      )}

      {!company?.name && (
        <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-xl mb-4 shadow-sm">
          <span className="flex items-center gap-2">
            <FaInfoCircle className="text-yellow-500" />
            Company details missing.
          </span>
          <Link
            to="/company"
            className="text-sm underline hover:text-yellow-900 font-medium"
          >
            Fix Company
          </Link>
        </div>
      )}

      {/* Greeting */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">{getGreeting()}, {userName} 👋</h2>
        <p
          className={`mt-2 text-lg font-medium ${!isClockedIn
            ? 'text-gray-600'
            : isOnBreak
              ? 'text-yellow-500'
              : 'text-green-600'
            }`}
        >
          {!isClockedIn
            ? 'You have not started working yet.'
            : isOnBreak
              ? 'You are currently on break.'
              : 'You are currently working.'}
        </p>
        {clockInTimestamp && (
          <p className="text-sm text-gray-400 mt-1">
            Clocked in at: {new Date(clockInTimestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Work Timer */}
      {isClockedIn && (
        <div className="text-center mb-6">
          <div className="text-6xl font-mono font-bold text-blue-600">
            {formatWorkDuration(workSeconds)}
          </div>
        </div>
      )}

      {/* Work Summary */}
      {!isClockedIn && lastWorkDuration && (
        <div className="mb-6 text-center text-lg text-gray-700">
          ✅ You worked{' '}
          <span className="text-blue-600 font-bold">{lastWorkDuration}</span>{' '}
          today. Great job!
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
          >
            <FaPlay /> Clock In
          </button>
        ) : (
          <>
            {!isOnBreak ? (
              <button
                onClick={handleTakeBreak}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
              >
                  <FaPause /> Take a Break
              </button>
            ) : (
              <button
                onClick={handleResumeWork}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
              >
                    <FaPlay /> Resume Work
              </button>
            )}
            <button
              onClick={handleClockOut}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
            >
                <FaSignOutAlt /> Clock Out
            </button>
          </>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-3">
              📝 Add a note before Clocking Out
            </h2>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Brief summary of your work today..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmClockOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Submit & Clock Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clock;
