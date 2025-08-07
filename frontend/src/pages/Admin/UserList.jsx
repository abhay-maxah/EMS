import { useEffect, useState } from 'react';
import useUserStore from '../../store/useUserStore';
import useCompanyStore from '../../store/useCompanyStore';
import { toast } from 'react-toastify';
import LoadingBar from '../../components/commonComponent/LoadingBar';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formState, setFormState] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isCompanyPresent } = useCompanyStore();

  const { getAllUsers, updateUserInfo, deleteUser, user } = useUserStore();

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCompanyPresent) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllUsers();
        setUsers(res.data || []);

        const initialForm = {};
        res.data.forEach((user) => {
          initialForm[user.id] = {
            name: user.userInfo?.name || '',
            team: user.team || '',
            userName: user.userName || '',
            totalLeaveDays: user.totalLeaveDays || '',
            address: user.userInfo?.address || '',
            city: user.userInfo?.city || '',
            state: user.userInfo?.state || '',
            Gender: user.userInfo?.Gender || '',
            role: user.role || '',
            DOB: user.userInfo?.DOB?.substring(0, 10) || '',
            JoiningDate: user.userInfo?.JoiningDate?.substring(0, 10) || '',
          };
        });
        setFormState(initialForm);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  const handleInputChange = (userId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    const userId = selectedUserId;
    const updatedData = formState[userId];
    const {
      name,
      address,
      city,
      state,
      Gender,
      DOB,
      JoiningDate,
      team,
      role,
      totalLeaveDays,
    } = updatedData;

    const payload = {
      team,
      role,
      totalLeaveDays: parseFloat(totalLeaveDays),
      userInfo: {
        name,
        address,
        city,
        state,
        Gender,
        DOB: DOB ? new Date(DOB).toISOString() : undefined,
        JoiningDate: JoiningDate
          ? new Date(JoiningDate).toISOString()
          : undefined,
      },
    };

    const res = await updateUserInfo(userId, payload);
    if (res.success) {
      toast.success('User updated successfully');
      setEditMode(false);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
              ...user,
              team: payload.team,
              role: payload.role,
              totalLeaveDays: payload.totalLeaveDays,
              userInfo: {
                ...user.userInfo,
                name: payload.userInfo.name,
                address: payload.userInfo.address,
                city: payload.userInfo.city,
                state: payload.userInfo.state,
                Gender: payload.userInfo.Gender,
                DOB: payload.userInfo.DOB,
                JoiningDate: payload.userInfo.JoiningDate,
              },
            }
            : user
        )
      );
    } else {
      toast.error(res.error || 'Update failed');
    }
  };

  const handleDelete = async (userId) => {
    if (userId === user?.id) {
      toast.error("⚠️ You can't delete your own account.");
      return;
    }
    const res = await deleteUser(userId);
    if (res?.success) {
      toast.success('User deleted successfully');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUserId(null);
      setEditMode(false);
    } else {
      toast.error(res?.message || 'Failed to delete user');
    }
  };

  const closeModal = () => {
    setSelectedUserId(null);
    setEditMode(false);
  };

  const isSelf = selectedUser?.id === user?.id;
  if (!isCompanyPresent) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Company Not Set Up</h2>
        <p className="text-gray-600">
          Please create or select a company to see All user or Add User.
        </p>
      </div>
    );
  }

  const renderField = (label, field, type = 'text') => {
    const value = formState[selectedUser?.id]?.[field] || '';
    const handleChange = (e) =>
      handleInputChange(selectedUser.id, field, e.target.value);

    const renderInput = () => {
      if (type === 'select') {
        const options =
          field === 'Gender'
            ? ['Male', 'Female']
            : ['user', 'admin'];

        return (
          <select
            value={value}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt || 'Select'}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      );
    };

    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          {label}
        </label>
        {editMode ? (
          renderInput()
        ) : (
          <p className="text-gray-800">{value || '—'}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-600 rounded"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">User</h2>
        </div>
        <button
          onClick={() => navigate('/add-user')}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Add User
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Sr No</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Team</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-0">
                  <LoadingBar />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setEditMode(false);
                  }}
                >
                  <td className="px-4 py-2.5 border text-center">{index + 1}</td>
                  <td className="px-4 py-2 border">
                    {user.userInfo?.name || '—'} ({user.userName})
                  </td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.role}</td>
                  <td className="px-4 py-2 border">{user.team || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">
              {editMode ? 'Edit User' : 'User Details'}
            </h3>

            <div className="space-y-4">
              {renderField('Name', 'name')}
              <div className="grid grid-cols-2 gap-4">
                {renderField('Team', 'team')}
                {renderField('Total Leave Days', 'totalLeaveDays', 'number')}
              </div>
              {renderField('Address', 'address')}
              <div className="grid grid-cols-2 gap-4">
                {renderField('City', 'city')}
                {renderField('State', 'state')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField('DOB', 'DOB', 'date')}
                {renderField('Joining Date', 'JoiningDate', 'date')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField('Gender', 'Gender', 'select')}
                {renderField('Role', 'role', 'select')}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedUser.id)}
                    className={`flex-1 px-4 py-2 ${isSelf
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'} text-white rounded`}
                    disabled={isSelf}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {isSelf && (
              <p className="text-xs text-center text-gray-500 mt-2">
                ⚠️ You cannot delete your own account.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;