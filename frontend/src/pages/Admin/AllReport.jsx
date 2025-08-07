import { useEffect, useState } from 'react';
import useReportStore from '../../store/useReportStore';
import useCompanyStore from '../../store/useCompanyStore';
import Pagination from '../../components/commonComponent/pagination';
import LoadingBar from '../../components/commonComponent/LoadingBar';

const AllReport = () => {
  const { fetchAllReports, loading } = useReportStore();
  const { isCompanyPresent } = useCompanyStore();

  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [hoveredNote, setHoveredNote] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const [initialLoad, setInitialLoad] = useState(true);

  const getReports = async ({ page = 1, name = '', dateRange = 'All' }) => {
    if (!isCompanyPresent) return;

    try {
      const filterName = name.trim();
      setInitialLoad(true);

      let apiDateRange;
      switch (dateRange) {
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

      const { data, currentPage, totalPages } = await fetchAllReports({
        page,
        name: filterName,
        dateRange: apiDateRange,
      });

      setReports(data || []);
      setCurrentPage(currentPage || 1);
      setTotalPages(totalPages || 1);
    } catch (err) {
      console.error('Failed to load reports:', err.message);
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!isCompanyPresent) return;

    const delayDebounce = setTimeout(() => {
      getReports({ page: 1, name: searchTerm, dateRange: dateFilter });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, dateFilter, isCompanyPresent]);

  const handlePageChange = (newPage) => {
    if (!isCompanyPresent) return;
    getReports({ page: newPage, name: searchTerm, dateRange: dateFilter });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleMouseMove = (e, note) => {
    if (note && note.length > 7) {
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

  if (!isCompanyPresent) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Company Not Set Up</h2>
        <p className="text-gray-600">
          Please create or select a company to see All Reports.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Users Work Reports
        </h2>
      </div>

      {/* 🔍 Filters */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-medium">Search by Username:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter username"
            className="p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Filter by DateRange:</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All</option>
            <option value="LastWeek">Last Week</option>
            <option value="LastMonth">Last Month</option>
            <option value="Last3Months">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* 📄 Reports Table */}
      <div className="overflow-auto rounded-xl shadow-md">
        <table className="w-full border border-gray-200 rounded-xl table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-3 text-left text-sm font-semibold">Sr No.</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">Punch In</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">Punch Out</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">Total Hours</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">Break Time</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">Note</th>
            </tr>
          </thead>

          {/* ✅ Fixed height tbody wrapper */}
          <tbody className="min-h-[400px]">
            {loading || initialLoad ? (
              <tr>
                <td colSpan="8" >
                  <LoadingBar />
                </td>
              </tr>
            ) : reports.length > 0 ? (
              reports.map((report, index) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{formatDate(report.punchIn)}</td>
                  <td className="border px-4 py-2">
                    {report.name} ({report.userName})
                  </td>
                  <td className="border px-4 py-2">
                    {report.punchIn
                      ? new Date(report.punchIn).toLocaleTimeString([], { hour12: true })
                      : '—'}
                  </td>
                  <td className="border px-4 py-2">
                    {report.punchOut
                      ? new Date(report.punchOut).toLocaleTimeString([], { hour12: true })
                      : '—'}
                  </td>
                  <td className="border px-4 py-2">{report.totalWorkingHours || '—'}</td>
                  <td className="border px-4 py-2">{report.breakTime || '—'}</td>
                  <td
                    className="border px-4 py-2 max-w-[200px] truncate overflow-hidden whitespace-nowrap"
                    onMouseMove={(e) => handleMouseMove(e, report.note)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {report.note || '—'}

                    {report.note
                      ? report.note.length > 10
                        ? `${report.note.slice(0, 10)}...`
                        : report.note
                      : '—'}
                  </td>
                </tr>
              ))
              ) : (
                  <tr>
                    <td colSpan="9" className="border px-4 py-4 text-center text-gray-500">
                      No reports found.
                    </td>
                  </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🧠 Tooltip */}
      {showTooltip && hoveredNote && (
        <div
          className="fixed z-50 bg-gray-100 text-black text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{ top: tooltipPosition.y, left: tooltipPosition.x }}
        >
          <span className="font-bold text-base">Note:</span> {hoveredNote}
        </div>
      )}

      {/* 📦 Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AllReport;
