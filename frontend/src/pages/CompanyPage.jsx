import { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import useCompanyStore from "../store/useCompanyStore";
import { toast } from "react-toastify";
const CompanyPage = () => {
  const { user } = useUserStore();
  const {
    company,
    createCompany,
    getCompanyById,
    updateCompany,
  } = useCompanyStore();

  const [form, setForm] = useState({ name: "", address: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.companyId && !company) {
      getCompanyById(user.companyId).catch(() =>
        toast.error("Failed to load company")
      );
    }
  }, [user?.companyId, company]);

  const handleCreate = async () => {
    if (!form.name || !form.address) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await createCompany(form);
      toast.success("Company created successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Error creating company");
    }
  };


  const handleUpdate = async () => {
    try {
      await updateCompany(user.companyId, form);
      toast.success("Company updated");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error updating company");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({ name: company?.name || "", address: company?.address || "" });
  };
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 ">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Company Details
        </h2>
      </div>

      {user?.companyId ? (
        <div className="border rounded-xl p-6 shadow-md bg-white">
          {isEditing ? (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full border rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Company Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Update
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Company ID:</span>{" "}
                  {user.companyId}
                </p>
                <p>
                  <span className="font-semibold">Name:</span> {company?.name}
                </p>
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {company?.address}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setForm({
                    name: company?.name || "",
                    address: company?.address || "",
                  });
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Edit
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="border rounded-xl p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">Add Company</h2>
          <input
            type="text"
            placeholder="Company Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Company Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Add Company
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
