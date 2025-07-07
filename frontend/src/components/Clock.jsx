import { useEffect, useState, useRef } from 'react';
import useUserStore from '../store/useUserStore';
import useReportStore from '../store/useReportStore';
import useCompanyStore from '../store/useCompanyStore';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

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

    // First, try loading from localStorage
    const localCompanyData = localStorage.getItem("company");
    if (localCompanyData) {
      const parsedCompany = JSON.parse(localCompanyData);
      if (parsedCompany && parsedCompany.id === companyId) {
        return;
      }
    }

    // If not in localStorage or mismatch, fetch from API
    getCompanyById(companyId).catch((error) =>
      console.error("Failed to fetch company:", error)
    );
  }, [user?.companyId, userInfo?.companyId, getCompanyById]);


  // Load clock state from localStorage
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

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer for working seconds
  useEffect(() => {
    if (isClockedIn && !isOnBreak) {
      intervalRef.current = setInterval(() => {
        setWorkSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isClockedIn, isOnBreak]);

  // Save to localStorage
  useEffect(() => {
    if (!userId) return;
    if (isClockedIn) {
      const state = {
        isClockedIn,
        isOnBreak,
        clockInTimestamp,
        reportId: currentReportId,
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
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
      const msg = err?.response?.data?.message || 'Clock In failed';
      toast.error(msg);
    }
  };

  const handleClockOut = () => {
    setShowNoteModal(true);
  };

  const confirmClockOut = async () => {
    try {
      const totalWorkingHours = formatWorkDuration(workSeconds);
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
      const msg = err?.response?.data?.message || 'Clock Out failed';
      toast.error(msg);
    }
  };

  const handleTakeBreak = () => setIsOnBreak(true);
  const handleResumeWork = () => setIsOnBreak(false);

  if (!userId) {
    return <LoadingSpinner />
  }

  const userName = user?.name || userInfo?.name || 'Guest';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">
          {company?.name || 'Company Name'}
        </h1>
      </div>
      {/* Greeting + Validation */}
      <div className="text-center mb-6">
        {(!userName || userName === 'Guest') && (
          <p className="bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-lg mb-4">
            ⚠️ Please complete your user profile.
          </p>
        )}
        {!company?.name && (
          <p className="bg-yellow-100 text-yellow-700 font-semibold px-4 py-2 rounded-lg mb-4">
            ⚠️ Company not found. Please add your company details.
          </p>
        )}
        <h2 className="text-xl font-semibold">
          {getGreeting()}, {userName || 'Guest'} 👋
        </h2>
        <p
          className={`mt-2 text-base font-semibold ${!isClockedIn
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
      </div>

      {/* Work Duration */}
      {isClockedIn && (
        <div className="mb-6 text-5xl font-mono font-bold text-blue-600 text-center">
          {formatWorkDuration(workSeconds)}
        </div>
      )}

      {/* Last Work Summary */}
      {!isClockedIn && lastWorkDuration && (
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-700 font-semibold">
            ✅ You worked{' '}
            <span className="text-blue-600">{lastWorkDuration}</span> today.
            Great job!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-md transition"
          >
            Clock In
          </button>
        ) : (
          <>
            {!isOnBreak ? (
              <button
                onClick={handleTakeBreak}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-xl shadow-md transition"
              >
                Take a Break
              </button>
            ) : (
              <button
                onClick={handleResumeWork}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md transition"
              >
                Resume Work
              </button>
            )}
            <button
              onClick={handleClockOut}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-md transition"
            >
              Clock Out
            </button>
          </>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Add Note Before Clock Out
            </h2>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Write about today's work..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmClockOut}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
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
