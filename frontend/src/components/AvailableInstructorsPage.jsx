import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../services/api";

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
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const loadAvailableInstructors = async () => {
    try {
      setLoading(true);
      const data = await api.getAvailableInstructors({
        date: selectedDateTime,
        semesterId: semesterId || undefined
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
      { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-400", border: "border-blue-300 dark:border-blue-600" },
      { bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-700 dark:text-amber-400", border: "border-amber-300 dark:border-amber-600" },
      { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-300 dark:border-indigo-600" },
      { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-400", border: "border-purple-300 dark:border-purple-600" },
      { bg: "bg-pink-100 dark:bg-pink-900", text: "text-pink-700 dark:text-pink-400", border: "border-pink-300 dark:border-pink-600" },
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Filter instructors
  const filteredInstructors = instructors.filter(ins => 
    showOnlyAvailable ? ins.isCurrentlyFree : true
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
            <span className="text-gray-600 dark:text-gray-400">Available Instructors</span>
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
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white dark:bg-gray-900 border-r border-[#e7ebf3] dark:border-gray-800 flex flex-col absolute lg:relative z-40 h-full`}>
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Management
              </h3>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    if (yearId && semesterId) {
                      navigate(`/timetable/${yearId}/${semesterId}/instructors`, { 
                        state: { yearLabel, semesterName } 
                      });
                    } else {
                      navigate("/instructors");
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                >
                  <span className="material-symbols-outlined text-lg">groups</span>
                  <span className="text-sm font-medium">All Instructors</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-400 font-medium"
                >
                  <span className="material-symbols-outlined text-lg">event_available</span>
                  <span className="text-sm font-medium">Available Instructors</span>
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
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-primary font-bold">Availability Search</span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-[#0d121b] dark:text-white">
                    Available Instructors
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Find free faculty members for timetable assignment or substitution.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl">schedule</span>
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
                    <span className="material-symbols-outlined text-xl">bolt</span>
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
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">loading</span>
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
                          <div className={`size-20 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center text-3xl font-black border ${color.border}`}>
                            {getInitials(instructor.name)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 size-6 border-4 border-white dark:border-gray-900 rounded-full ${
                            isFree ? "bg-emerald-500" : "bg-yellow-500"
                          }`}></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 w-full">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-black text-[#0d121b] dark:text-white">
                                  {instructor.name}
                                </h3>
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${
                                  isFree
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                                }`}>
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
                                <span className={`text-sm font-bold ${
                                  isFree ? "text-emerald-600" : "text-yellow-600"
                                }`}>
                                  {instructor.availabilityStatus}
                                </span>
                              </div>
                              {isFree && (
                                <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                                  <span className="material-symbols-outlined text-lg">add_task</span>
                                  Quick Assign
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Info Footer */}
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-8 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {instructor.address || "Office Location TBD"}
                              </span>
                            </div>
                            {instructor.currentSession && (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400 text-lg">schedule</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Current: {instructor.currentSession.Course?.name}
                                </span>
                              </div>
                            )}
                            {instructor.nextSession && (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400 text-lg">history</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Next: {instructor.nextSession.startTime}
                                </span>
                              </div>
                            )}
                            <div className="ml-auto">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked type="checkbox" className="sr-only peer" />
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
              <h2 className="text-lg font-black tracking-tight">Quick Summary</h2>
            </div>
            <div className="flex flex-col gap-6">
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <span className="material-symbols-outlined text-5xl">event_available</span>
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">
                    CURRENTLY SEARCHING
                  </span>
                  <p className="text-sm font-bold">{new Date(selectedDateTime).toLocaleString()}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black">{instructors.filter(i => i.isCurrentlyFree).length}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">
                        Instructors Free
                      </span>
                    </div>
                    <div className="size-8 w-[1px] bg-primary/20"></div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black">{Math.ceil(instructors.length * 0.33)}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">On Campus</span>
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
                      85% <span className="text-[10px] text-emerald-500 font-bold uppercase ml-1">Allocated</span>
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
    </div>
  );
};

export default AvailableInstructorsPage;
