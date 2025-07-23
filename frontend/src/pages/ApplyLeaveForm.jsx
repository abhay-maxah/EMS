import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserStore from '../store/useUserStore';
import useLeaveStore from '../store/useLeaveStore';

const ApplyLeaveForm = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [leaveCategory, setLeaveCategory] = useState('casual');
  const [reason, setReason] = useState('');
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [leaveDatesStatus, setLeaveDatesStatus] = useState({});

  const user = useUserStore((state) => state.user);
  const addLeave = useLeaveStore((state) => state.addLeave);

  // Helper functions
  const getLocalDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayName = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isNonWorkingDay = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) return false;
    const day = d.getDay();
    return day === 0 || day === 6;
  };

  const dayTypeToValue = (type) => {
    switch (type) {
      case 'full':
        return 1;
      case 'firstHalf':
      case 'secondHalf':
        return 0.5;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const newLeaveDatesStatus = {};
    let total = 0;
    const datesInRange = [];

    if (startDate) {
      let currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : new Date(startDate);
      end.setHours(0, 0, 0, 0);

      while (currentDate <= end) {
        datesInRange.push(new Date(currentDate.getTime()));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    datesInRange.forEach((date) => {
      const dateString = getLocalDateString(date);
      if (isNonWorkingDay(date)) {
        newLeaveDatesStatus[dateString] = 'nonWorking';
      } else {
        newLeaveDatesStatus[dateString] = leaveDatesStatus[dateString] || 'full';
      }
      total += dayTypeToValue(newLeaveDatesStatus[dateString]);
    });

    for (const dateString in leaveDatesStatus) {
      const isStillInRange = datesInRange.some((d) => getLocalDateString(d) === dateString);
      if (!isStillInRange) {
        delete newLeaveDatesStatus[dateString];
      }
    }

    setLeaveDatesStatus(newLeaveDatesStatus);
    setCalculatedDays(total);
  }, [startDate, endDate]);

  const handleDayTypeChange = (dateString, type) => {
    setLeaveDatesStatus((prevStatus) => {
      const updatedStatus = { ...prevStatus, [dateString]: type };
      let total = 0;
      for (const key in updatedStatus) {
        total += dayTypeToValue(updatedStatus[key]);
      }
      setCalculatedDays(total);
      return updatedStatus;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate) return toast.error('Please select a leave date or date range.');
    if (!user?.id) return toast.error('User not logged in.');
    if (!reason) return toast.error('Please provide a reason for your leave.');

    const workingDays = Object.keys(leaveDatesStatus).filter(
      (dateString) => leaveDatesStatus[dateString] !== 'nonWorking'
    );

    if (workingDays.length === 0) return toast.error('All selected days are non-working days.');

    const leaveTypeMap = {
      casual: 'CASUAL_LEAVE',
      sick: 'SICK_LEAVE',
      unpaid: 'UNPAID_LEAVE',
    };

    const formattedStartDate = getLocalDateString(startDate);
    const formattedEndDate = endDate ? getLocalDateString(endDate) : formattedStartDate;

    const leavePayload = {
      leaveType: leaveTypeMap[leaveCategory] || 'CASUAL_LEAVE',
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      reason,
      totalLeaveDay: calculatedDays,
      days: workingDays.map((date) => ({
        date,
        dayType:
          leaveDatesStatus[date] === 'firstHalf'
            ? 'FIRST_HALF'
            : leaveDatesStatus[date] === 'secondHalf'
              ? 'SECOND_HALF'
              : 'FULL_DAY',
      })),
    };

    try {
      const data = await addLeave(leavePayload);
      if (data.status === 400 || data.status === 403 || data.status === 500 || data.success === false) {
        return toast.error(data.error);
      }
      toast.success('Leave request submitted successfully!');

      // Reset form
      setStartDate(null);
      setEndDate(null);
      setLeaveDatesStatus({});
      setLeaveCategory('casual');
      setReason('');
      setCalculatedDays(0);
    } catch (error) {
      console.error('Error adding leave:', error);
      toast.error('Failed to add leave. Please try again.');
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}, ${date.getFullYear()}`;
  };

  const leaveDetailsForDisplay = useMemo(() => {
    const details = [];
    const sortedDateStrings = Object.keys(leaveDatesStatus).sort();

    sortedDateStrings.forEach((dateString) => {
      const type = leaveDatesStatus[dateString];
      const isNonWorking = type === 'nonWorking';
      let displayStatus = '';
      if (isNonWorking) {
        displayStatus = 'Non Working day';
      } else {
        switch (type) {
          case 'full':
            displayStatus = 'Full day';
            break;
          case 'firstHalf':
            displayStatus = 'First Half';
            break;
          case 'secondHalf':
            displayStatus = 'Second Half';
            break;
          default:
            displayStatus = 'Full day';
        }
      }
      details.push({
        date: dateString,
        dayName: getDayName(dateString),
        status: displayStatus,
        isNonWorking: isNonWorking,
        currentType: type,
      });
    });
    return details;
  }, [leaveDatesStatus]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Apply Leave 
        </h2>
      </div>

      <div className="backdrop-blur-lg bg-white/30 dark:bg-white/10 border border-white/20 rounded-2xl shadow-2xl w-11/12 md:w-4/5 lg:w-3/4 max-w-5xl p-6 mx-auto my-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Form Section */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type */}
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Leave Type</label>
                <select
                  value={leaveCategory}
                  onChange={(e) => setLeaveCategory(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              {/* Leave Date Range */}

              <div className="mb-4 w-full max-w-sm">
                <label className="block mb-1 text-gray-700 font-medium">Leave Dates</label>

                <div className="relative">
                  <DatePicker
                    selected={startDate}
                    onChange={(update) => {
                      if (Array.isArray(update)) {
                        setStartDate(update[0]);
                        setEndDate(update[1] || null);
                      }
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    dateFormat="dd MMM yyyy"
                    placeholderText="Select leave dates"
                    className="w-full border border-gray-300 rounded-lg pl-4 mr-16 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    popperPlacement="bottom-start"
                  />

                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Leave Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  placeholder="Describe your reason..."
                  className="w-full border border-gray-300 px-3 py-2 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-900 shadow-lg transition duration-300"
              >
                Apply Leave
              </button>
            </form>
          </div>

          {/* Right Leave Details */}
          <div className="flex-1 backdrop-blur-md bg-white/20 dark:bg-white/5 border border-white/10 p-5 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🗓️ Leave Details</h3>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
              {leaveDetailsForDisplay.length > 0 ? (
                leaveDetailsForDisplay.map((detail, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/70 p-3 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div>
                      <span className="font-semibold text-gray-700">
                        {formatDateForDisplay(detail.date)}
                      </span>{' '}
                      <span className="text-sm text-gray-500">({detail.dayName})</span>
                    </div>

                    {detail.isNonWorking ? (
                      <span className="text-gray-500 text-sm mt-2 sm:mt-0">{detail.status}</span>
                    ) : (
                      <select
                        value={detail.currentType}
                        onChange={(e) => handleDayTypeChange(detail.date, e.target.value)}
                        className="mt-2 sm:mt-0 border border-gray-300 px-3 py-1 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="full">Full Day</option>
                        <option value="firstHalf">First Half</option>
                        <option value="secondHalf">Second Half</option>
                      </select>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Select dates to view details.</p>
              )}
            </div>

            {/* Total Days */}
            <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-base font-medium text-gray-800">Total Leave</span>
              <span className="text-xl font-bold text-blue-700">
                {calculatedDays} day{calculatedDays !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeaveForm;
