import { useEffect, useState, useRef } from "react";
import useUserStore from "../store/useUserStore";
import useCompanyStore from "../store/useCompanyStore";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";

const ProfilePage = () => {
  const hasFetchedCompany = useRef(false);
  const { user, userInfo, updateUserInfo } = useUserStore();
  const {
    company,
    getCompanyById,
    updateCompany,
    createCompany,
    isCompanyPresent,
  } = useCompanyStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    address: "",
  });

  useEffect(() => {
    const fetchOrCreateCompany = async () => {
      if (!user?.companyId || isCompanyPresent || hasFetchedCompany.current) return;

      hasFetchedCompany.current = true;

      try {
        const res = await getCompanyById(user.companyId);

        if (!res || !res.name) {
          const newCompanyData = {
            name: `${user.userName || "New"}'s Company`,
            address: "",
          };

          const createdCompany = await createCompany(newCompanyData);

          toast.success("Company profile created successfully.");
          setCompanyForm({
            name: createdCompany.name || "",
            address: createdCompany.address || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch or create company", err);
      }
    };

    fetchOrCreateCompany();
  }, [user?.companyId, isCompanyPresent]);

  useEffect(() => {
    if (user) {
      const info = userInfo || {};
      const {
        name = "",
        Gender = "",
        DOB = "",
        JoiningDate = "",
        address = "",
        city = "",
        state = "",
        phoneNumber = "",
      } = info;

      setFormData({
        name,
        Gender,
        DOB: DOB ? new Date(DOB).toISOString().split("T")[0] : "",
        JoiningDate: JoiningDate ? new Date(JoiningDate).toISOString().split("T")[0] : "",
        address,
        city,
        state,
        phoneNumber,
        team: user.team || "",
        subteam: user.subteam || "", // ✅ included
        totalLeaveDays: user.totalLeaveDays || 0,
      });
    }

    if (company) {
      setCompanyForm({
        name: company.name || "",
        address: company.address || "",
      });
    }
  }, [userInfo, company]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "team" ? value.toUpperCase() : value,
    }));
  };

  const handleSave = async () => {
    const userId = user.id;

    // 🔐 Only allow 'user' to update subteam
    if (user.role === "user") {
      try {
        const res = await updateUserInfo(userId, { subteam: formData.subteam });

        if (res.success) {
          toast.success("Subteam updated successfully");
          setIsEditing(false);
        } else {
          toast.error(res.error || "Update failed");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }

      return;
    }

    // For admin role
    const phone = formData.phoneNumber;

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Phone number must be 10 digits and start with 6, 7, 8, or 9.");
      return;
    }

    const payload = {
      team: formData.team?.toUpperCase(),
      subteam: formData.subteam,
      role: user.role,
      totalLeaveDays:
        user.role === "admin" ? parseFloat(formData.totalLeaveDays) : user.totalLeaveDays,
      userInfo: {
        name: formData.name,
        Gender: formData.Gender,
        DOB: formData.DOB ? new Date(formData.DOB).toISOString() : null,
        JoiningDate: formData.JoiningDate ? new Date(formData.JoiningDate).toISOString() : null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        phoneNumber: formData.phoneNumber,
      },
    };

    try {
      const res = await updateUserInfo(userId, payload);

      if (res.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);

        if (user.role === "admin") {
          if (user.companyId && isCompanyPresent) {
            await updateCompany(user.companyId, companyForm);
          } else {
            await createCompany(companyForm);
            toast.success("Company created successfully");
          }
        }
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
    const info = userInfo || {};
    const {
      name = "",
      Gender = "",
      DOB = "",
      JoiningDate = "",
      address = "",
      city = "",
      state = "",
      phoneNumber = "",
    } = info;

    setFormData({
      name,
      Gender,
      DOB: DOB ? new Date(DOB).toISOString().split("T")[0] : "",
      JoiningDate: JoiningDate ? new Date(JoiningDate).toISOString().split("T")[0] : "",
      address,
      city,
      state,
      phoneNumber,
      team: user.team || "",
      subteam: user.subteam || "", // ✅ included
      totalLeaveDays: user.totalLeaveDays || 0,
    });

    if (company) {
      setCompanyForm({
        name: company.name || "",
        address: company.address || "",
      });
    }
  };

  if (!user) return <LoadingSpinner />;
  if (!formData) return <div className="text-center text-gray-500">No profile data found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded"></div>
        <h1 className="text-4xl font-bold text-gray-800">Profile</h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {formData.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="text-lg font-medium text-gray-800">{formData.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>

        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-all"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-all"
                >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-medium px-4 py-2 rounded-lg shadow transition-all"
                >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <ProfileSection title="Basic Info">
        <ProfileField label="Name" name="name" value={formData.name ?? ""} onChange={handleChange} isEditing={isEditing && user.role === "admin"} />
        <ProfileField label="Birthday" name="DOB" value={formData.DOB ?? ""} onChange={handleChange} isEditing={isEditing && user.role === "admin"} type="date" />
        <ProfileField label="Gender" name="Gender" value={formData.Gender ?? ""} onChange={handleChange} isEditing={isEditing && user.role === "admin"} type="select" />
      </ProfileSection>

      <ProfileSection title="Contact Info">
        <ProfileField label="Email" value={user.email ?? ""} isEditing={false} />
        <ProfileField label="Phone" name="phoneNumber" value={formData.phoneNumber ?? ""} onChange={handleChange} isEditing={isEditing && user.role === "admin"} />
      </ProfileSection>

      <ProfileSection title="Employment Details">
        <ProfileField label="Team" name="team" value={formData.team ?? ""} onChange={handleChange} isEditing={isEditing && user.role === "admin"} />
        <ProfileField label="Subteam" name="subteam" value={formData.subteam ?? ""} onChange={handleChange} isEditing={isEditing} />
        <ProfileField
          label="Total Leave Days"
          name="totalLeaveDays"
          value={formData.totalLeaveDays ?? ""}
          onChange={handleChange}
          isEditing={isEditing && user.role === "admin"}
          type="number"
        />
        <ProfileField
          label="Joining Date"
          name="JoiningDate"
          value={formData.JoiningDate ?? ""}
          onChange={handleChange}
          isEditing={isEditing && user.role === "admin"}
          type="date"
        />
      </ProfileSection>

      <ProfileSection title="Address">
        <ProfileField label="Address" name="address" value={formData.address ?? ""} onChange={handleChange} isEditing={isEditing && user.role === "admin"} />
        <ProfileField label="City" name="city" value={formData.city ?? ""} onChange={handleChange} isEditing={isEditing && user.role === "admin"} />
        <ProfileField label="State" name="state" value={formData.state ?? ""} onChange={handleChange} isEditing={isEditing && user.role === "admin"} />
      </ProfileSection>

      {user.role === "admin" && (
        <ProfileSection title="Company Details">
          <ProfileField
            label="Company Name"
            name="companyName"
            value={companyForm.name}
            onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
            isEditing={isEditing}
          />
          <ProfileField
            label="Company Address"
            name="companyAddress"
            value={companyForm.address}
            onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
            isEditing={isEditing}
          />
        </ProfileSection>
      )}
    </div>
  );
};

// Section Wrapper
const ProfileSection = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
    <div className="px-4 py-3 border-b font-medium text-gray-700 bg-gray-50">{title}</div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

// Field Renderer
const ProfileField = ({ label, name, value, onChange, isEditing, type = "text" }) => (
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
    <label className="text-gray-600 font-medium w-full md:w-1/4">{label}</label>
    {isEditing ? (
      type === "select" ? (
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className="border rounded px-3 py-1 w-full md:w-3/4 text-sm"
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      ) : (
          <input
            type={type}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className="border rounded px-3 py-1 w-full md:w-3/4 text-sm"
            maxLength={name === "phoneNumber" ? 10 : undefined}
          />
        )
    ) : (
      <div className="text-gray-800 w-full md:w-3/4">{value || "N/A"}</div>
    )}
  </div>
);

export default ProfilePage;
