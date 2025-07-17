import { useEffect, useState } from 'react';
import useLeaveStore from '../store/useLeaveStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/commonComponent/Pagination';

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

  const [allLeaves, setAllLeaves] = useState([]); // unfiltered from backend
  const [filteredLeaves, setFilteredLeaves] = useState([]); // filtered by status
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const leavesPerPage = 10;

  useEffect(() => {
    const getLeaves = async () => {
      setLoading(true);
      try {
        const data = await fetchLeaves({
          page: currentPage,
          limit: leavesPerPage,
          year: yearFilter,
        });

        const backendLeaves = data.leave || [];
        setAllLeaves(backendLeaves);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err?.message || 'Failed to fetch leaves');
      } finally {
        setLoading(false);
      }
    };

    getLeaves();
  }, [yearFilter, currentPage]);

  // Apply client-side status filtering
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredLeaves(allLeaves);
    } else {
      const filtered = allLeaves.filter(
        (l) => l.status?.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredLeaves(filtered);
    }
  }, [statusFilter, allLeaves]);

  const handleRowClick = async (leaveId) => {
    try {
      const data = await fetchLeaveById(leaveId);
      setSelectedLeave(data);
    } catch (err) {
      console.error('Failed to fetch leave details', err);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h2 className="text-3xl md:text-4xl font-bold text-black-800">
          Past Leave Records
        </h2>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500">{error}</p>}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="yearFilter" className="text-black-700 font-medium">
            Filter By Year:
          </label>
          <div className="relative w-40">
            <select
              id="yearFilter"
              className="appearance-none w-full border border-black-300 rounded-lg px-3 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Years</option>
              <option value="current">Current Year</option>
              <option value="last">Last Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-black-500">
              ▼
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="statusFilter" className="text-black-700 font-medium">
            Filter By Status:
          </label>
          <div className="relative w-40">
            <select
              id="statusFilter"
              className="appearance-none w-full border border-black-300 rounded-lg px-3 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-black-500">
              ▼
            </div>
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full table-auto border border-black-300">
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
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave, index) => (
                <tr
                  key={leave.id}
                  className="text-center text-black-700 cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => handleRowClick(leave.id)}
                >
                  <td className="p-3 border">{(currentPage - 1) * leavesPerPage + index + 1}</td>
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
                  <td colSpan="6" className="p-5 text-center text-black-500">
                  No leave records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
                      {formatDate(day.date)} -{' '}
                      {day.leaveType.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setSelectedLeave(null)}
              className="absolute top-2 right-2 bg-black-200 hover:bg-black-300 rounded-full p-1"
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
