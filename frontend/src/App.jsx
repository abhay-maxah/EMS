import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NotFoundPage from "./components/commonComponent/NotFoundPage";
import ServerErrorPage from "./components/commonComponent/ServerErrorPage";
import useUserStore from "./store/useUserStore";
import useNotificationStore from "./store/useNotificationStore"; // ✅ New Zustand store
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
import AddUser from "./components/AddUser";

import socket from "./utils/scoket"; // ✅ WebSocket client setup

function App() {
  const { user, fetchCurrentUser } = useUserStore();
  const { addNotification } = useNotificationStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await fetchCurrentUser();
      setCheckingAuth(false);
    };
    checkAuth();
  }, [fetchCurrentUser]);

  // ✅ WebSocket Event Setup (admin notifications)
  useEffect(() => {
    if (!user) return;

    // Helper to show native notification
    const showNotification = (title, body, onClickUrl) => {
      if (Notification.permission === "granted") {
        const notification = new Notification(title, {
          body,
          icon: "/icons/leave-icon.png", // Add your icon here
          tag: Date.now(), // Prevent duplicate stacking
        });

        // When user clicks the notification
        notification.onclick = () => {
          window.focus();
          if (onClickUrl) {
            window.location.href = onClickUrl;
          }
        };
      }
    };

    // Admin gets notified when a leave is applied
    socket.on("leave_applied", (data) => {
      addNotification({
        type: "leave_applied",
        ...data,
        date: new Date().toLocaleString(),
      });

      const details = `
      ${data.user.userInfo?.name || data.user.email} applied for leave.
      Reason: ${data.reason}
      From: ${data.startDate}
      To: ${data.endDate}
    `.trim();

      showNotification("📅 New Leave Request", details, "/all-leaves");
    });

    // Both admin & user get notified when leave status changes
    socket.on("leave_status_update", (data) => {
      addNotification({
        type: "leave_status_update",
        ...data,
        date: new Date().toLocaleString(),
      });

      const details = `
      Status: ${data.status}
      Reason: ${data.reason}
      From: ${data.startDate}
      To: ${data.endDate}
    `.trim();

      showNotification("✅ Leave Status Updated", details, "/past-leaves");

      if (data.user.id === user.id) {
        toast.success(`Your leave was ${data.status}`);
      }
    });

    return () => {
      socket.off("leave_applied");
      socket.off("leave_status_update");
    };
  }, [user, addNotification]);


  // Ask browser permission once
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {<Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/add-user" element={user ? <AddUser /> : <Navigate to="/" />} />
        <Route path="/apply-leave" element={user ? <ApplyLeaveForm /> : <Navigate to="/login" />} />
        <Route path="/work-report" element={user ? <ViewWorkReport /> : <Navigate to="/login" />} />
        <Route path="/past-leaves" element={user ? <ViewPastLeaves /> : <Navigate to="/login" />} />
        <Route path="/all-leaves" element={user ? <AllLeaves /> : <Navigate to="/login" />} />
        <Route path="/all-reports" element={user ? <AllReport /> : <Navigate to="/login" />} />
        <Route path="/all-users" element={user ? <UserList /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />

        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
