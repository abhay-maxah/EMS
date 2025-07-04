import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import useUserStore from "../store/useUserStore";

export default function AddUser() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const { addUser,user } = useUserStore();

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^(){}[\]<>.,:;"'|/\\+=_-])[A-Za-z\d@$!%*?#&^(){}[\]<>.,:;"'|/\\+=_-]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, role } = form;

    if (!username || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be 8+ chars, include uppercase, lowercase, number & special character."
      );
      return;
    } else {
      setPasswordError("");
    }

    const payload = {
      username,
      email,
      password,
      role,
      companyId: user?.companyId,
      createdById: user?.id,
    };

    const result = await addUser(payload);
    if (result.success) {
      navigate("/all-users");
      toast.success("User added successfully");
    } else {
      toast.error(result.error);
    }
  };
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-[93vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Add User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Your username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => {
                handleChange(e);
                if (!validatePassword(e.target.value)) {
                  setPasswordError(
                    "At least 8 chars with uppercase, lowercase, number & special symbol."
                  );
                } else {
                  setPasswordError("");
                }
              }}
              required
              className={`w-full px-4 py-2 border ${passwordError ? "border-red-500" : "border-gray-300"
                } rounded-lg pr-10 focus:outline-none focus:ring-2 ${passwordError ? "focus:ring-red-400" : "focus:ring-blue-400"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? (
                <AiFillEyeInvisible size={22} />
              ) : (
                <AiFillEye size={22} />
              )}
            </button>
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          {/* Role Dropdown */}
          <div>
            <label
              htmlFor="role"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Role
            </label>
            <select
              name="role"
              id="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-lg font-semibold transition"
          >
            Add User
          </button>
        </form>

        <div className="flex flex-col items-center mt-4 space-y-2">
          <p
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/all-users")}
          >
            Back to Users List
          </p>
        </div>
      </div>
    </div>
  );
}
