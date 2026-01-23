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
  };

  const handleDelete = async (ins) => {
    await api.deleteInstructor(ins.id);
    if (selected?.id === ins.id) {
      setSelected(null);
      setForm(emptyInstructor);
    }
    await loadInstructors();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <span className="text-gray-500">Loading instructors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <span className="text-red-500">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-[#0d121b] dark:text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">
        {/* Directory list */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Instructor Directory
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage teaching staff and their assigned modules
              </p>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="flex items-center gap-2 px-5 py-3 bg-primary-blue text-white rounded-xl shadow-lg shadow-primary-blue/20 hover:bg-blue-700 transition-all font-bold"
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span>Add New Instructor</span>
            </button>
          </div>

          <div className="space-y-4">
            {instructors.map((ins) => (
              <div
                key={ins.id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 p-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center text-xs font-bold">
                    {ins.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{ins.name}</p>
                    <p className="text-xs text-gray-500">{ins.department}</p>
                    <p className="text-xs text-gray-500">{ins.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(ins)}
                    className="p-2 text-gray-400 hover:text-primary-blue hover:bg-primary-blue/5 rounded-lg transition-all"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-xl">
                      edit
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ins)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-xl">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <aside className="w-80 bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">
            {selected ? "Edit Instructor" : "Add Instructor"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Department
              </label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-blue text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors mt-2"
            >
              <span className="material-symbols-outlined">save</span>
              {selected ? "Update Instructor" : "Create Instructor"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default InstructorsPage;

