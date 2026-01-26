import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../services/api";

const ModuleOutlinesList = () => {
  const { yearId, semesterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const yearLabel = location.state?.yearLabel || "";
  const semesterName = location.state?.semesterName || "";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCourses();
  }, [semesterId, yearId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses({ semesterId: Number(semesterId) });
      setCourses(data || []);
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      course.code?.toLowerCase().includes(term) ||
      course.name?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(`/modules/${yearId}/${semesterId}`, { state: { yearLabel, semesterName } })}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2 text-sm font-medium"
          >
            ← Back to Modules
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Module Outlines</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{yearLabel} - {semesterName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search modules by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No modules found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/module-outline/${course.id}`, { state: { course } })}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.code}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{course.name}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Credits: {Number(course.credit).toFixed(1)}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                      View →
                    </span>
                  </div>

                  {course.moduleLeader && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Module Leader</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {course.moduleLeader.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleOutlinesList;
