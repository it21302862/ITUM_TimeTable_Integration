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

  const getCardGradientStyle = (status) => {
    // Match the reference card gradients
    switch (status) {
      case "CURRENT":
        return { backgroundImage: "linear-gradient(135deg, #135bec, #60a5fa)" };
      case "UPCOMING":
        return { backgroundImage: "linear-gradient(135deg, #0d9488, #5eead4)" };
      case "PAST":
        return { backgroundImage: "linear-gradient(135deg, #0d9488, #5eead4)" };
      case "DRAFT":
      default:
        // Use purple for plan draft by default
        return { backgroundImage: "linear-gradient(135deg, #7c3aed, #c084fc)" };
    }
  };

  const getMeta = (status) => {
    // Backend originally had CURRENT/UPCOMING/DRAFT; user also uses PAST sometimes
    switch (status) {
      case "CURRENT":
        return {
          icon: "radio_button_checked",
          text: "Current Semester",
          metaClass: "text-primary-blue text-xs font-semibold mt-2 flex items-center gap-1",
          isActive: true,
        };
      case "UPCOMING":
        return {
          icon: "schedule",
          text: "Upcoming",
          metaClass:
            "text-[#4c669a] dark:text-gray-400 text-xs font-medium mt-2 flex items-center gap-1",
          isActive: false,
        };
      case "PAST":
        return {
          icon: "schedule",
          text: "Past",
          metaClass:
            "text-[#4c669a] dark:text-gray-400 text-xs font-medium mt-2 flex items-center gap-1",
          isActive: false,
        };
      case "DRAFT":
      default:
        return {
          icon: "lock",
          text: "Plan Draft",
          metaClass:
            "text-[#4c669a] dark:text-gray-400 text-xs font-medium mt-2 flex items-center gap-1",
          isActive: false,
        };
    }
  };

  const getAccentBorderClass = (status) => {
    if (status === "CURRENT") return "border-2 border-primary-blue";
    return "border border-transparent hover:border-primary-blue/50";
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
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-[#4c669a]">Loading semesters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-gray-100 min-h-screen font-display">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* TopNavBar */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#cfd7e7] dark:border-gray-800 bg-white dark:bg-background-dark px-6 py-3 md:px-40">
            <div className="flex items-center gap-4 text-primary-blue">
              <div className="size-8">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
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
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-gray-200 dark:border-gray-700"
                aria-label="Profile picture"
              />
            </div>
          </header>

          <main className="px-4 md:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              {/* Breadcrumbs */}
              <div className="flex flex-wrap gap-2 py-4">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                  }}
                  className="text-primary-blue hover:underline text-base font-medium leading-normal flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">home</span>
                  {yearLabel}
                </a>
                <span className="text-[#4c669a] text-base font-medium leading-normal">/</span>
                <span className="text-[#0d121b] dark:text-white text-base font-medium leading-normal">
                  Semesters
                </span>
              </div>

              {/* PageHeading */}
              <div className="flex flex-wrap justify-between gap-3 py-4">
                <div className="flex min-w-72 flex-col gap-3">
                  <h1 className="text-[#0d121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Select Semester
                  </h1>
                  <p className="text-[#4c669a] dark:text-gray-400 text-base font-normal leading-normal">
                    Choose the academic period you wish to manage for the academic year {yearLabel}.
                  </p>
                </div>
              </div>

              {/* ImageGrid (Semester Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
                {semesters.map((semester, index) => {
                  const name = semester.name || `Semester ${index + 1}`;
                  const meta = getMeta(semester.status);

          
                  const isFourth = index === 3;
                  const gradientStyle = isFourth
                    ? { backgroundImage: "linear-gradient(135deg, #ea580c, #fb923c)" }
                    : getCardGradientStyle(semester.status);

                  return (
                    <div
                      key={semester.id}
                      onClick={() =>
                        navigate(`/timetable/${semester.id}`, {
                          state: {
                            semesterName: name,
                            yearLabel: yearLabel,
                          },
                        })
                      }
                      className={`group flex flex-col gap-3 pb-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ${getAccentBorderClass(
                        semester.status
                      )} hover:shadow-md transition-all cursor-pointer relative`}
                    >
                      {meta.isActive ? (
                        <div className="absolute top-2 right-2 bg-primary-blue text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Active
                        </div>
                      ) : null}

                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg overflow-hidden"
                        style={gradientStyle}
                        aria-label={`Stylized gradient representing ${name}`}
                      />

                      <div>
                        <p className="text-[#0d121b] dark:text-white text-lg font-bold leading-normal">{name}</p>
                        <p className="text-[#4c669a] dark:text-gray-400 text-sm font-medium leading-normal">
                          {getDateRange(semester)}
                        </p>
                        <p className={meta.metaClass}>
                          <span className="material-symbols-outlined text-xs">{meta.icon}</span>
                          {meta.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ActionPanel */}
              <div className="py-6 @container">
                <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-xl border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 @[480px]:flex-row @[480px]:items-center shadow-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary-blue">analytics</span>
                      <p className="text-[#0d121b] dark:text-white text-base font-bold leading-tight">
                        Academic Plan Overview
                      </p>
                    </div>
                    <p className="text-[#4c669a] dark:text-gray-400 text-base font-normal leading-normal">
                      Review how these semesters align with your long-term graduation requirements and degree path.
                    </p>
                  </div>

                  <button className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary-blue text-white hover:bg-primary-blue/90 transition-colors text-sm font-bold leading-normal shadow-lg shadow-primary-blue/20">
                    <span className="truncate">View Degree Path</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Emergency Chat Widget */}
          <div className="fixed bottom-6 right-6 z-50">
            <button className="flex items-center justify-center w-14 h-14 bg-primary-blue text-white rounded-full shadow-2xl hover:scale-110 transition-transform group relative">
              <span className="material-symbols-outlined text-3xl">chat</span>
              <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white dark:border-background-dark" />
              <div className="absolute right-16 bg-[#0d121b] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Need help? Chat with Support
              </div>
            </button>
          </div>

          {/* Simple Footer */}
          <footer className="px-4 md:px-40 py-8 border-t border-[#cfd7e7] dark:border-gray-800 text-center">
            <p className="text-[#4c669a] dark:text-gray-500 text-sm">
              © 2024 UniTime Manager • Faculty of Academic Planning
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SelectSemester;
