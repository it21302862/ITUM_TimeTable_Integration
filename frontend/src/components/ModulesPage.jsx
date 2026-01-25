import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyCourse = {
  code: "",
  name: "",
  credit: "",
  assignedInstructorId: "",
  moduleLeaderId: "",
  moduleCoordinatorId: "",
  room: "",
};

const ModulesPage = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [lectureHalls, setLectureHalls] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyCourse);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, instructorsData, lectureHallsData] =
        await Promise.all([
          api.getCourses(),
          api.getInstructors(),
          api.getLectureHalls(),
        ]);
      setCourses(coursesData);
      setInstructors(instructorsData);
      setLectureHalls(lectureHallsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setSelected(null);
    setForm(emptyCourse);
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setSelected(course);
    setForm({
      code: course.code || "",
      name: course.name || "",
      credit: course.credit || "",
      assignedInstructorId: course.assignedInstructorId || "",
      moduleLeaderId: course.moduleLeaderId || "",
      moduleCoordinatorId: course.moduleCoordinatorId || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      name: form.name,
      credit: Number(form.credit) || 0,
      assignedInstructorId: form.assignedInstructorId
        ? Number(form.assignedInstructorId)
        : null,
      moduleLeaderId: form.moduleLeaderId ? Number(form.moduleLeaderId) : null,
      moduleCoordinatorId: form.moduleCoordinatorId
        ? Number(form.moduleCoordinatorId)
        : null,
    };

    try {
      if (selected) {
        await api.updateCourse(selected.id, payload);
      } else {
        await api.createCourse(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Error saving module: " + err.message);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm("Delete this module?")) return;
    await api.deleteCourse(course.id);
    await loadData();
    if (selected?.id === course.id) setSelected(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setForm(emptyCourse);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white min-h-screen flex flex-col font-['Lexend',sans-serif]">
      {/* Top Navigation */}
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
        {/* Left Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-[#e7ebf3] dark:border-gray-800 flex flex-col">
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Management
              </h3>
              <nav className="space-y-1">
                <a
                  class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium  bg-blue-600/10 text-blue-700 dark:text-blue-400"
                  href="#"
                >
                  <span class="material-symbols-outlined text-xl">book</span>
                  <span class="text-sm font-medium">Modules</span>
                </a>
                <a
                  class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
                  href="#"
                >
                  <span class="material-symbols-outlined text-xl">
                    assignment
                  </span>
                  <span class="text-sm font-medium">Module Outline</span>
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
                  href="/instructors"
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  <span className="material-symbols-outlined">groups</span>
                  <span>Instructors</span>
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  Module Management
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage and assign university academic modules
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-3 bg-primary bg-blue-600 text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all font-bold"
              >
                <span className="material-symbols-outlined ">add_circle</span>
                <span>Add New Module</span>
              </button>
            </div>

            {/* Search & Actions Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-[#e7ebf3] dark:border-gray-800 mb-6 flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    search
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                    placeholder="Search by name, code or instructor..."
                    type="text"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    filter_list
                  </span>
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    download
                  </span>
                  Export
                </button>
              </div>
            </div>

            {/* Modules Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-[#e7ebf3] dark:border-gray-800">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Module Code
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Module Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Module Leader
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Assigned Instructor
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Module Cordinator
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => openEditModal(course)}
                    >
                      <td className="px-6 py-4 font-mono text-sm text-primary text-blue-600 font-bold">
                        {course.code}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {course.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {Number(course.credit).toFixed(1)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {course.moduleLeader?.name
                              ?.slice(0, 2)
                              .toUpperCase() || "NA"}
                          </div>
                          <span className="text-sm font-medium">
                            {course.moduleLeader?.name || "Not assigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {course.assignedInstructor?.name
                              ?.slice(0, 2)
                              .toUpperCase() || "NA"}
                          </div>
                          <span className="text-sm font-medium">
                            {course.assignedInstructor?.name || "Not assigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {course.moduleCoordinator?.name
                              ?.slice(0, 2)
                              .toUpperCase() || "NA"}
                          </div>
                          <span className="text-sm font-medium">
                            {course.moduleCoordinator?.name || "Not assigned"}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(course)}
                            className="p-2 text-green-300 hover:text-primary hover:text-green-500 hover:bg-primary/5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-xl">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(course)}
                            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-xl">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-[#e7ebf3] dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Showing 1 to {courses.length} of {courses.length} modules
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined">
                      chevron_left
                    </span>
                  </button>
                  <button className="size-8 rounded bg-primary text-white font-bold">
                    1
                  </button>
                  <button className="size-8 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                    2
                  </button>
                  <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Overview (kept for view only) */}
        {selected && !isModalOpen && (
          <aside className="w-80 bg-white dark:bg-gray-900 border-l border-[#e7ebf3] dark:border-gray-800 flex flex-col">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Module Overview</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-green-200 rounded-xl border border-primary/10">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    Selected Module
                  </span>
                  <h3 className="text-xl font-bold mt-1">{selected.name}</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        person
                      </span>
                      <div>
                        <span className="text-gray-400 text-[11px]">
                          Assigned Module Leader
                        </span>
                        <p className="font-semibold">
                          {selected.moduleLeader?.name || "—"}
                        </p>
                      </div>
                    </div>
                     <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        person
                      </span>
                      <div>
                        <span className="text-gray-400 text-[11px]">
                          Assigned Instructor
                        </span>
                        <p className="font-semibold">
                          {selected.assignedInstructor?.name || "—"}
                        </p>
                      </div>
                    </div>
                     <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        person
                      </span>
                      <div>
                        <span className="text-gray-400 text-[11px]">
                          Module Coordinator
                        </span>
                        <p className="font-semibold">
                          {selected.moduleCoordinator?.name || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        credit_card
                      </span>
                      <div>
                        <span className="text-gray-400 text-[11px]">
                          Credits
                        </span>
                        <p className="font-semibold">
                          {Number(selected.credit).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => openEditModal(selected)}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Edit Module
                  </button>
                  <button
                    onClick={() => handleDelete(selected)}
                    className="w-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                    Delete Module
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold">
                {selected ? "Edit Module" : "Add New Module"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Module Code
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-blue-500 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                    placeholder="e.g. CS201"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Credits
                  </label>
                  <input
                    name="credit"
                    type="number"
                    step="0.5"
                    value={form.credit}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                    placeholder="e.g. 4.0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Module Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="e.g. Advanced Algorithms"
                  required
                />
              </div>

              {/* Assigned Instructor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Assigned Instructor
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    search
                  </span>
                  <select
                    name="assignedInstructorId"
                    value={form.assignedInstructorId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
                  >
                    <option value="">Select instructor...</option>
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Module Leader */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Module Leader
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    search
                  </span>
                  <select
                    name="moduleLeaderId"
                    value={form.moduleLeaderId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
                  >
                    <option value="">Select Module Leader...</option>
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Module Coordinator */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Module Coordinator
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    search
                  </span>
                  <select
                    name="moduleCoordinatorId"
                    value={form.moduleCoordinatorId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
                  >
                    <option value="">Select Module Coordinator...</option>
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
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
                  className="px-6 py-2.5 text-sm font-bold bg-primary bg-blue-600 text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all"
                >
                  {selected ? "Update Module" : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesPage;
