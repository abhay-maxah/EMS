import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import useUserStore from "../store/useUserStore";

export default function LoginPage() {
  const [form, setForm] = useState({ credential: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { loginUser, loading } = useUserStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.credential || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    const res = await loginUser({
      credential: form.credential,
      password: form.password,
    });

    if (res.success) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  return (
    <div className="h-[93vh] flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600">Login</h2>
        <p className="text-center text-gray-500">Welcome back! Please login to your account</p>

        <div>
          <label htmlFor="credential" className="block mb-1 font-medium text-gray-700">
            Username or Email
          </label>
          <input
            type="text"
            name="credential"
            id="credential"
            placeholder="Enter username or email"
            value={form.credential}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <AiFillEyeInvisible className="mt-6" size={22} />
            ) : (
                <AiFillEye className="mt-6" size={22} />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded-lg font-semibold transition ${loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  );
}
