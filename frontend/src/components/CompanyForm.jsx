import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddCompanyPage() {
  const [form, setForm] = useState({ name: "", address: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.name || !form.address) {
      toast.error("Please fill in all fields.");
      return;
    }
    toast.success(form);

    navigate("/signup-details");
  };

  const handleSkip = () => {
    navigate("/signup-details");
  };

  return (
    <div className="h-[93vh] flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600">
          Add Company
        </h2>

        <div>
          <label
            htmlFor="name"
            className="block mb-1 font-medium text-gray-700"
          >
            Company Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter company name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block mb-1 font-medium text-gray-700"
          >
            Address
          </label>
          <textarea
            name="address"
            id="address"
            placeholder="Enter address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Submit
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}
