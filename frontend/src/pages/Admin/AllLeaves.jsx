import { useEffect, useState } from 'react';
import useLeaveStore from '../../store/useLeaveStore';
import useUserStore from '../../store/useUserStore';
import useCompanyStore from '../../store/useCompanyStore';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
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
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-xl">
            <h3 className="text-2xl font-semibold mb-4">Leave Details</h3>
            <div className="space-y-2">
              <p><strong>Username:</strong> {selectedLeave.appliedBy?.userName || 'N/A'}</p>
              <p><strong>Name:</strong> {selectedLeave.appliedBy?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedLeave.appliedBy?.email}</p>
              <p><strong>Role:</strong> {selectedLeave.appliedBy?.role}</p>
              <p><strong>Leave Type:</strong> {selectedLeave.leave?.leaveType.replace('_', ' ')}</p>
              <p><strong>Status:</strong> {selectedLeave.leave?.status}</p>
              <p><strong>Total Days:</strong> {selectedLeave.leave?.totalLeaveDay}</p>
              <p><strong>Start Date:</strong> {formatDate(selectedLeave.leave?.startDate)}</p>
              <p><strong>End Date:</strong> {formatDate(selectedLeave.leave?.endDate)}</p>
              <p><strong>Reason:</strong> {selectedLeave.leave?.reason}</p>
              <p><strong>Admin Note:</strong> {selectedLeave.leave?.adminNote}</p>
            </div>

            {selectedLeave.leave?.days?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Leave Days Breakdown:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedLeave.leave.days.map((day) => (
                    <li key={day.id}>
                      {formatDate(day.date)} - {day.leaveType.replace('_', ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 bg-gray-700 text-white hover:bg-gray-800 rounded-md transition"
              >
                Close
              </button>
            </div>
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
