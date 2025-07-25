import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserStore from "../store/useUserStore";

export default function SignupDetailsForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    joiningDate: "",
    gender: "",
    dob: "",
    team: "",
  });

  const { user ,updateUserInfo, loading } = useUserStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      toast.error("Please enter your name.");
      return;
    }

    if (!form.phone) {
      toast.error("Please enter your phone number.");
      return;
    }

    if (user?.id) {
      toast.error("User ID not found. Please login again.");
      return;
    }

    const updateData = {
      team: form.team || null,
      userInfo: {
        name: form.name,
        phoneNumber: form.phone,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        Gender: form.gender || null,
        DOB: form.dob ? new Date(form.dob).toISOString() : null,
        JoiningDate: form.joiningDate ? new Date(form.joiningDate).toISOString() : null,
      },
    };

    const result = await updateUserInfo(user.id, updateData);

    if (result.success) {
      toast.success("Registration complete!");
      navigate("/");
    } else {
      toast.error(result.error || "Failed to update user info.");
    }
  };

  return (
    <div className="h-[93vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg space-y-5"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-4">
          Complete Your Profile
        </h2>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"                                    
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                handleChange(e); // only allow numbers up to 10 digits
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
          />
          {form.phone.length !== 10 && form.phone.length > 0 && (
            <p className="text-xs text-red-500 mt-1">Phone number must be exactly 10 digits.</p>
          )}
        </div>



        {/* Address */}
        <div>
          <label className="block text-sm font-semibold mb-1">Address</label>
          <input
            type="text"
            name="address"
            placeholder="Your address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold mb-1">City</label>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        
        {/* Team */}
        <div>
          <label className="block text-sm font-semibold mb-1">Team </label>
          <input
            type="text"
            name="team"
            placeholder="Team name (e.g., MERN)"
            value={form.team}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Joining Date */}
        <div>
          <label className="block text-sm font-semibold mb-1">Joining Date</label>
          <input
            type="date"
            name="joiningDate"
            value={form.joiningDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold mb-1">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-semibold mb-1">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]} // Today date in YYYY-MM-DD format
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
          />
        </div>


        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-semibold transition ${loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600"
            }`}
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </form>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
