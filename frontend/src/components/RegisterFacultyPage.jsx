import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function RegisterFacultyPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("REGULAR");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setImageFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Name, email and password are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // If image provided, use FormData
      if (imageFile) {
        const fd = new FormData();
        fd.append("name", name);
        fd.append("email", email);
        fd.append("password", password);
        fd.append("phone", phone);
        fd.append("department", department);
        fd.append("address", address);
        fd.append("role", role);
        fd.append("image", imageFile);
        await api.createInstructor(fd);
      } else {
        const payload = { name, email, password, phone, department, address, role };
        await api.createInstructor(payload);
      }

      setSuccess("Faculty account created. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      {/* Background Layer (same as LoginPage) */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://www.dgfivei.com/wp-content/uploads/2023/02/03f.jpg")',
          }}
        ></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(215, 239, 244, 0.8)",
            mixBlendMode: "multiply",
          }}
        ></div>
      </div>

      {/* Main Content - centered card like LoginPage */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[720px] flex flex-col items-stretch justify-start rounded-xl shadow-2xl bg-white dark:bg-background-dark p-8 md:p-10">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg">
              <span className="material-symbols-outlined text-4xl">school</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white text-center">Faculty Portal</h1>
            <p className="text-[#4c669a] dark:text-gray-400 text-sm font-medium mt-1">Create your faculty account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-lg">
              <p className="text-red-700 dark:text-red-100 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 rounded-lg">
              <p className="text-green-700 dark:text-green-100 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-2">Full name <span className="text-red-600">*</span></label>
                <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="form-input block w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-[15px]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-2">Email <span className="text-red-600">*</span></label>
                <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input block w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-[15px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-2">Password <span className="text-red-600">*</span></label>
                <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input block w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-[15px]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-2">Confirm Password <span className="text-red-600">*</span></label>
                <input required type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input block w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-[15px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Phone (e.g. +947XXXXXXXX)" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input block w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-[15px]" />
              <input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="form-input block w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-[15px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="form-input block w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-[15px]" />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="form-input block w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-[15px]">
                <option value="REGULAR">Regular</option>
                <option value="MODULE_LEADER">Module Leader</option>
                <option value="SUPPORTIVE_INSTRUCTOR">Supportive Instructor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-300 mb-2">Profile Image (optional)</label>
              <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-600 mb-2">cloud_upload</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </div>
              </label>
              {imagePreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={imagePreview} alt="preview" className="w-16 h-16 rounded object-cover border" />
                  <p className="text-sm text-green-600 dark:text-green-400">✓ {imageFile?.name} selected</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-1">
              <button type="button" onClick={() => navigate('/login')} className="text-sm text-[#4c669a] hover:underline">Back to login</button>
              <button type="submit" disabled={loading} className="flex items-center justify-center rounded-lg h-12 px-4 bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Creating...' : 'Create Account'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
