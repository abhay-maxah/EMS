import { useEffect, useState } from 'react';
import useUserStore from '../store/useUserStore';
import useReportStore from '../store/useReportStore';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const ViewWorkReport = () => {
  const { user, userInfo } = useUserStore();
  const { fetchUserReports } = useReportStore(); // only use fetchUserReports
  const userId = user?.id || userInfo?.id;

  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const [hoveredNote, setHoveredNote] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const loadReports = async (page) => {
    try {
      setLoading(true);

      let apiDateRange;
      switch (dateFilter) {
        case 'LastWeek':
          apiDateRange = '1week';
          break;
        case 'LastMonth':
          apiDateRange = '1month';
          break;
        case 'Last3Months':
          apiDateRange = '3months';
          break;
        default:
          apiDateRange = 'all';
      }

      const result = await fetchUserReports(userId, page, apiDateRange);

      setReports(result.data || []);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);

      if (result.date?.startDate && result.date?.endDate) {
        setDateRange({
          startDate: result.date.startDate,
          endDate: result.date.endDate,
        });
      } else {
        setDateRange({ startDate: null, endDate: null });
      }
    } catch (error) {
      toast.error('Failed to load work reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadReports(currentPage);
    }
  }, [userId, currentPage, dateFilter]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleMouseMove = (e, note) => {
    if (note && note.length > 10) {
      setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
      setHoveredNote(note);
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setHoveredNote('');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h1 className="text-4xl font-bold text-gray-800">Work Report</h1>
      </div>

      {/* 🔽 Date Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="dateFilter" className="mr-2 font-medium text-gray-700">
          Date Range:
        </label>
        <select
          id="dateFilter"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1); // reset to first page
          }}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="All">All</option>
          <option value="LastWeek">Last Week</option>
          <option value="LastMonth">Last Month</option>
          <option value="Last3Months">Last 3 Months</option>
        </select>
      </div>

      {/* ✅ Show selected start/end date */}
      {dateFilter !== 'All' && dateRange.startDate && dateRange.endDate && (
        <div className="mb-4 text-gray-600">
          Showing reports from{' '}
          <span className="font-medium">{formatDateTime(dateRange.startDate)}</span> to{' '}
          <span className="font-medium">{formatDateTime(dateRange.endDate)}</span>
        </div>
      )}

      {/* 🔄 Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-gray-500 bg-white p-6 rounded-xl shadow-md">
          No work reports found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-md bg-white">
          <table className="w-full table-auto">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-3 text-sm border">S.No</th>
                <th className="p-3 text-sm border">Clock In</th>
                <th className="p-3 text-sm border">Clock Out</th>
                <th className="p-3 text-sm border">Total Hours</th>
                <th className="p-3 text-sm border">Break Time</th>
                <th className="p-3 text-sm border">Note</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr
                  key={report.id}
                  className="hover:bg-blue-50 transition text-center border-b cursor-pointer"
                >
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border">{formatDateTime(report.punchIn)}</td>
                  <td className="p-3 border">
                    {report.punchOut ? formatDateTime(report.punchOut) : '—'}
                  </td>
                  <td className="p-3 border">{report.totalWorkingHours}</td>
                  <td className="p-3 border">
                    {report.BreakTime || report.breakTime || '00:00:00'}
                  </td>
                  <td
                    className="p-3 border"
                    onMouseMove={(e) => handleMouseMove(e, report.note)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {report.note
                      ? report.note.length > 20
                        ? `${report.note.slice(0, 20)}...`
                        : report.note
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredNote && (
        <div
          className="fixed z-50 bg-blue-50 text-black text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{ top: tooltipPosition.y, left: tooltipPosition.x }}
        >
          <span className="font-bold text-base">Note:</span> {hoveredNote}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-md"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-4 py-2 rounded-md ${currentPage === idx + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-md"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewWorkReport;
