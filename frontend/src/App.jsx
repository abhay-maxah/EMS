import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFoundPage from "./components/commonComponent/NotFoundPage";
import ServerErrorPage from "./components/commonComponent/ServerErrorPage";
import useUserStore from "./store/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import ApplyLeaveForm from "./pages/ApplyLeaveForm";
import ViewWorkReport from "./pages/ViewWorkReport";
import ViewPastLeaves from "./pages/ViewPastLeaves";
import AllLeaves from "./pages/Admin/AllLeaves";
import AllReport from "./pages/Admin/AllReport";
import UserList from "./pages/Admin/UserList";
import ProfilePage from "./pages/ProfilePage";
import CompanyPage from "./pages/CompanyPage";
import AddUser from "./components/AddUser";
function App() {
  const { user, fetchCurrentUser } = useUserStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await fetchCurrentUser();
      setCheckingAuth(false);
    };
    checkAuth();
  }, [fetchCurrentUser]);

  // ✅ Show spinner until auth check is complete
  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {<Navbar />}

      <Routes>
        {/* Public Routes */}
        {/* <Route path="" element={user ? <Navigate to="/" /> :<SignupPage role="user" />} />
        <Route path="/signup-details" element={<SignupDetailsForm />} /> */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route path="/add-user" element={user ? <AddUser /> : <Navigate to="/" />} />
        <Route
          path="/apply-leave"
          element={user ? <ApplyLeaveForm /> : <Navigate to="/login" />}
        />
        <Route
          path="/work-report"
          element={user ? <ViewWorkReport /> : <Navigate to="/login" />}
        />
        <Route path="/company" element={user ? <CompanyPage /> : <Navigate to="/login" />} />
        <Route
          path="/past-leaves"
          element={user ? <ViewPastLeaves /> : <Navigate to="/login" />}
        />
        <Route
          path="/all-leaves"
          element={user ? <AllLeaves /> : <Navigate to="/login" />}
        />
        <Route
          path="/all-reports"
          element={user ? <AllReport /> : <Navigate to="/login" />}
        />
        <Route
          path="/all-users"
          element={user ? <UserList /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />


        <Route path="/500" element={<ServerErrorPage />} />


        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;