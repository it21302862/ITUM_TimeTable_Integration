import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyInstructor = {
  name: "",
  email: "",
  department: "",
};

const InstructorsPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyInstructor);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const data = await api.getInstructors();
      setInstructors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Fake schedule data for preview (replace with real API later)
  const mockSchedule = [
    {
      day: "MON",
      time: "09:00 - 11:00",
      type: "Lecture",
      module: "Data Structures",
      location: "Hall B-12",
    },
    {
      day: "TUE",
      time: "14:00 - 16:00",
      type: "Practical",
      module: "AI Fundamentals Lab",
      location: "Lab 04",
    },
    {
      day: "THU",
      time: "10:00 - 12:00",
      type: "Tutorial",
      module: "Cryptography Review",
      location: "Room 202",
    },
  ];

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

  const filteredInstructors = instructors.filter(
    (ins) =>
      ins.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.department?.toLowerCase().includes(searchTerm.toLowerCase()),
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
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#cfd7e7] dark:border-gray-800 bg-white dark:bg-background-dark px-6 py-3 md:px-40">
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
            UniTime Manager
          </h2>
        </div>

        <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Directory */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-[#e7ebf3] dark:border-gray-800 flex flex-col">
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Availability Management
              </h3>
              <nav className="space-y-1">
                <a
                  class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium  bg-blue-600/10 text-blue-700 dark:text-blue-400"
                  href="#"
                >
                  <span class="material-symbols-outlined text-xl">groups</span>
                  <span class="text-sm font-medium">All Instructors</span>
                </a>
                <a
                  class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
                  href="#"
                >
                  <span class="material-symbols-outlined text-xl">
                    event_available
                  </span>
                  <span class="text-sm font-medium">Available Instructors</span>
                </a>
                <a
                  class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
                  href="#"
                >
                  <span class="material-symbols-outlined text-xl">
                    assignment_turned_in
                  </span>
                  <span class="text-sm font-medium">Teaching Assignment</span>
                </a>
              </nav>
            </div>

            <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Quick Access
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href="/timetable/1"
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  <span className="material-symbols-outlined">table</span>
                  <span>Timetable</span>
                </a>
                <a
                  href="/modules"
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  <span className="material-symbols-outlined">book</span>
                  <span>Modules</span>
                </a>
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
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium">
                    <span className="text-gray-400">Sort:</span>
                    <span>Name (A-Z)</span>
                    <span className="material-symbols-outlined text-sm">
                      expand_more
                    </span>
                  </div>
                  <button className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <span className="material-symbols-outlined">
                      filter_list
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instructor Cards Grid */}
            <div className="h-[calc(100vh-220px)] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6">
                {filteredInstructors.map((ins) => {
                  const color = getColorClass(ins.name);

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
                            <div>
                              <span
                                className="text-[10px] font-black text-gray-400
                                 uppercase tracking-widest block mb-1.5"
                              >
                                Location
                              </span>
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="material-symbols-outlined text-blue-600 text-base">
                                  location_on
                                </span>
                                <span>{ins.office || "Not set"}</span>
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
                                <span
                                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800
                                   text-[11px] font-bold rounded-lg
                                   border border-gray-100 dark:border-gray-700"
                                >
                                  (modules coming soon)
                                </span>
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
                        Weekly Workload: 18h
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {mockSchedule.map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-primary">
                            {slot.day} {slot.time}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600">
                            {slot.type}
                          </span>
                        </div>
                        <p className="text-xs font-bold">{slot.module}</p>
                        <p className="text-[10px] text-blue-500 flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[12px]">
                            location_on
                          </span>
                          {slot.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                    <span className="material-symbols-outlined">print</span>
                    Print Schedule
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default InstructorsPage;
