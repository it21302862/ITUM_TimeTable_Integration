import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";

const SelectSemester = () => {
  const { yearId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const yearLabel = location.state?.yearLabel || "2024";

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await api.getSemestersByYear(yearId);
        setSemesters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (yearId) {
      fetchSemesters();
    }
  }, [yearId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "CURRENT":
        return "bg-primary-blue-light";
      case "PAST":
        return "bg-status-past";
      case "DRAFT":
        return "bg-status-plan-draft";
      default:
        return "bg-status-orange";
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "CURRENT":
        return {
          icon: "⦿",
          text: "Current Semester",
          color: "text-primary-blue",
          border: "border-primary-blue",
        };
      case "PAST":
        return {
          icon: "◷",
          text: "Past",
          color: "text-gray-medium-dark",
          border: "",
        };
      case "DRAFT":
        return {
          icon: "🔒",
          text: "Plan Draft",
          color: "text-gray-medium-dark",
          border: "",
        };
      case "DRAFT":
        return {
          icon: "🔒",
          text: "Plan Draft",
          color: "text-gray-medium-dark",
          border: "",
        };
      default:
        return {
          icon: "🔒",
          text: "Plan Draft",
          color: "text-gray-medium-dark",
          border: "",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getDateRange = (semester) => {
    const start = formatDate(semester.startDate);
    const end = formatDate(semester.endDate);
    if (start && end) {
      return `${start} - ${end}`;
    }
    return "Date TBD";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-medium">Loading semesters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light-alt">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-16 h-8 bg-primary-blue rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">ITUM</span>
              </div>
              <span className="text-xl font-semibold text-text-dark">
                UniTime Manager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-medium-dark cursor-pointer">⚙️</span>
              <div className="relative">
                <span className="text-gray-medium-dark cursor-pointer">🔔</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary-blue rounded-full"></span>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-border-subtle-alt"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-2 text-sm">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            className="text-primary-blue hover:underline flex items-center space-x-1"
          >
            <span>🏠</span>
            <span>{yearLabel}</span>
          </a>
          <span className="text-gray-medium-dark">/</span>
          <span className="text-gray-medium-dark">Semesters</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-3">
            Select Semester
          </h1>
          <p className="text-[#4c669a] dark:text-gray-400 text-base font-normal leading-normal">
            Choose the academic period you wish to manage for the academic year{" "}
            {yearLabel}.
          </p>
        </div>

        {/* Semester Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {semesters.map((semester, index) => {
            const statusInfo = getStatusInfo(semester.status);
            const isActive = semester.status === "CURRENT";
            return (
              <div
                key={semester.id}
                onClick={() =>
                  navigate(`/timetable/${semester.id}`, {
                    state: {
                      semesterName: semester.name || `Semester ${index + 1}`,
                      yearLabel: yearLabel,
                    },
                  })
                }
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  isActive ? `ring-2 ${statusInfo.border}` : ""
                }`}
              >
                {/* Colored Top Bar */}
                <div className={`h-4 ${getStatusColor(semester.status)}`}>
                  {isActive && (
                    <div className="flex justify-end pr-2 pt-1">
                      <span className="bg-primary-blue-badge text-primary-blue text-xs px-2 py-0.5 rounded-full font-semibold">
                        ACTIVE
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-dark mb-2">
                    {semester.name || `Semester ${index + 1}`}
                  </h3>
                  <p className="text-gray-medium-dark mb-4">
                    {getDateRange(semester)}
                  </p>
                  <div
                    className={`flex items-center space-x-2 ${statusInfo.color}`}
                  >
                    <span>{statusInfo.icon}</span>
                    <span className="text-sm">{statusInfo.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Chat Icon */}
      <footer class="px-4 md:px-40 py-8 border-t border-[#cfd7e7] dark:border-gray-800 text-center">
        <p class="text-[#4c669a] dark:text-gray-500 text-sm">
          © 2024 UniTime Manager • Faculty of Academic Planning
        </p>
      </footer>
    </div>
  );
};

export default SelectSemester;
