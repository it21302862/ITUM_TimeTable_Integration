import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../services/api";

const emptyInstructor = {
  name: "",
  email: "",
  department: "",
  address: "",
};

const InstructorsPage = () => {
  const navigate = useNavigate();
  const { yearId, semesterId } = useParams();
  const location = useLocation();
  
  // Get state from navigation
  const yearLabel = location.state?.yearLabel || "";
  const semesterName = location.state?.semesterName || "";
  
  const [instructors, setInstructors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyInstructor);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [instructorModulesMap, setInstructorModulesMap] = useState({});
  const [loadingModulesMap, setLoadingModulesMap] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Schedule data for selected instructor
  const [instructorSchedule, setInstructorSchedule] = useState([]);
  const [weeklyWorkload, setWeeklyWorkload] = useState(0);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Sorting state
  const [sortBy, setSortBy] = useState("name"); // 'name', 'email', 'department'
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Modal state for add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const data = await api.getInstructors();
      console.log("📋 Fetched instructors:", data?.length, "instructors");
      setInstructors(data || []);

      // Initialize maps for each instructor
      if (data && data.length > 0) {
        // Initialize instructorModulesMap with empty arrays
        const initialModulesMap = {};
        const initialLoadingMap = {};
        data.forEach((ins) => {
          initialModulesMap[ins.id] = [];
          initialLoadingMap[ins.id] = true;
        });
        setInstructorModulesMap(initialModulesMap);
        setLoadingModulesMap(initialLoadingMap);
        
        console.log("⏳ Starting parallel module loading for all instructors...");
        // Load all modules in parallel
        await Promise.all(data.map((ins) => loadModules(ins.id)));
        console.log("All instructor modules loaded");
      }
    } catch (err) {
      console.error("Error loading instructors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load schedule for selected instructor
  const loadInstructorSchedule = async (instructorId) => {
    if (!instructorId) return;
    try {
      setLoadingSchedule(true);
      const options = semesterId ? { semesterId } : {};
      const result = await api.getTimetableSlotsByInstructor(instructorId, options);
      setInstructorSchedule(result.slots || []);
      setWeeklyWorkload(result.weeklyWorkloadHours || 0);
    } catch (err) {
      console.error("Failed to load instructor schedule:", err);
      setInstructorSchedule([]);
      setWeeklyWorkload(0);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const loadModules = async (instructorId) => {
    if (!instructorId) return;
    try {
      setLoadingModulesMap((prev) => ({ ...prev, [instructorId]: true }));

      const options = {};
      
      const modules = await api.getModulesByInstructor(instructorId, options);

      console.log(`Modules loaded for instructor ${instructorId}:`, modules, `Count: ${modules?.length || 0}`);

      setInstructorModulesMap((prev) => ({
        ...prev,
        [instructorId]: modules || [],
      }));
    } catch (err) {
      console.error(`Failed to fetch modules for instructor ${instructorId}:`, err);
      setInstructorModulesMap((prev) => ({ ...prev, [instructorId]: [] }));
    } finally {
      setLoadingModulesMap((prev) => ({ ...prev, [instructorId]: false }));
    }
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startCreate = () => {
    setSelected(null);
    setForm(emptyInstructor);
  };

  const startEdit = (ins) => {
    setSelected(ins);
    setForm({
      name: ins.name || "",
      email: ins.email || "",
      department: ins.department || "",
    });
    loadModules(ins.id);
    loadInstructorSchedule(ins.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (selected) {
      await api.updateInstructor(selected.id, payload);
    } else {
      await api.createInstructor(payload);
    }
    await loadInstructors();
    setSelected(null); // optional: close preview after save
  };

  const handleDelete = async (ins) => {
    if (!window.confirm("Delete this instructor?")) return;
    await api.deleteInstructor(ins.id);
    if (selected?.id === ins.id) setSelected(null);
    await loadInstructors();
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  // Helper to get day abbreviation
  const getDayAbbr = (day) => {
    const dayMap = {
      MONDAY: "MON",
      TUESDAY: "TUE",
      WEDNESDAY: "WED",
      THURSDAY: "THU",
      FRIDAY: "FRI",
    };
    return dayMap[day] || day?.slice(0, 3);
  };

  // Helper to get session type label
  const getSessionTypeLabel = (type) => {
    const typeMap = {
      LECTURE: "Lecture",
      PRACTICAL: "Practical",
      TUTORIAL: "Tutorial",
      EXAM: "Exam",
    };
    return typeMap[type] || type;
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getColorClass = (name) => {
    const colors = [
      {
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary/10",
      },
      {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600",
        border: "border-emerald-500/10",
      },
      {
        bg: "bg-amber-500/10",
        text: "text-amber-600",
        border: "border-amber-500/10",
      },
      {
        bg: "bg-purple-500/10",
        text: "text-purple-600",
        border: "border-purple-500/10",
      },
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Filter instructors
  const filteredInstructors = instructors.filter(
    (ins) =>
      ins.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.department?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort instructors
  const sortedInstructors = [...filteredInstructors].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case "email":
        aVal = (a.email || "").toLowerCase();
        bVal = (b.email || "").toLowerCase();
        break;
      case "department":
        aVal = (a.department || "").toLowerCase();
        bVal = (b.department || "").toLowerCase();
        break;
      case "name":
      default:
        aVal = (a.name || "").toLowerCase();
        bVal = (b.name || "").toLowerCase();
    }
    
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Toggle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Open modal for adding new instructor
  const openAddModal = () => {
    setIsEditing(false);
    setForm(emptyInstructor);
    setIsModalOpen(true);
  };

  // Open modal for editing instructor
  const openEditModal = (ins) => {
    setIsEditing(true);
    setForm({
      name: ins.name || "",
      email: ins.email || "",
      department: ins.department || "",
      address: ins.address || "",
    });
    setSelected(ins);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
  };

  // Submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selected) {
        await api.updateInstructor(selected.id, form);
      } else {
        await api.createInstructor(form);
      }
      await loadInstructors();
      closeModal();
    } catch (err) {
      alert("Error saving instructor: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading instructors...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#cfd7e7] dark:border-gray-800 bg-white dark:bg-background-dark px-4 sm:px-6 py-3">
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
          <h2 className="text-[#0d121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">
            UniTime Manager
          </h2>
        </div>

        <div className="flex flex-1 justify-end gap-2 sm:gap-4 items-center">
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/20 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/20 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>

          <div
            className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAc_zqWPCY66JwFhgj4TUTraFNpWiBzqhlJGkp2dcxsHXoXQzn1wqgZIVUAjeKmHvwXU18pSGoNv9VbmPJ4_IyLfsaz3bw-EQcxLSY6O1FyWaiJhwZ3nkM8IxOZJJPpnuRuWHidB6UEIS2I0UbjWsj7GL1o07qsuxFJyDTTrDfDETbVt5apdACzL8BZStgospHZve4Z-PLekfpdrKmaSr7WcCj_kFwCf54uPGMf5xxWbwqpliSqXw3uJZy4mZOD0AARZE67z8JpyFk")',
            }}
          />
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span className="hidden sm:inline">Home</span>
            </button>
            {yearId && semesterId && (
              <>
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => navigate(`/semesters/${yearId}`)}
                  className="text-blue-600 hover:underline"
                >
                  {yearLabel || "Year"}
                </button>
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => navigate(`/timetable/${yearId}/${semesterId}`, { state: { yearLabel, semesterName } })}
                  className="text-blue-600 hover:underline"
                >
                  {semesterName || "Semester"}
                </button>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-400">Instructors</span>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Directory - Hidden on mobile unless toggled */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white dark:bg-gray-900 border-r border-[#e7ebf3] dark:border-gray-800 flex flex-col absolute lg:relative z-40 h-full`}>
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Management
              </h3>
              <nav className="space-y-1">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-400 font-medium"
                >
                  <span className="material-symbols-outlined text-xl">groups</span>
                  <span className="text-sm font-medium">All Instructors</span>
                </button>
                <button
                  onClick={() => {
                    if (yearId && semesterId) {
                      navigate(`/timetable/${yearId}/${semesterId}/available-instructors`, { 
                        state: { yearLabel, semesterName } 
                      });
                    } else {
                      navigate("/available-instructors");
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  <span className="material-symbols-outlined text-xl">event_available</span>
                  <span className="text-sm font-medium">Available Instructors</span>
                </button>
                <button
                  onClick={() => {
                    if (yearId && semesterId) {
                      navigate(`/modules/${yearId}/${semesterId}`, { state: { yearLabel, semesterName } });
                    } else {
                      navigate("/");
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  <span className="material-symbols-outlined text-xl">book</span>
                  <span className="text-sm font-medium">Modules</span>
                </button>
              </nav>
            </div>

            <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md"
                >
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Add Instructor</span>
                </button>
                {yearId && semesterId ? (
                  <button
                    onClick={() => navigate(`/timetable/${yearId}/${semesterId}`, { state: { yearLabel, semesterName } })}
                    className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    <span className="material-symbols-outlined">table</span>
                    <span>Back to Timetable</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    <span className="material-symbols-outlined">home</span>
                    <span>Select Year</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-background-light dark:bg-background-dark overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-medium text-[#4c669a] mb-1">
                <span>Faculty Management</span>
                <span className="material-symbols-outlined text-xs">
                  chevron_right
                </span>
                <span className="text-[#0d121b] dark:text-gray-400">
                  Instructor Directory
                </span>
              </div>
              <div className="flex justify-between items-end">
                <h1 className="text-3xl font-black tracking-tight">
                  Instructor Directory
                </h1>
                <div className="flex gap-3">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="department-asc">Department (A-Z)</option>
                    <option value="department-desc">Department (Z-A)</option>
                    <option value="email-asc">Email (A-Z)</option>
                    <option value="email-desc">Email (Z-A)</option>
                  </select>
                  <button 
                    onClick={openAddModal}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hidden sm:flex items-center gap-2 px-4 font-medium"
                  >
                    <span className="material-symbols-outlined">person_add</span>
                    <span className="hidden md:inline">Add Instructor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  placeholder="Search instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Instructor Cards Grid */}
            <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 gap-6">
                {sortedInstructors.map((ins) => {
                  const color = getColorClass(ins.name);
                  const modules = instructorModulesMap[ins.id];
                  const isLoading = loadingModulesMap[ins.id];
                  
                  // Debug output
                  console.log(`Card render for instructor ${ins.id} (${ins.name}):`, {
                    isLoading,
                    modules: modules?.length || 0,
                    modulesData: modules
                  });

                  return (
                    <div
                      key={ins.id}
                      onClick={() => startEdit(ins)}
                      className="instructor-card bg-white dark:bg-gray-900 rounded-2xl p-6
                   border border-[#e7ebf3] dark:border-gray-800
                   shadow-sm hover:shadow-xl hover:border-primary/20
                   transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div
                          className={`size-20 rounded-2xl flex items-center justify-center
                        text-3xl font-black shrink-0
                        ${color.bg} ${color.text} border ${color.border}`}
                        >
                          {getInitials(ins.name)}
                        </div>

                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-blue-500 dark:text-white">
                                  {ins.name}
                                </h3>

                                {ins.type && (
                                  <span
                                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30
                                     text-blue-600 text-[10px] font-bold
                                     rounded-full uppercase"
                                  >
                                    {ins.type}
                                  </span>
                                )}
                              </div>

                              <p className="text-red-400 font-bold text-sm mt-0.5">
                                {ins.department || "Not Assigned"}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2.5 text-gray-400 hover:text-primary
                             hover:bg-primary/5 rounded-xl transition-all"
                              >
                                <span className="material-symbols-outlined">
                                  calendar_today
                                </span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(ins);
                                }}
                                className="p-2.5 text-green-400 hover:text-primary
                             hover:bg-primary/5 rounded-xl transition-all"
                              >
                                <span className="material-symbols-outlined text-green-400">
                                  edit
                                </span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(ins);
                                }}
                                className="p-2.5 text-gray-400 hover:text-red-500
                             hover:bg-red-50 rounded-xl transition-all"
                              >
                                <span className="material-symbols-outlined text-red-500">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div
                            className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6
                         pt-6 border-t border-gray-100 dark:border-gray-800"
                          >
                            {/* Contact */}
                            <div>
                              <span
                                className="text-[10px] font-black text-gray-400
                                 uppercase tracking-widest block mb-1.5"
                              >
                                Contact Info
                              </span>
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="material-symbols-outlined text-blue-500 text-base">
                                  mail
                                </span>
                                <span className="truncate">
                                  {ins.email || "—"}
                                </span>
                              </div>
                            </div>

                            {/* Location */}
                            <div className="col-span-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                                Location
                              </span>
                              <div className="flex items-start gap-2 text-sm font-medium">
                                <span className="material-symbols-outlined text-blue-600 text-base mt-0.5 shrink-0">
                                  location_on
                                </span>
                                <span className="flex-1 whitespace-normal break-words leading-tight">
                                  {ins.address || "Not set"}
                                </span>
                              </div>
                            </div>

                            {/* Modules */}
                            <div className="col-span-2">
                              <span
                                className="text-[10px] font-black text-gray-400
                                 uppercase tracking-widest block mb-2"
                              >
                                Current Modules
                              </span>

                              <div className="flex flex-wrap gap-2">
                                {loadingModulesMap[ins.id] ? (
                                  <span className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-[11px] font-bold rounded-lg border border-gray-100 dark:border-gray-700">
                                    Loading modules...
                                  </span>
                                ) : instructorModulesMap[ins.id]?.length > 0 ? (
                                  instructorModulesMap[ins.id].map((mod) => (
                                    <span
                                      key={mod.id}
                                      className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-[11px] font-bold rounded-lg border border-gray-100 dark:border-gray-700"
                                    >
                                      {mod.code} - {mod.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-[11px] font-bold rounded-lg border border-gray-100 dark:border-gray-700">
                                    No modules assigned
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Selected Schedule Preview */}
        {selected && (
          <aside className="w-80 bg-white dark:bg-gray-900 border-l border-[#e7ebf3] dark:border-gray-800 flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Active Preview</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4 text-blue-600">
                    <div
                      className={`size-10 rounded-full ${getColorClass(selected.name).bg} ${getColorClass(selected.name).text} flex items-center justify-center font-bold`}
                    >
                      {getInitials(selected.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{selected.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-black">
                        Weekly Workload: {weeklyWorkload}h
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {loadingSchedule ? (
                      <div className="text-center text-gray-500 text-sm py-4">
                        Loading schedule...
                      </div>
                    ) : instructorSchedule.length > 0 ? (
                      instructorSchedule.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-primary">
                              {getDayAbbr(slot.dayOfWeek)} {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600">
                              {getSessionTypeLabel(slot.sessionType)}
                            </span>
                          </div>
                          <p className="text-xs font-bold">{slot.Course?.name || "Unknown Module"}</p>
                          <p className="text-[10px] text-blue-500 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-[12px]">
                              location_on
                            </span>
                            {slot.LectureHall?.name || "Room TBD"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 text-sm py-4">
                        {semesterId ? "No sessions scheduled for this semester" : "Select a semester to view schedule"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => openEditModal(selected)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Edit Instructor
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">print</span>
                    Print Schedule
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Add/Edit Instructor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-[#e7ebf3] dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined font-bold">
                    {isEditing ? "edit" : "person_add"}
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  {isEditing ? "Edit Instructor" : "Add New Instructor"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. Dr. John Smith"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. john.smith@university.edu"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address / Office</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="e.g. Room 302, Building A"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  {isEditing ? "Update Instructor" : "Create Instructor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsPage;
