import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    department: "",
    role: "",
    address: "",
    imageUrl: "",
  });

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Get current user info from stored token or API
        const response = await api.getUserProfile();
        setUserData({
          fullName: response.name || "",
          email: response.email || "",
          department: response.department || "",
          role: response.role || "",
          address: response.address || "",
          imageUrl: response.imageUrl || "",
        });
        if (response.imageUrl) {
          setImagePreview(response.imageUrl);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("name", userData.fullName);
      formData.append("email", userData.email);
      formData.append("department", userData.department);
      formData.append("address", userData.address);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.updateUserProfile(formData);
      setUserData({
        ...userData,
        imageUrl: response.imageUrl || userData.imageUrl,
      });
      setSuccessMessage("Profile updated successfully!");
      setImageFile(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Still redirect even if logout fails
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#cfd7e7] dark:border-gray-800 bg-white dark:bg-background-dark px-6 py-3 md:px-10">
        <div className="flex items-center gap-4 text-primary-blue">
          <div className="size-8">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-[#0d121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            UniPlan
          </h2>
        </div>

        <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
          >
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 border-4 border-blue-200 dark:border-blue-800">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-white text-5xl">
                      account_circle
                    </span>
                  )}
                </div>

                {/* Name and Role */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                  {userData.fullName || "Profile"}
                </h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                  {userData.role?.replace(/_/g, " ") || "INSTRUCTOR"}
                </p>

                {/* Department Info */}
                {userData.department && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                    {userData.department}
                  </p>
                )}

                {/* Profile Strength */}
                <div className="w-full mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Profile Strength
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      85%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-base">
                    lock
                  </span>
                  <span>Privacy Settings</span>
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-base">
                    notifications
                  </span>
                  <span>Notification Preferences</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    logout
                  </span>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg">
                <p className="text-red-700 dark:text-red-100 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 rounded-lg">
                <p className="text-green-700 dark:text-green-100 text-sm">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Account Settings Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Manage your profile and account preferences
              </p>

              <form onSubmit={handleSaveChanges}>
                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                    Update your personal details and university registration information.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={userData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={userData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Role (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role (Read-only)
                      </label>
                      <input
                        type="text"
                        value={userData.role?.replace(/_/g, " ") || ""}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Contact Admin to change role permissions.
                      </p>
                    </div>
                  </div>

                  {/* Campus Office Address */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Campus Office Address
                    </label>
                    <textarea
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Profile Picture
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Preview */}
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 mb-4">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-white text-6xl">
                            image
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        Preview
                      </p>
                    </div>

                    {/* Upload Area */}
                    <div className="flex-1">
                      <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-600 mb-2">
                            cloud_upload
                          </span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </label>
                      {imageFile && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          ✓ {imageFile.name} selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">
                          save
                        </span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Account Deactivation */}
            <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
                  warning
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    Account Deactivation
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                    Once you deactivate your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
                    Deactivate My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
