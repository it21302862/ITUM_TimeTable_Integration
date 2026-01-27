import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const ModuleOutlinePage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const courseData = location.state?.course || {};

  const [outline, setOutline] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeSection, setActiveSection] = useState("description");

  const descriptionRef = useRef(null);
  const outcomesRef = useRef(null);
  const topicsRef = useRef(null);
  const assessmentsRef = useRef(null);
  const bibliographyRef = useRef(null);

  const [formData, setFormData] = useState({
    description: "",
    outcomes: [],
    weeklyTopics: [],
    assessments: [],
    bibliography: "",
    contentQuality: "Medium",
  });

  const [newOutcome, setNewOutcome] = useState("");
  const [newWeekTopic, setNewWeekTopic] = useState("");
  const [newWeekReadings, setNewWeekReadings] = useState("");
  const [newAssessment, setNewAssessment] = useState({
    type: "",
    weight: "",
    description: "",
  });
  const [editingAssessmentIndex, setEditingAssessmentIndex] = useState(null);

  useEffect(() => {
    loadOutline();
  }, [courseId]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "description", ref: descriptionRef },
        { id: "outcomes", ref: outcomesRef },
        { id: "topics", ref: topicsRef },
        { id: "assessments", ref: assessmentsRef },
        { id: "bibliography", ref: bibliographyRef },
      ];

      const scrollPosition = window.scrollY + 200;

      for (let section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;

          if (scrollPosition >= sectionTop) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadOutline = async () => {
    try {
      setLoading(true);
      const data = await api.getModuleOutlineByCourse(courseId);
      setOutline(data);
      setFormData({
        description: data.description || "",
        outcomes: data.outcomes || [],
        weeklyTopics: data.weeklyTopics || [],
        assessments: data.assessments || [],
        bibliography: data.bibliography || "",
        contentQuality: data.contentQuality || "Medium",
      });
    } catch (err) {
      if (err.message.includes("not found")) {
        setOutline(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setFormData((prev) => ({
        ...prev,
        outcomes: [...prev.outcomes, newOutcome],
      }));
      setNewOutcome("");
    }
  };

  const removeOutcome = (index) => {
    setFormData((prev) => ({
      ...prev,
      outcomes: prev.outcomes.filter((_, i) => i !== index),
    }));
  };

  const addWeekTopic = () => {
    if (newWeekTopic.trim()) {
      setFormData((prev) => ({
        ...prev,
        weeklyTopics: [
          ...prev.weeklyTopics,
          { title: newWeekTopic, readings: newWeekReadings },
        ],
      }));
      setNewWeekTopic("");
      setNewWeekReadings("");
    }
  };

  const removeWeekTopic = (index) => {
    setFormData((prev) => ({
      ...prev,
      weeklyTopics: prev.weeklyTopics.filter((_, i) => i !== index),
    }));
  };

  const addAssessment = () => {
    if (newAssessment.type.trim() && String(newAssessment.weight).trim()) {
      if (editingAssessmentIndex !== null) {
        const updated = [...formData.assessments];
        updated[editingAssessmentIndex] = newAssessment;
        setFormData((prev) => ({
          ...prev,
          assessments: updated,
        }));
        setEditingAssessmentIndex(null);
      } else {
        setFormData((prev) => ({
          ...prev,
          assessments: [...prev.assessments, newAssessment],
        }));
      }
      setNewAssessment({ type: "", weight: "", description: "" });
    }
  };

  const removeAssessment = (index) => {
    setFormData((prev) => ({
      ...prev,
      assessments: prev.assessments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (outline) {
        await api.updateModuleOutline(outline.id, formData);
      } else {
        await api.createModuleOutline({
          courseId: Number(courseId),
          ...formData,
        });
      }
      setLastSaved(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      await loadOutline();
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (
      !outline ||
      !window.confirm("Are you sure you want to delete this module outline?")
    )
      return;
    try {
      await api.deleteModuleOutline(outline.id);
      navigate(-1);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const sections = [
    { id: "description", label: "Description", icon: "description" },
    { id: "outcomes", label: "Learning Outcomes", icon: "school" },
    { id: "topics", label: "Weekly Topics", icon: "calendar_view_week" },
    { id: "assessments", label: "Assessments", icon: "assessment" },
    { id: "bibliography", label: "Bibliography", icon: "menu_book" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Left Sidebar Navigation */}
      <div className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 fixed h-screen left-0 top-0 z-40">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                UniTimetable
              </h2>
              <p className="text-xs text-slate-500">Timetable Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate("/modules")}
              className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-3"
            >
              <span className="material-symbols-outlined">school</span>
              Modules
            </button>
            <button className="w-full text-left px-4 py-3 text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 rounded-lg transition-colors flex items-center gap-3">
              <span className="material-symbols-outlined">description</span>
              Module Outline
            </button>
            <button
              onClick={() => navigate("/instructors")}
              className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-3"
            >
              <span className="material-symbols-outlined">group</span>
              Instructors
            </button>
          </div>
        </nav>

        {/* Bottom Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Admin User
              </p>
              <p className="text-xs text-slate-500 truncate">
                admin@university.edu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-6">
        {/* Breadcrumbs and Header */}
        <div className="max-w-5xl mx-auto px-8 pt-8">
          <div className="flex items-center justify-between mb-6">
            <nav className="flex flex-wrap gap-2 items-center text-sm font-medium">
              <button
                onClick={() => navigate(-1)}
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Management
              </button>
              <span className="text-slate-400">›</span>
              <span className="text-slate-900 dark:text-white">
                Module Outline
              </span>
            </nav>
            {lastSaved && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded">
                <span className="material-symbols-outlined text-sm">
                  check_circle
                </span>
                <span>All changes autosaved at {lastSaved}</span>
              </div>
            )}
          </div>

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="flex-1 space-y-4">
              <div className="max-w-md">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Editing For Module
                </label>
                <select
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
  rounded-lg text-sm font-semibold text-slate-900 dark:text-white 
  px-4 py-3 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>
                    {courseData.code}: {courseData.name}
                  </option>
                </select>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                {courseData.code}: {courseData.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl">
                Create and refine the formal syllabus. Ensure all required
                standards are met.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Edit Outline
                  </button>
                  {outline && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Delete
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                  >
                    <span className="material-symbols-outlined">save</span>
                    Save Outline
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadOutline();
                    }}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <span className="material-symbols-outlined">close</span>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-8 pb-12">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Course Description */}
              <section
                ref={descriptionRef}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-lg">
                    description
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Course Description
                  </h3>
                </div>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full min-h-[160px] p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter course description here..."
                  />
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {formData.description || "No description added yet"}
                  </p>
                )}
              </section>

              {/* Learning Outcomes */}
              <section
                ref={outcomesRef}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      school
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Learning Outcomes
                    </h3>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => {
                        if (newOutcome.trim()) addOutcome();
                      }}
                      className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add
                      </span>
                      Add Outcome
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div className="mb-6 flex gap-2">
                    <input
                      type="text"
                      value={newOutcome}
                      onChange={(e) => setNewOutcome(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addOutcome()}
                      placeholder="Enter new outcome..."
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addOutcome}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add
                    </button>
                  </div>
                )}

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  {formData.outcomes.map((outcome, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-3 border border-slate-100 dark:border-slate-700 rounded-lg group hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold text-xs size-6 flex items-center justify-center rounded shrink-0">
                        {index + 1}
                      </span>

                      {isEditing ? (
                        <input
                          type="text"
                          value={outcome}
                          onChange={(e) => {
                            const updated = [...formData.outcomes];
                            updated[index] = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              outcomes: updated,
                            }));
                          }}
                          className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700 dark:text-slate-300"
                        />
                      ) : (
                        <p className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                          {outcome}
                        </p>
                      )}

                      {isEditing && (
                        <button
                          onClick={() => removeOutcome(index)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Weekly Topics */}
              <section
                ref={topicsRef}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">
                        calendar_view_week
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Weekly Topics
                      </h3>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => {
                          if (newWeekTopic.trim()) addWeekTopic();
                        }}
                        className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          add
                        </span>
                        Add Week
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newWeekTopic}
                        onChange={(e) => setNewWeekTopic(e.target.value)}
                        placeholder="Enter topic title..."
                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-blue-500"
                      />
                    </div>
                    <textarea
                      value={newWeekReadings}
                      onChange={(e) => setNewWeekReadings(e.target.value)}
                      placeholder="Enter readings / tasks..."
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-blue-500 min-h-[80px]"
                    />
                    <button
                      onClick={addWeekTopic}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 font-medium"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Week
                    </button>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/50 z-10">
                      <tr>
                        <th className="py-3 px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b">
                          Week
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b">
                          Topic Title
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b">
                          Readings / Tasks
                        </th>
                        <th className="py-3 px-8 border-b"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {formData.weeklyTopics.map((topic, index) => {
                        // Handle both old (topic/details) and new (title/readings) formats
                        const displayTitle = topic.title || topic.topic || "";
                        const displayReadings = topic.readings || topic.details || "";
                        
                        return (
                        <tr key={index}>
                          <td className="py-4 px-8 text-sm font-bold text-slate-900 dark:text-white">
                            Week {String(index + 1).padStart(2, "0")}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={displayTitle}
                                onChange={(e) => {
                                  const updated = [...formData.weeklyTopics];
                                  updated[index].title = e.target.value;
                                  updated[index].topic = e.target.value;
                                  setFormData((prev) => ({
                                    ...prev,
                                    weeklyTopics: updated,
                                  }));
                                }}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300"
                              />
                            ) : (
                              displayTitle
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-500">
                            {isEditing ? (
                              <textarea
                                value={displayReadings}
                                onChange={(e) => {
                                  const updated = [...formData.weeklyTopics];
                                  updated[index].readings = e.target.value;
                                  updated[index].details = e.target.value;
                                  setFormData((prev) => ({
                                    ...prev,
                                    weeklyTopics: updated,
                                  }));
                                }}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-600 dark:text-slate-400 min-h-[50px]"
                              />
                            ) : (
                              <div className="whitespace-pre-wrap">{displayReadings}</div>
                            )}
                          </td>
                          <td className="py-4 px-8 text-right">
                            {isEditing && (
                              <button
                                onClick={() => removeWeekTopic(index)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <span className="material-symbols-outlined">
                                  delete
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Assessment Criteria */}
              <section
                ref={assessmentsRef}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">
                        assessment
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Assessment Criteria
                      </h3>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => setEditingAssessmentIndex(-1)}
                        className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          add
                        </span>
                        Add Assessment
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && editingAssessmentIndex !== null && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                          Type
                        </label>
                        <input
                          type="text"
                          value={newAssessment.type}
                          onChange={(e) =>
                            setNewAssessment({
                              ...newAssessment,
                              type: e.target.value,
                            })
                          }
                          placeholder="e.g., Quiz, Assignment"
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                          Weight (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newAssessment.weight}
                          onChange={(e) =>
                            setNewAssessment({
                              ...newAssessment,
                              weight: e.target.value,
                            })
                          }
                          placeholder="0-100"
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newAssessment.description}
                        onChange={(e) =>
                          setNewAssessment({
                            ...newAssessment,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe the assessment criteria..."
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-blue-500 min-h-[80px]"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={addAssessment}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 font-medium"
                      >
                        <span className="material-symbols-outlined">save</span>
                        {editingAssessmentIndex === -1 ? "Add" : "Save"} Assessment
                      </button>
                      <button
                        onClick={() => {
                          setEditingAssessmentIndex(null);
                          setNewAssessment({
                            type: "",
                            weight: "",
                            description: "",
                          });
                        }}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="py-3 px-6 text-xs font-black uppercase text-slate-500">
                          Type
                        </th>
                        <th className="py-3 px-6 text-xs font-black uppercase text-slate-500">
                          Weight (%)
                        </th>
                        <th className="py-3 px-6 text-xs font-black uppercase text-slate-500">
                          Description
                        </th>
                        {isEditing && (
                          <th className="py-3 px-6 text-xs font-black uppercase text-right text-slate-500">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {formData.assessments.map((assessment, index) => (
                        <tr key={index}>
                          <td className="py-4 px-6 text-sm font-bold text-slate-800 dark:text-white">
                            {assessment.type}
                          </td>

                          <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">
                            {assessment.weight}%
                          </td>

                          <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                            {assessment.description}
                          </td>

                          {isEditing && (
                            <td className="py-4 px-6 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setNewAssessment(assessment);
                                  setEditingAssessmentIndex(index);
                                }}
                                className="text-slate-400 hover:text-blue-500 inline"
                              >
                                <span className="material-symbols-outlined">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={() => removeAssessment(index)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <span className="material-symbols-outlined">
                                  delete
                                </span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}

                      {formData.assessments.length === 0 && (
                        <tr>
                          <td
                            colSpan={isEditing ? 4 : 3}
                            className="py-6 text-center text-sm text-slate-400"
                          >
                            No assessments added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Bibliography */}
              <section
                ref={bibliographyRef}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-lg">
                    menu_book
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Bibliography & References
                  </h3>
                </div>
                {isEditing ? (
                  <textarea
                    name="bibliography"
                    value={formData.bibliography}
                    onChange={handleInputChange}
                    className="w-full min-h-[160px] p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter bibliography and reference materials..."
                  />
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {formData.bibliography || "No bibliography added yet"}
                  </p>
                )}
              </section>
            </div>

            {/* Sidebar - Validation Status & Section Navigation */}
            <aside className="w-64 space-y-6 hidden xl:block sticky top-8 h-fit">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
                  Outline Sections
                </h4>
                <nav className="flex flex-col gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        const refs = {
                          description: descriptionRef,
                          outcomes: outcomesRef,
                          topics: topicsRef,
                          assessments: assessmentsRef,
                          bibliography: bibliographyRef,
                        };
                        refs[section.id].current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all ${
                        activeSection === section.id
                          ? "font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/30"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {section.icon}
                      </span>
                      <span>{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-5 text-white">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Validation Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">
                      Minimum words
                    </span>
                    <span className="text-[11px] font-bold text-green-400">
                      Met
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-300">
                      Outcomes total
                    </span>
                    <span className="text-[11px] font-bold text-green-400">
                      {formData.outcomes.length}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">
                      Assessments total
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        formData.assessments.reduce(
                          (sum, a) => sum + parseInt(a.weight || 0),
                          0,
                        ) === 100
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {formData.assessments.reduce(
                        (sum, a) => sum + parseInt(a.weight || 0),
                        0,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleOutlinePage;
