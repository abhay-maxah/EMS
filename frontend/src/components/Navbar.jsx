import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";

const Navbar = () => {
  const { user, logoutUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const linkClass = (path) =>
    `inline-flex items-center px-3 py-2 text-base rounded-md transition-colors duration-200 ${location.pathname === path
      ? "text-blue-600 border-b-2 border-blue-500"
      : "text-gray-700 hover:text-blue-500 hover:border-b-2 hover:border-gray-300"
    }`;

  return (
    <nav className="bg-white shadow-md px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 hover:text-blue-700"
        >
          Clockly
        </Link>

        {/* Hamburger Button */}
        <button
          className="md:hidden text-3xl text-blue-600 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-2 items-center">
          {!user ? (
            <>
              <Link to="/login" className={linkClass("/login")}>
                Login
              </Link>
              {/* <Link to="/signup" className={linkClass("/signup")}>
                Signup
              </Link> */}
            </>
          ) : (
            <>
              <Link to="/" className={linkClass("/")}>
                Home
              </Link>
              <Link to="/apply-leave" className={linkClass("/apply-leave")}>
                Apply Leave
              </Link>
              <Link to="/work-report" className={linkClass("/work-report")}>
                View Report
              </Link>
              <Link to="/past-leaves" className={linkClass("/past-leaves")}>
                Past Leaves
              </Link>
              <Link to="/profile" className={linkClass("/profile")}>
                Profile
              </Link>

              {user.role === "admin" && (
                <>
                  <Link to="/all-leaves" className={linkClass("/all-leaves")}>
                    All Leaves
                  </Link>
                  <Link to="/all-reports" className={linkClass("/all-reports")}>
                    All Reports
                  </Link>
                  <Link to="/all-users" className={linkClass("/all-users")}>
                    All Users
                  </Link>
                  <Link to="/company" className={linkClass("/company")} onClick={() => setMenuOpen(false)}>
                    Company
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 space-y-1 bg-white rounded shadow px-4 py-3">
          {!user ? (
            <>
              <Link to="/login" className={linkClass("/login")} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              {/* <Link to="/signup" className={linkClass("/signup")} onClick={() => setMenuOpen(false)}>
                Signup
              </Link> */}
            </>
          ) : (
            <>
              <Link to="/" className={linkClass("/")} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link to="/apply-leave" className={linkClass("/apply-leave")} onClick={() => setMenuOpen(false)}>
                Apply Leave
              </Link>
              <Link to="/work-report" className={linkClass("/work-report")} onClick={() => setMenuOpen(false)}>
                View Report
              </Link>
              <Link to="/past-leaves" className={linkClass("/past-leaves")} onClick={() => setMenuOpen(false)}>
                Past Leaves
              </Link>
              <Link to="/profile" className={linkClass("/profile")} onClick={() => setMenuOpen(false)}>
                Profile
              </Link>

              {user.role === "admin" && (
                <>
                  <Link to="/all-leaves" className={linkClass("/all-leaves")} onClick={() => setMenuOpen(false)}>
                    All Leaves
                  </Link>
                  <Link to="/all-reports" className={linkClass("/all-reports")} onClick={() => setMenuOpen(false)}>
                    All Reports
                  </Link>
                  <Link to="/all-users" className={linkClass("/all-users")} onClick={() => setMenuOpen(false)}>
                    All Users
                  </Link>
                  <Link to="/company" className={linkClass("/company")} onClick={() => setMenuOpen(false)}>
                    Company
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;