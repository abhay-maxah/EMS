
const Notification = () => {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Notifications</h2>
      {notifications.map((notif, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ccc', margin: '10px 0' }}>
          <strong>{notif.type === "leave_applied" ? "New Leave Applied" : "Leave Status Update"}</strong>
          <div><b>User:</b> {notif.user?.userInfo?.name || notif.user?.email}</div>
          <div><b>Email:</b> {notif.user?.email}</div>
          <div><b>Reason:</b> {notif.reason}</div>
          <div><b>Leave Type:</b> {notif.leaveType}</div>
          <div><b>Total Days:</b> {notif.totalLeaveDay}</div>
          <div><b>Start Date:</b> {new Date(notif.startDate).toLocaleDateString()}</div>
          {notif.endDate && <div><b>End Date:</b> {new Date(notif.endDate).toLocaleDateString()}</div>}
          {notif.status && <div><b>Status:</b> {notif.status}</div>}
          {notif.adminNote && <div><b>Admin Note:</b> {notif.adminNote}</div>}
          <div style={{ fontSize: '0.8rem', color: '#555' }}>{notif.date}</div>
        </div>
      ))}
    </div>
  );
};
export default Notification;