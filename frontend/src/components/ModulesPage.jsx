import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyCourse = {
  code: "",
  name: "",
  credit: "",
  InstructorId: "",
};

const ModulesPage = () => {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyCourse);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startCreate = () => {
    setSelected(null);
    setForm(emptyCourse);
  };

  const startEdit = (course) => {
    setSelected(course);
    setForm({
      code: course.code || "",
      name: course.name || "",
      credit: course.credit || "",
      InstructorId: course.InstructorId || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      name: form.name,
      credit: Number(form.credit) || 0,
      InstructorId: form.InstructorId ? Number(form.InstructorId) : null,
    };

    if (selected) {
      await api.updateCourse(selected.id, payload);
    } else {
      await api.createCourse(payload);
    }
    await loadCourses();
  };

  const handleDelete = async (course) => {
    await api.deleteCourse(course.id);
    if (selected?.id === course.id) {
      setSelected(null);
      setForm(emptyCourse);
    }
    await loadCourses();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="text-gray-500">Loading modules...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="text-red-500">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white min-h-screen">
      
      {/* React Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-30">
        <div className="text-xl font-bold">UniSched Admin</div>
        <nav className="flex gap-6">
          <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Dashboard</button>
          <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Timetable</button>
          <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Academic Plans</button>
          <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Faculty</button>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">
        {/* Left: Course list */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Module Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage and assign university academic modules
              </p>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all font-bold"
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span>Add New Module</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-[#e7ebf3] dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Module Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Module Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Instructor</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-primary font-bold">{course.code}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{course.name}</td>
                    <td className="px-6 py-4 text-sm">{course.credit}</td>
                    <td className="px-12 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(course)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button onClick={() => handleDelete(course)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Form / Overview */}
        <aside className="w-80 bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">{selected ? "Edit Module" : "Add Module"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Code</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Credit</label>
              <input
                name="credit"
                type="number"
                step="0.5"
                value={form.credit}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors mt-2"
            >
              <span className="material-symbols-outlined">save</span>
              {selected ? "Update Module" : "Create Module"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default ModulesPage;
