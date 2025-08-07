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
      setIsClockedIn(true);
      setClockInTimestamp(stored.clockInTimestamp);
      setIsOnBreak(stored.isOnBreak || false);
      setCurrentReportId(stored.reportId || null);

      const savedWorkSeconds = stored.workSeconds || 0;
      if (!stored.isOnBreak) {
        const elapsed = Math.floor(
          (Date.now() - new Date(stored.lastUpdated || stored.clockInTimestamp).getTime()) / 1000
        );
        setWorkSeconds(savedWorkSeconds + elapsed);
      } else {
        setWorkSeconds(savedWorkSeconds);
      }
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
          workSeconds,
          lastUpdated: new Date().toISOString(),
        })
      );
    } else {
      localStorage.removeItem(getStorageKey());
    }
  }, [isClockedIn, isOnBreak, clockInTimestamp, currentReportId, workSeconds, userId]);

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
      toast.success('Clock In successful!');
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
      toast.success('Clock Out successful!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Clock Out failed');
    }
  };

  const handleTakeBreak = () => setIsOnBreak(true);
  const handleResumeWork = () => setIsOnBreak(false);

  if (!userId) return <LoadingSpinner />;
  const userName = user?.name || userInfo?.name || 'Guest';

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-blue-700">{company?.name || 'Company Name'}</h1>

      </div>

      {/* Alerts */}
      {(!userName || userName === 'Guest') && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl shadow-sm">
          <span className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600" />
            Please complete your profile.
          </span>
          <Link to="/profile" className="text-sm underline font-medium hover:text-red-800">
            Fix Profile
          </Link>
        </div>
      )}

      {!company?.name && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl shadow-sm">
          <span className="flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" />
            Company details missing.
          </span>
          <Link to="/profile" className="text-sm underline font-medium hover:text-blue-900">
            Fix Company
          </Link>
        </div>
      )}

      {/* Greeting */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">
          {getGreeting()}, {userName} 👋
        </h2>
        <p className="text-lg font-medium text-gray-900">
          {!isClockedIn ? (
            <>
              You have not started <span className="text-black">working</span> yet.
            </>
          ) : isOnBreak ? (
            <>
              You are currently on <span className="text-blue-600">break</span>.
            </>
          ) : (
            <>
              You are currently <span className="text-blue-600">working</span>.
            </>
          )}
        </p>

        {clockInTimestamp && (
          <p className="text-sm text-gray-500">
            Clocked in at: {new Date(clockInTimestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Work Timer */}
      {isClockedIn && (
        <div className="text-center">
          <div className="flex justify-center gap-1 text-6xl font-mono font-bold leading-none">
            {formatWorkDuration(workSeconds).split('').map((char, idx) => (
              <DigitSlide key={idx} value={char} isStatic={!/\d/.test(char)} />
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {!isClockedIn && lastWorkDuration && (
        <div className="text-center text-lg text-gray-700">
          ✅ You worked{' '}
          <span className="text-blue-600 font-bold">{lastWorkDuration}</span> today. Great job!
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-6 pt-2">
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
          >
            <FaPlay /> Clock In
          </button>
        ) : (
          <>
            {!isOnBreak ? (
              <button
                onClick={handleTakeBreak}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
              >
                  <FaPause /> Take a Break
              </button>
            ) : (
              <button
                onClick={handleResumeWork}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
              >
                    <FaPlay /> Resume Work
              </button>
            )}
            <button
              onClick={handleClockOut}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
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
            <h2 className="text-xl font-bold mb-3">📝 Add a note before Clocking Out</h2>
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



const DigitSlide = ({ value, isStatic = false }) => {
  const [previousValue, setPreviousValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== previousValue) {
      setIsFlipping(true);
      const timeout = setTimeout(() => {
        setPreviousValue(value);
        setIsFlipping(false);
      }, 750); // Match animation duration
      return () => clearTimeout(timeout);
    }
  }, [value, previousValue]);

  if (isStatic) {
    return (
      <div className="w-[40px] h-[64px] flex items-center justify-center text-5xl font-mono text-blue-700">
        {value}
      </div>
    );
  }

  return (
    <div className="w-[40px] h-[64px] relative" style={{ perspective: '800px' }}>
      {/* Previous Value Rolling Out */}
      <div
        className="absolute w-full h-full flex items-center justify-center text-5xl font-mono text-blue-700 bg-white"
        style={{
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center',
          transition: 'transform 0.6s ease-in-out, opacity 0.6s ease-in-out',
          transform: isFlipping ? 'rotateY(90deg) translateZ(0)' : 'rotateY(0deg)',
          opacity: isFlipping ? 0 : 1,
          zIndex: isFlipping ? 1 : 2,
        }}
      >
        {previousValue}
      </div>

      {/* New Value Rolling In */}
      <div
        className="absolute w-full h-full flex items-center justify-center text-5xl font-mono text-blue-700 bg-white"
        style={{
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center',
          transition: 'transform 0.6s ease-in-out, opacity 0.6s ease-in-out',
          transform: isFlipping ? 'rotateY(0deg)' : 'rotateY(-90deg)',
          opacity: isFlipping ? 1 : 0,
          zIndex: isFlipping ? 2 : 1,
        }}
      >
        {value}
      </div>
    </div>
  );
};