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
      { bg: "bg-primary/10", text: "text-primary", border: "border-primary/10" },
      { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/10" },
      { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/10" },
      { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/10" },
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredInstructors = instructors.filter((ins) =>
    ins.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ins.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ins.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading instructors...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-gray-900 px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <h2 className="text-lg font-bold tracking-[-0.015em]">UniSched Admin</h2>
          </div>
          <nav className="flex items-center gap-9">
            <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Dashboard</a>
            <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Timetable</a>
            <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Academic Plans</a>
            <a href="#" className="text-primary text-sm font-bold">Faculty</a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="min-w-40 max-w-64">
            <div className="flex items-center rounded-lg overflow-hidden bg-[#e7ebf3] dark:bg-gray-800">
              <span className="material-symbols-outlined text-xl text-[#4c669a] pl-4">search</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-[#4c669a] pl-2 py-2"
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div
            className="size-10 rounded-full border-2 border-primary/20 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYI87WJ64jD6veBQ7dAEMguh2W4f4KOafB_ab2AjEpyFxzis6RTnGcYHI5CkIW1gOK43rPNBe5YR8oD5Paw46CZKVamUDWL1gElFZR1M7Bfc0ZxxCKZ7km2b4is7NaLbo5gki0xCANHVv8QOgcfckV18Y6xvgcPx1VaKOK5rkNFunTF-q1pfObAX4URPc7_cHZ32uKRJiBNADuQ6RsuqtSPXMeXAmcNqR7m7D6teozfuGjteLebCgqdMen8nkg0ugkNQ_1574fSDQ")',
            }}
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Directory */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-[#e7ebf3] dark:border-gray-800 flex flex-col">
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Directory</h3>
              <nav className="space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
                  <span className="material-symbols-outlined text-xl">groups</span>
                  <span>All Instructors</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="material-symbols-outlined text-xl">account_tree</span>
                  <span>By Department</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="material-symbols-outlined text-xl">star</span>
                  <span>Favorites</span>
                </a>
              </nav>
            </div>

            <div className="mt-auto space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="flex items-center justify-center gap-3 px-4 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform font-bold">
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Add New Instructor</span>
                </button>
                <button className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium">
                  <span className="material-symbols-outlined">mail</span>
                  <span>Bulk Email</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-medium text-[#4c669a] mb-1">
                <span>Faculty Management</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-[#0d121b] dark:text-gray-400">Instructor Directory</span>
              </div>
              <div className="flex justify-between items-end">
                <h1 className="text-3xl font-black tracking-tight">Instructor Directory</h1>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium">
                    <span className="text-gray-400">Sort:</span>
                    <span>Name (A-Z)</span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                  <button className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instructor Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInstructors.map((ins) => {
                const color = getColorClass(ins.name);
                return (
                  <div
                    key={ins.id}
                    className="instructor-card bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#e7ebf3] dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => startEdit(ins)}
                  >
                    <div className="flex items-start gap-6">
                      <div className={`size-16 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center text-2xl font-bold border ${color.border}`}>
                        {getInitials(ins.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold">{ins.name}</h3>
                            <p className={`${color.text} font-medium text-sm`}>{ins.department || "Not Assigned"}</p>
                          </div>
                          <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                              <span className="material-symbols-outlined">calendar_today</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(ins);
                              }}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(ins);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Contact Info</span>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="material-symbols-outlined text-gray-400 text-sm">mail</span>
                              <span>{ins.email || "—"}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Office</span>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="material-symbols-outlined text-gray-400 text-sm">location_on</span>
                              <span>Not set</span>
                            </div>
                          </div>
                          {/* You can add current modules here later when API supports it */}
                          <div className="col-span-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Current Modules</span>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold rounded-md border border-gray-200 dark:border-gray-700">
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
        </main>

        {/* Right Sidebar - Selected Schedule Preview */}
        {selected && (
          <aside className="w-80 bg-white dark:bg-gray-900 border-l border-[#e7ebf3] dark:border-gray-800 flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Selected Schedule</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`size-10 rounded-full ${getColorClass(selected.name).bg} ${getColorClass(selected.name).text} flex items-center justify-center font-bold`}>
                      {getInitials(selected.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{selected.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-black">Weekly Workload: 18h</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {mockSchedule.map((slot, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-primary">{slot.day} {slot.time}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600">
                            {slot.type}
                          </span>
                        </div>
                        <p className="text-xs font-bold">{slot.module}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {slot.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800">
                  <button className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                    <span className="material-symbols-outlined">edit_square</span>
                    Modify Faculty
                  </button>
                  <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-symbols-outlined">print</span>
                    Print Schedule
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Emergency Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="group size-14 bg-red-600 text-white rounded-full shadow-xl shadow-red-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative">
          <span className="material-symbols-outlined text-2xl">chat_error</span>
          <span className="absolute -top-1 -left-1 size-5 bg-white text-red-600 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-red-600">3</span>
          <span className="absolute right-full mr-4 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Emergency Chat
          </span>
        </button>
      </div>
    </div>
  );
};

export default InstructorsPage;