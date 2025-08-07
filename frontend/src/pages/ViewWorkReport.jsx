import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import useReportStore from '../store/useReportStore';
import { toast } from 'react-toastify';
import Pagination from '../components/commonComponent/pagination';
import LoadingBar from '../components/commonComponent/LoadingBar'; // ✅ Use your custom loading bar

const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};        

const ViewWorkReport = () => {
  const { user, userInfo } = useUserStore();
  const { fetchUserReports } = useReportStore();
  const userId = user?.id || userInfo?.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const dateFilter = searchParams.get('dateRange') || 'All';

  const [reports, setReports] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const [hoveredNote, setHoveredNote] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const loadReports = async (page, range) => {
    try {
      setLoading(true);
      let apiDateRange;

      switch (range) {
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
      setTotalPages(result.totalPages || 1);

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
      loadReports(currentPage, dateFilter);
    }
  }, [userId, currentPage, dateFilter]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setSearchParams({ page, dateRange: dateFilter });
    }
  };

  const handleDateFilterChange = (e) => {
    const newFilter = e.target.value;
    setSearchParams({ page: 1, dateRange: newFilter });
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

      {/* 🔽 Date Filter */}
      <div className="mb-4">
        <label htmlFor="dateFilter" className="mr-2 font-medium text-gray-700">
          Date Range:
        </label>
        <select
          id="dateFilter"
          value={dateFilter}
          onChange={handleDateFilterChange}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="All">All</option>
          <option value="LastWeek">Last Week</option>
          <option value="LastMonth">Last Month</option>
          <option value="Last3Months">Last 3 Months</option>
        </select>
      </div>

      {/* ✅ Date Range Info */}
      {dateFilter !== 'All' && dateRange.startDate && dateRange.endDate && (
        <div className="mb-4 text-gray-600">
          Showing reports from{' '}
          <span className="font-medium">{formatDateTime(dateRange.startDate)}</span> to{' '}
          <span className="font-medium">{formatDateTime(dateRange.endDate)}</span>
        </div>
      )}

      {/* ✅ Table */}
      <div className="rounded-xl shadow-md bg-white overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-full table-fixed">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 text-sm border">S.No</th>
                <th className="p-3 text-sm border">Date</th>
                <th className="p-3 text-sm border">Clock In</th>
                <th className="p-3 text-sm border">Clock Out</th>
                <th className="p-3 text-sm border">Total Hours</th>
                <th className="p-3 text-sm border">Break Time</th>
                <th className="p-3 text-sm border">Note</th>
              </tr>
            </thead>

            {loading ? (
              <tbody>
                <tr>
                  <td colSpan="7">
                    <LoadingBar />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                      <td colSpan="7" className="text-center text-gray-500 p-6">
                      No work reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 transition text-center border-b text-gray-800 cursor-pointer"
                    >
                      <td className="p-3 border">{index + 1}</td>
                      <td className="p-3 border">
                        {report.punchIn
                          ? new Date(report.punchIn).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          : '—'}
                      </td>
                      <td className="p-3 border text-gray-800">{formatTime(report.punchIn)}</td>
                      <td className="p-3 border text-gray-800">
                        {report.punchOut ? formatTime(report.punchOut) : '—'}
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
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* 🧠 Tooltip */}
      {showTooltip && hoveredNote && (
        <div
          className="fixed z-50 bg-gray-50 text-black text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{ top: tooltipPosition.y, left: tooltipPosition.x }}
        >
          <span className="font-bold text-base">Note:</span> {hoveredNote}
        </div>
      )}

      {/* ✅ Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ViewWorkReport;
