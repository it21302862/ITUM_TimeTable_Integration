import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../services/api";
import UserAvatar from "./UserAvatar";

const AvailableInstructorsPage = () => {
  const navigate = useNavigate();
  const { yearId, semesterId } = useParams();
  const location = useLocation();

  // Get state from navigation
  const yearLabel = location.state?.yearLabel || "";
  const semesterName = location.state?.semesterName || "";

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sessionData, setSessionData] = useState({
    day: "",
    startTime: "",
    endTime: "",
    lectureHall: "",
    sessionType: "",
    module: "",
  });

  const loadAvailableInstructors = async () => {
    try {
      setLoading(true);
      const data = await api.getAvailableInstructors({
        date: selectedDateTime,
      });
      setInstructors(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableInstructors();
  }, [selectedDateTime, semesterId]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-600",
      },
      {
        bg: "bg-amber-100 dark:bg-amber-900",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-300 dark:border-amber-600",
      },
      {
        bg: "bg-indigo-100 dark:bg-indigo-900",
        text: "text-indigo-700 dark:text-indigo-400",
        border: "border-indigo-300 dark:border-indigo-600",
      },
      {
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-700 dark:text-purple-400",
        border: "border-purple-300 dark:border-purple-600",
      },
      {
        bg: "bg-pink-100 dark:bg-pink-900",
        text: "text-pink-700 dark:text-pink-400",
        border: "border-pink-300 dark:border-pink-600",
      },
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Filter instructors
  const filteredInstructors = instructors.filter((ins) =>
    showOnlyAvailable ? ins.isCurrentlyFree : true,
  );

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

          <UserAvatar />
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
                  onClick={() =>
                    navigate(`/timetable/${yearId}/${semesterId}`, {
                      state: { yearLabel, semesterName },
                    })
                  }
                  className="text-blue-600 hover:underline"
                >
                  {semesterName || "Semester"}
                </button>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-400">
              Available Instructors
            </span>
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
        {/* Left Sidebar */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} lg:block w-64 bg-white dark:bg-gray-900 border-r border-[#e7ebf3] dark:border-gray-800 flex flex-col absolute lg:relative z-40 h-full`}
        >
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Management
              </h3>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    if (yearId && semesterId) {
                      navigate(`/instructors/${yearId}/${semesterId}`, {
                        state: { yearLabel, semesterName },
                      });
                    } else {
                      navigate("/");
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                >
                  <span className="material-symbols-outlined text-lg">
                    groups
                  </span>
                  <span className="text-sm font-medium">All Instructors</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-400 font-medium">
                  <span className="material-symbols-outlined text-lg">
                    event_available
                  </span>
                  <span className="text-sm font-medium">
                    Available Instructors
                  </span>
                </button>
              </nav>
            </div>

            {/* DateTime Filter */}
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                Check Availability
              </label>
              <input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Show Only Available Toggle */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Show Available Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f6f6f8] dark:bg-background-dark custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-1 mb-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#4c669a] uppercase tracking-wider">
                <span>Information Technology</span>
                <span className="material-symbols-outlined text-xs">
                  chevron_right
                </span>
                <span className="text-primary font-bold">
                  Availability Search
                </span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-[#0d121b] dark:text-white">
                    Available Instructors
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Find free faculty members for timetable assignment or
                    substitution.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl">
                      schedule
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-0.5">
                        Filter Date & Time
                      </span>
                      <input
                        type="datetime-local"
                        value={selectedDateTime}
                        onChange={(e) => setSelectedDateTime(e.target.value)}
                        className="text-xs font-bold border-none p-0 focus:ring-0 bg-transparent dark:text-white cursor-pointer"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                      showOnlyAvailable
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      bolt
                    </span>
                    <span>Available Now</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instructors Cards Grid */}
            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                      loading
                    </span>
                    <p className="text-gray-500">Loading instructors...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center text-red-500">
                    <p>{error}</p>
                  </div>
                </div>
              ) : filteredInstructors.length > 0 ? (
                filteredInstructors.map((instructor) => {
                  const color = getAvatarColor(instructor.name);
                  const isFree = instructor.isCurrentlyFree;

                  return (
                    <div
                      key={instructor.id}
                      className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#e7ebf3] dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div
                            className={`size-20 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center text-3xl font-black border ${color.border}`}
                          >
                            {getInitials(instructor.name)}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 size-6 border-4 border-white dark:border-gray-900 rounded-full ${
                              isFree ? "bg-emerald-500" : "bg-yellow-500"
                            }`}
                          ></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 w-full">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-black text-[#0d121b] dark:text-white">
                                  {instructor.name}
                                </h3>
                                <span
                                  className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${
                                    isFree
                                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                                  }`}
                                >
                                  {isFree ? "Verified Available" : "Busy Duty"}
                                </span>
                              </div>
                              <p className="text-gray-500 text-sm mt-0.5 font-medium">
                                {instructor.department || "Not Assigned"}
                              </p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                  Status
                                </span>
                                <span
                                  className={`text-sm font-bold ${
                                    isFree
                                      ? "text-emerald-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  {instructor.availabilityStatus}
                                </span>
                              </div>
                              {isFree && (
                                <button
                                  onClick={() => {
                                    setSelectedInstructor(instructor);
                                    setNote(
                                      `Please proceed to assigned location for support.`,
                                    );
                                    setShowModal(true);
                                  }}
                                  className="bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    add_task
                                  </span>
                                  Quick Assign
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Info Footer */}
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-8 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-gray-400 text-lg">
                                location_on
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {instructor.address || "Office Location TBD"}
                              </span>
                            </div>
                            {instructor.currentSession && (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400 text-lg">
                                  schedule
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Current:{" "}
                                  {instructor.currentSession.Course?.name} (
                                  {instructor.currentSession.Semester?.name ||
                                    "Unknown Semester"}
                                  )
                                </span>
                              </div>
                            )}
                            {instructor.nextSession && (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400 text-lg">
                                  history
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Next: {instructor.nextSession.startTime}
                                </span>
                              </div>
                            )}
                            <div className="ml-auto">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  defaultChecked
                                  type="checkbox"
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                <span className="ml-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                  Active Duty
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">
                      person_off
                    </span>
                    <p className="text-gray-500 dark:text-gray-400">
                      {showOnlyAvailable
                        ? "No available instructors at this time"
                        : "No instructors found"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Quick Summary */}
        <aside className="w-80 bg-white dark:bg-gray-900 border-l border-[#e7ebf3] dark:border-gray-800 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black tracking-tight">
                Quick Summary
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <span className="material-symbols-outlined text-5xl">
                    event_available
                  </span>
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">
                    CURRENTLY SEARCHING
                  </span>
                  <p className="text-sm font-bold">
                    {new Date(selectedDateTime).toLocaleString()}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black">
                        {instructors.filter((i) => i.isCurrentlyFree).length}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">
                        Instructors Free
                      </span>
                    </div>
                    <div className="size-8 w-[1px] bg-primary/20"></div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black">
                        {Math.ceil(instructors.length * 0.33)}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">
                        On Campus
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Dept. Quick Stats
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      CS Department
                    </span>
                    <span className="text-lg font-black">
                      85%{" "}
                      <span className="text-[10px] text-emerald-500 font-bold uppercase ml-1">
                        Allocated
                      </span>
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Substitutes Needed
                    </span>
                    <span className="text-lg font-black text-red-500">2</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">
                  Assignment Tip
                </h5>
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  Check instructor workload before assigning new sessions.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <span className="material-symbols-outlined text-lg">
                    check_circle
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Semester Check Successful
                  </span>
                </div>
                <h2 className="text-2xl font-black">
                  Assignment Note & Conflict Review
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Availability Review */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Cross-Semester Availability Review
                  </h3>
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold rounded">
                    {selectedInstructor.name}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-2">
                      Semester 1
                    </span>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <span className="material-symbols-outlined text-sm">
                        event_available
                      </span>
                      <span className="text-xs font-black">No Conflicts</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-2">
                      Semester 2
                    </span>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <span className="material-symbols-outlined text-sm">
                        event_available
                      </span>
                      <span className="text-xs font-black">No Conflicts</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-600 uppercase block mb-2">
                      Semester 4
                    </span>
                    <div className="flex items-center gap-2 text-amber-600">
                      <span className="material-symbols-outlined text-sm">
                        info
                      </span>
                      <span className="text-xs font-black">
                        Advisory Session
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Session Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Day */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Day
                    </label>
                    <select
                      value={sessionData.day}
                      onChange={(e) =>
                        handleSessionChange("day", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm"
                    >
                      <option value="">Select Day</option>
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                    </select>
                  </div>

                  {/* Module */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Module
                    </label>
                    <input
                      type="text"
                      value={sessionData.module}
                      onChange={(e) =>
                        handleSessionChange("module", e.target.value)
                      }
                      placeholder="e.g. Network Security"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm"
                    />
                  </div>
                  {/* Start Time */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={sessionData.startTime}
                      onChange={(e) =>
                        handleSessionChange("startTime", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={sessionData.endTime}
                      onChange={(e) =>
                        handleSessionChange("endTime", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm"
                    />
                  </div>
                  {/* Lecture Hall */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Lecture Hall
                    </label>
                    <input
                      type="text"
                      value={sessionData.lectureHall}
                      onChange={(e) =>
                        handleSessionChange("lectureHall", e.target.value)
                      }
                      placeholder="e.g. LH-02"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm"
                    />
                  </div>

                  {/* Session Type */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Session Type
                    </label>
                    <select
                      value={sessionData.sessionType}
                      onChange={(e) =>
                        handleSessionChange("sessionType", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm"
                    >
                      <option value="">Select Type</option>
                      <option>LECTURE</option>
                      <option>PRACTICAL</option>
                      <option>TUTORIAL</option>
                      <option>EXAM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignment Note */}
              <div>
                <label className="block mb-2">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Send Assignment Note
                  </span>
                </label>

                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-400 uppercase">
                    Characters: {note.length}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-sm">
                    info
                  </span>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Note will be sent via system notification and university
                    email.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800 flex items-center justify-end gap-3 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Send note to:", selectedInstructor.name);
                  console.log("Message:", note);
                  setShowModal(false);
                }}
                className="px-8 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                Confirm and Send Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableInstructorsPage;
