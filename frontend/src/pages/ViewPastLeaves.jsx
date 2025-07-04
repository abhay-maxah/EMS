import { useEffect, useState } from 'react';
import useLeaveStore from '../store/useLeaveStore';
import LoadingSpinner from '../components/LoadingSpinner';

const formatDate = (isoDate) => {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ViewPastLeaves = () => {
  const fetchLeaves = useLeaveStore((state) => state.fetchLeaves);
  const fetchLeaveById = useLeaveStore((state) => state.fetchLeaveById);

  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const leavesPerPage = 5;

  useEffect(() => {
    const getLeaves = async () => {
      setLoading(true);
      try {
        const data = await fetchLeaves();
        setLeaves(data.leave || []);
      } catch (err) {
        setError(err?.message || 'Failed to fetch leaves');
      } finally {
        setLoading(false);
      }
    };
    getLeaves();
  }, []);

  // Filter logic
  useEffect(() => {
    let temp = [...leaves];

    if (statusFilter !== 'All') {
      temp = temp.filter(
        (l) => l.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredLeaves(temp);
    setCurrentPage(1);
  }, [statusFilter, leaves]);

  const handleRowClick = async (leaveId) => {
    try {
      const data = await fetchLeaveById(leaveId);
      setSelectedLeave(data);
    } catch (err) {
      console.error('Failed to fetch leave details', err);
    }
  };

  // Pagination
  const indexOfLast = currentPage * leavesPerPage;
  const indexOfFirst = indexOfLast - leavesPerPage;
  const currentLeaves = filteredLeaves.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLeaves.length / leavesPerPage);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Past Leave Records
        </h2>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500">{error}</p>}

      {/* Status Filter */}
      <div className="flex justify-end mb-5">
        <div className="relative w-full md:w-48">
          <select
            className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="w-4 h-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full table-auto border border-gray-300">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Start Date</th>
              <th className="p-3 border">End Date</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Total Days</th>
            </tr>
          </thead>
          <tbody>
            {currentLeaves.length > 0 ? (
              currentLeaves.map((leave, index) => (
                <tr
                  key={leave.id}
                  className="text-center text-gray-700 cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => handleRowClick(leave.id)}
                >
                  <td className="p-3 border">{indexOfFirst + index + 1}</td>
                  <td className="p-3 border">{formatDate(leave.startDate)}</td>
                  <td className="p-3 border">{formatDate(leave.endDate)}</td>
                  <td className="p-3 border">
                    {leave.leaveType.replace(/_/g, ' ')}
                  </td>
                  <td
                    className={`p-3 border font-semibold ${leave.status?.toLowerCase() === 'approved'
                        ? 'text-green-600'
                        : leave.status?.toLowerCase() === 'rejected'
                          ? 'text-red-500'
                          : 'text-yellow-600'
                      }`}
                  >
                    {leave.status}
                  </td>
                  <td className="p-3 border">{leave.totalLeaveDay}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-5 text-center text-gray-500"
                >
                  No leave records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded-md ${currentPage === idx + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              Leave Details
            </h3>

            <div className="space-y-2">
              <p>
                <strong>Leave Type:</strong>{' '}
                {selectedLeave.leave?.leaveType.replace(/_/g, ' ')}
              </p>
              <p>
                <strong>Status:</strong> {selectedLeave.leave?.status}
              </p>
              <p>
                <strong>Total Days:</strong>{' '}
                {selectedLeave.leave?.totalLeaveDay}
              </p>
              <p>
                <strong>Start Date:</strong>{' '}
                {formatDate(selectedLeave.leave?.startDate)}
              </p>
              <p>
                <strong>End Date:</strong>{' '}
                {formatDate(selectedLeave.leave?.endDate)}
              </p>
              <p>
                <strong>Reason:</strong> {selectedLeave.leave?.reason}
              </p>
              <p>
                <strong>Admin Note:</strong>{' '}
                {selectedLeave.leave?.adminNote || 'N/A'}
              </p>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Leave Days Breakdown:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedLeave.leave?.days?.map((day) => (
                    <li key={day.id}>
                      {formatDate(day.date)} - {day.leaveType.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setSelectedLeave(null)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPastLeaves;
