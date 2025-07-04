import { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import { toast } from "react-toastify";
import { FaUserEdit, FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import LoadingSpinner from "../components/LoadingSpinner";

const ProfilePage = () => {
  const { user, fetchCurrentUser, userInfo, updateUserInfo } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      const {
        name = "",
        Gender = "",
        DOB = "",
        JoiningDate = "",
        address = "",
        city = "",
        state = "",
      } = userInfo || {};

      setFormData({
        name,
        Gender,
        DOB: DOB ? new Date(DOB).toISOString().split("T")[0] : "",
        JoiningDate: JoiningDate ? new Date(JoiningDate).toISOString().split("T")[0] : "",
        address,
        city,
        state,
        team: user.team || "",
        totalLeaveDays: user.totalLeaveDays || 0,
      });
    }
  }, [userInfo, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const userId = user.id;
    const {
      name,
      Gender,
      DOB,
      JoiningDate,
      address,
      city,
      state,
      team,
      totalLeaveDays,
    } = formData;

    const payload = {
      team,
      role: user.role,
      totalLeaveDays: user.role === "admin" ? parseFloat(totalLeaveDays) : user.totalLeaveDays,
      userInfo: {
        name,
        Gender,
        DOB: DOB ? new Date(DOB).toISOString() : null,
        JoiningDate: JoiningDate ? new Date(JoiningDate).toISOString() : null,
        address,
        city,
        state,
      },
    };

    try {
      const res = await updateUserInfo(userId, payload);
      if (res.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        fetchCurrentUser();
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    const {
      name = "",
      Gender = "",
      DOB = "",
      JoiningDate = "",
      address = "",
      city = "",
      state = "",
    } = userInfo || {};

    setFormData({
      name,
      Gender,
      DOB: DOB ? new Date(DOB).toISOString().split("T")[0] : "",
      JoiningDate: JoiningDate ? new Date(JoiningDate).toISOString().split("T")[0] : "",
      address,
      city,
      state,
      team: user.team || "",
      totalLeaveDays: user.totalLeaveDays || 0,
    });
  };

  if (!user || !formData) {
    return <LoadingSpinner />;
  }
  return (
    <div className="flex justify-center items-center m-8 bg-gradient-to-br from-white-50 to-purple-100">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-blue-600 rounded"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Profile</h2>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-8 w-full">
          {/* Avatar and Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 relative">
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                {formData.name?.charAt(0) || "U"}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-0 right-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full shadow-md transition"
                >
                  <FaUserEdit /> Edit
                </button>
              )}
              <div className="text-lg text-gray-800">
                <span className="font-semibold">Email:</span> {user.email}
              </div>
              <div className="text-lg text-gray-800">
                <span className="font-semibold">Username:</span> {user.userName || "N/A"}
              </div>
              <div className="text-lg text-gray-800">
                <span className="font-semibold">Role:</span> {user.role.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            {/* Row 1: Name and Gender */}
            <div className="flex flex-col md:flex-row md:gap-6">
              {/* Name */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-gray-800">{formData.name || "N/A"}</div>
                )}
              </div>
              {/* Gender */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                {isEditing ? (
                  <select
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="text-gray-800">{formData.Gender || "N/A"}</div>
                )}
              </div>
            </div>

            {/* Row 2: Team and Total Leave Days */}
            <div className="flex flex-col md:flex-row md:gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="team"
                    value={formData.team}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-gray-800">{formData.team || "N/A"}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Leave Days</label>
                {isEditing ? (
                  user.role === "admin" ? (
                    <input
                      type="number"
                      name="totalLeaveDays"
                      value={formData.totalLeaveDays}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : (
                    <div className="text-gray-800">{formData.totalLeaveDays}</div>
                  )
                ) : (
                  <div className="text-gray-800">{formData.totalLeaveDays}</div>
                )}
              </div>
            </div>

            {/* Row 3: DOB and Joining Date */}
            <div className="flex flex-col md:flex-row md:gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-gray-800">
                    {formData.DOB ? new Date(formData.DOB).toLocaleDateString() : "N/A"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="JoiningDate"
                    value={formData.JoiningDate}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-gray-800">
                    {formData.JoiningDate ? new Date(formData.JoiningDate).toLocaleDateString() : "N/A"}
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Address, City, State (ALL IN ONE ROW) */}
            <div className="flex flex-col md:flex-row md:gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-gray-800">{formData.address || "N/A"}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-gray-800">{formData.city || "N/A"}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-gray-800">{formData.state || "N/A"}</div>
                )}
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full shadow transition"
              >
                <FaSave /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-full shadow transition"
              >
                <MdCancel /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );  
};

export default ProfilePage;
