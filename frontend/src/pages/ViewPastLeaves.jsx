import { useEffect, useState } from 'react';
import useLeaveStore from '../store/useLeaveStore';
import Pagination from '../components/commonComponent/Pagination';
import LoadingBar from '../components/commonComponent/LoadingBar';

const formatDateWithWeekday = (isoDate) => {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDayName = (isoDate) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-GB', { weekday: 'short' });
};

const getDMY = (isoDate) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ViewPastLeaves = () => {
  const fetchLeaves = useLeaveStore((state) => state.fetchLeaves);
  const fetchLeaveById = useLeaveStore((state) => state.fetchLeaveById);

  const [allLeaves, setAllLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
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
        setAllLeaves(data.leave || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err?.message || 'Failed to fetch leaves');
      } finally {
        setLoading(false);
      }
    };
    getLeaves();
  }, [yearFilter, currentPage]);

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

  const tickIf = (cond) => (cond ? '✓' : '');

  const norm = (t = '') => t.toUpperCase(); // normalize leaveType safely

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h1 className="text-4xl font-bold text-gray-800">Past Leave Records</h1>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="yearFilter" className="text-gray-700 font-medium">
            Filter By Year:
          </label>
          <select
            id="yearFilter"
            className="p-2 border border-gray-300 rounded-md"
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
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-gray-700 font-medium">
            Filter By Status:
          </label>
          <select
            id="statusFilter"
            className="p-2 border border-gray-300 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow-md bg-white overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-sm border">S.No</th>
                <th className="p-3 text-sm border">Start Date</th>
                <th className="p-3 text-sm border">End Date</th>
                <th className="p-3 text-sm border">Type</th>
                <th className="p-3 text-sm border">Status</th>
                <th className="p-3 text-sm border">Total Days</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <LoadingBar />
                  </td>
                </tr>
              ) : filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave, index) => (
                  <tr
                    key={leave.id}
                    className="hover:bg-gray-50 transition text-center border-b cursor-pointer text-base"
                    onClick={() => handleRowClick(leave.id)}
                  >
                    <td className="p-3 border">
                      {(currentPage - 1) * leavesPerPage + index + 1}
                    </td>
                    <td className="p-3 border">{formatDateWithWeekday(leave.startDate)}</td>
                    <td className="p-3 border">{formatDateWithWeekday(leave.endDate)}</td>
                    <td className="p-3 border">
                      {leave.leaveType?.replace(/_/g, ' ') || '—'}
                    </td>
                    <td
                      className={`p-3 border font-semibold ${leave.status?.toLowerCase() === 'approved'
                        ? 'text-green-600'
                        : leave.status?.toLowerCase() === 'rejected'
                          ? 'text-red-500'
                          : 'text-yellow-600'
                        }`}
                    >
                      {leave.status || '—'}
                    </td>
                    <td className="p-3 border">{leave.totalLeaveDay || '—'}</td>
                  </tr>
                ))
                ) : (
                  <tr>
                  <td colSpan="6" className="text-center text-gray-500 p-6">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal */}
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

            {/* Modal Heading */}
            <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">

              Leave Details
            </h3>

            {/* Leave Detail Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-5">

              {/* Leave Type */}
              <div className="bg-white border rounded-md px-3 py-2 flex items-center gap-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2h4a2 2 0 002-2v-2m0-12v16m0-16h6a2 2 0 012 2v12a2 2 0 01-2 2h-6" />
                </svg>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Leave Type</p>
                  <p className="font-semibold capitalize text-gray-800">{selectedLeave.leave?.leaveType?.replace(/_/g, ' ') || '—'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white border rounded-md px-3 py-2 flex items-center gap-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 17h0m0-13a9 9 0 100 18 9 9 0 000-18z" />
                </svg>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Status</p>
                  <p className={`font-semibold ${selectedLeave.leave?.status?.toLowerCase() === 'approved' ? 'text-green-600' :
                    selectedLeave.leave?.status?.toLowerCase() === 'rejected' ? 'text-red-500' :
                      'text-yellow-600'
                    }`}>
                    {selectedLeave.leave?.status || '—'}
                  </p>
                </div>
              </div>

              {/* Total Days */}
              <div className="bg-white border rounded-md px-3 py-2 flex items-center gap-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12z" />
                </svg>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Total Days</p>
                  <p className="font-semibold text-gray-800">{selectedLeave.leave?.totalLeaveDay || '—'}</p>
                </div>
              </div>

              {/* Start Date */}
              <div className="bg-white border rounded-md px-3 py-2 flex items-center gap-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Start Date</p>
                  <p className="font-semibold text-gray-800">{formatDateWithWeekday(selectedLeave.leave?.startDate)}</p>
                </div>
              </div>

              {/* End Date */}
              <div className="bg-white border rounded-md px-3 py-2 flex items-center gap-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">End Date</p>
                  <p className="font-semibold text-gray-800">{formatDateWithWeekday(selectedLeave.leave?.endDate)}</p>
                </div>
              </div>

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


            {/* Leave Breakdown: Table style with tick marks */}
            {selectedLeave.leave?.days?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Leave Days Breakdown
                </h4>

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
    </div>
  );
};

export default ViewPastLeaves;
