import { useEffect, useState } from 'react';
import useLeaveStore from '../../store/useLeaveStore';
import useUserStore from '../../store/useUserStore';
import useCompanyStore from '../../store/useCompanyStore';
import { toast } from 'react-toastify';
import LoadingBar from '../../components/commonComponent/LoadingBar';
import Pagination from '../../components/commonComponent/pagination';

const LeaveStatus = ['PENDING', 'APPROVED', 'REJECTED'];

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const AllLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showAdminNoteModal, setShowAdminNoteModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const [selectedUserName, setSelectedUserName] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [userList, setUserList] = useState([]);

  const fetchLeavesForAdmin = useLeaveStore((state) => state.fetchLeavesForAdmin);
  const fetchLeaveById = useLeaveStore((state) => state.fetchLeaveById);
  const updateLeaveStatus = useLeaveStore((state) => state.updateLeaveStatus);
  const getUserList = useUserStore((state) => state.getUserList);
  const isCompanyPresent = useCompanyStore((state) => state.isCompanyPresent);
  const formatDateWithWeekday = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatDateWithTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };


  const getDayName = (date) => new Date(date).toLocaleDateString('en-GB', { weekday: 'short' });

  const getDMY = (date) => new Date(date).toLocaleDateString('en-GB');

  const norm = (str) => str?.toUpperCase().replace(/\s/g, '_');

  const tickIf = (condition) => condition ? '✓' : '';

  const loadLeaves = async (page = 1) => {
    setLoading(true);
    const filters = {
      userName: selectedUserName !== 'All' ? selectedUserName : undefined,
      year:
        selectedYear === 'All'
          ? undefined
          : selectedYear === 'Current'
            ? 'current'
            : 'last',
    };

    try {
      const response = await fetchLeavesForAdmin({
        page,
        limit: 10,
        ...filters,
      });
      if (response?.data) {
        setLeaves(response.data);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || 1);
      }
    } catch (err) {
      toast.error('Failed to fetch leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCompanyPresent) {
      getUserList()
        .then((users) => {
          if (Array.isArray(users)) setUserList(users);
        })
        .catch(() => {
          toast.error('Failed to fetch user list');
        });
    }
  }, [isCompanyPresent]);

  useEffect(() => {
    if (isCompanyPresent) loadLeaves(currentPage);
  }, [isCompanyPresent, currentPage, selectedUserName, selectedYear]);

  const handleRowClick = async (leaveId) => {
    const data = await fetchLeaveById(leaveId);
    if (data) setSelectedLeave(data);
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    if (newStatus === 'REJECTED') {
      setPendingStatusChange({ leaveId, newStatus });
      setShowAdminNoteModal(true);
    } else {
      try {
        await updateLeaveStatus(leaveId, newStatus);
        setLeaves((prev) =>
          prev.map((leave) =>
            leave.id === leaveId ? { ...leave, status: newStatus } : leave
          )
        );
        toast.success(`Leave status updated to ${newStatus}`);
      } catch (err) {
        toast.error(`Error updating leave status: ${err}`);
      }
    }
  };

  const handleAdminNoteSubmit = async () => {
    const { leaveId, newStatus } = pendingStatusChange;
    try {
      await updateLeaveStatus(leaveId, newStatus, adminNote);
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === leaveId
            ? { ...leave, status: newStatus, adminNote }
            : leave
        )
      );
      toast.success('Leave rejected with admin note');
      setShowAdminNoteModal(false);
      setAdminNote('');
      setPendingStatusChange(null);
    } catch (err) {
      toast.error(`Error rejecting leave: ${err}`);
    }
  };

  if (!isCompanyPresent) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Company Not Set Up</h2>
        <p className="text-gray-600">
          Please create or select a company to manage leave requests.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Leave Requests
        </h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="font-medium mr-2">Filter by Username:</label>
          <select
            value={selectedUserName}
            onChange={(e) => {
              setSelectedUserName(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="All">All</option>
            {userList.map((user) => (
              <option key={user.userName} value={user.userName}>
                {user.userName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium mr-2">Filter by Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="All">All</option>
            <option value="Current">Current Year</option>
            <option value="Last">Last Year</option>
          </select>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Sr No.</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Start</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">End</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Days</th>
            </tr>
          </thead>

          {/* ✅ Loading bar row */}
          {loading && (
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 pt-2 pb-1">
                  <LoadingBar />
                </td>
              </tr>
            </tbody>
          )}

          {!loading && (
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave, index) => (
                  <tr
                    key={leave.id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => handleRowClick(leave.id)}
                  >
                    <td className="px-4 py-4">{index + 1 + (currentPage - 1) * 10}</td>
                    <td className="px-4 py-4">{leave.user?.userName || 'N/A'}</td>
                    <td className="px-4 py-4">{formatDate(leave.startDate)}</td>
                    <td className="px-4 py-4">{formatDate(leave.endDate)}</td>
                    <td className="px-4 py-4 capitalize">
                      {leave.leaveType.replace('_', ' ').toLowerCase()}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={leave.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(leave.id, e.target.value)}
                        className="border border-gray-300 rounded-md p-1 text-sm bg-white"
                      >
                        {LeaveStatus.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-right">{leave.totalLeaveDay ?? 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      {totalPages > 1 && !loading && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {selectedLeave && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl mx-4 relative animate-fade-in">

            {/* Close Button */}
            <button
              onClick={() => setSelectedLeave(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Heading */}
            <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
              Leave Details
            </h3>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-5">
              {/* Leave Type */}
              <DetailBox
                label="Leave Type"
                value={selectedLeave.leave?.leaveType?.replace(/_/g, ' ') || '—'}
                iconPath="M12 6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2h4a2 2 0 002-2v-2m0-12v16m0-16h6a2 2 0 012 2v12a2 2 0 01-2 2h-6"
              />
              <DetailBox
                label="Applied By"
                value={`${selectedLeave.appliedBy?.name || '—'} (${selectedLeave.appliedBy?.email || '—'})`}
                iconPath="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />


              {/* Applied At */}
              <DetailBox
                label="Applied At"
                value={selectedLeave.leave?.appliedAt ? formatDateWithTime(selectedLeave.leave.appliedAt) : '—'}
                iconPath="M8 7V3m8 4V3M4 11h16M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
              />

              {/* Approved/Rejected At */}
              <DetailBox
                label="Reviewed At"
                value={selectedLeave.leave?.approvedRejectedAt ? formatDateWithTime(selectedLeave.leave.approvedRejectedAt) : '—'}
                iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />

              {/* Status */}
              <DetailBox
                label="Status"
                valueClassName={
                  selectedLeave.leave?.status?.toLowerCase() === 'approved'
                    ? 'text-green-600'
                    : selectedLeave.leave?.status?.toLowerCase() === 'rejected'
                      ? 'text-red-500'
                      : 'text-yellow-600'
                }
                value={selectedLeave.leave?.status || '—'}
                iconPath="M12 9v2m0 4h.01M12 17h0m0-13a9 9 0 100 18 9 9 0 000-18z"
              />

              {/* Total Days */}
              <DetailBox
                label="Total Days"
                value={selectedLeave.leave?.totalLeaveDay || '—'}
                iconPath="M8 7V3m8 4V3m-9 8h10m-12 8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12z"
              />

              {/* Start Date */}
              <DetailBox
                label="Start Date"
                value={formatDateWithWeekday(selectedLeave.leave?.startDate)}
                iconPath="M8 7V3m8 4V3M4 11h16M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
              />

              {/* End Date */}
              <DetailBox
                label="End Date"
                value={formatDateWithWeekday(selectedLeave.leave?.endDate)}
                iconPath="M8 7V3m8 4V3M4 11h16M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
              />

              {/* Reason */}
              <div className="bg-white border rounded-md px-3 py-2 shadow-sm col-span-full">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                <p className="text-gray-800 text-sm">{selectedLeave.leave?.reason || '—'}</p>
              </div>

              {/* Admin Note */}
              <div className="bg-white border rounded-md px-3 py-2 shadow-sm col-span-full">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Admin Note</p>
                <p className="text-gray-800 text-sm">{selectedLeave.leave?.adminNote || 'N/A'}</p>
              </div>
            </div>

            {/* Leave Breakdown Table */}
            {selectedLeave.leave?.days?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Leave Days Breakdown</h4>

                <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-100">
                      <tr className="text-sm text-gray-700">
                        <th className="p-2 border">Sr</th>
                        <th className="p-2 border">Day</th>
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">First Half</th>
                        <th className="p-2 border">Second Half</th>
                        <th className="p-2 border">Full Day</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {selectedLeave.leave.days.map((day, idx) => {
                        const t = norm(day.leaveType);
                        return (
                          <tr key={day.id || idx} className="text-center hover:bg-gray-50">
                            <td className="p-2 border">{idx + 1}</td>
                            <td className="p-2 border">{getDayName(day.date)}</td>
                            <td className="p-2 border">{getDMY(day.date)}</td>
                            <td className="p-2 border text-green-600 font-bold">
                              {tickIf(t === 'FIRST_HALF')}
                            </td>
                            <td className="p-2 border text-green-600 font-bold">
                              {tickIf(t === 'SECOND_HALF')}
                            </td>
                            <td className="p-2 border text-green-600 font-bold">
                              {tickIf(t === 'FULL_DAY')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {showAdminNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Reject Leave</h3>
            <p className="mb-2">Please provide a reason for rejection:</p>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-red-400 bg-white"
              placeholder="Enter rejection reason"
            ></textarea>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAdminNoteModal(false);
                  setAdminNote('');
                  setPendingStatusChange(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminNoteSubmit}
                disabled={!adminNote.trim()}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md transition disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLeaves;
const DetailBox = ({ label, value, valueClassName = '', iconPath }) => (
  <div className="bg-white border rounded-md px-3 py-2 flex items-center gap-2 shadow-sm">
    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
    </svg>
    <div>
      <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`font-semibold capitalize text-gray-800 ${valueClassName}`}>{value}</p>
    </div>
  </div>
);
