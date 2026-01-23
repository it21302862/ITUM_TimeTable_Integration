import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import activeYearImage from "../assets/active-year.jpg";

const SelectAcademicYear = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const data = await api.getAcademicYears();
        setAcademicYears(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicYears();
  }, []);

  const getStatusImage = (status) => {
    if (status === "ACTIVE") {
      return activeYearImage;
    }
    // For other statuses, use gradient backgrounds
    return null;
  };

  const getStatusImageStyle = (status) => {
    if (status === "ACTIVE") {
      return null; // Will use actual image
    }
    switch (status) {
      case "PAST":
        return {
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        };
      case "DRAFT":
        return {
          background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        };
      default:
        return {
          background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
        };
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "PAST":
        return "bg-status-past text-white";
      case "ACTIVE":
        return "bg-primary-blue text-white";
      case "DRAFT":
        return "bg-status-draft text-text-dark";
      default:
        return "bg-gray-medium text-white";
    }
  };

  const getCardDescription = (status) => {
    switch (status) {
      case "PAST":
        return "Archived Schedules";
      case "ACTIVE":
        return "Current Academic Period";
      case "DRAFT":
        return "Future Planning";
      default:
        return "";
    }
  };

  const getActionText = (status) => {
    switch (status) {
      case "PAST":
        return "View Records →";
      case "ACTIVE":
        return "Open Dashboard →";
      case "DRAFT":
        return "Start Planning →";
      default:
        return "View →";
    }
  };

  const handleCardClick = (year) => {
    navigate(`/semesters/${year.id}`, { state: { yearLabel: year.yearLabel } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-medium">Loading academic years...</div>
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
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-16 h-8 bg-primary-blue rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">ITUM</span>
              </div>
              <h2 class="text-[#0d121b] dark:text-white text-lg font-bold leading-tight tracking-tight">UniTime</h2>
            </div>

            {/* <div class="hidden md:flex flex-1 justify-center gap-10">
              <a
                class="flex items-center gap-2 text-[#0d121b] dark:text-gray-500 text-sm font-medium hover:text-primary transition-colors"
                href="#"
              >
                <span class="material-symbols-outlined text-[25px]">home</span>{" "}
                Home
              </a>
              <a
                class="flex items-center gap-2 text-[#0d121b] dark:text-gray-500 text-sm font-medium hover:text-primary transition-colors"
                href="#"
              >
                <span class="material-symbols-outlined text-[25px]">
                  history
                </span>{" "}
                History
              </a>
              <a
                class="flex items-center gap-2 text-[#0d121b] dark:text-gray-500 text-sm font-medium hover:text-primary transition-colors"
                href="#"
              >
                <span class="material-symbols-outlined text-[25px]">
                  chat_bubble
                </span>{" "}
                Emergency Chat
              </a>
            </div> */}

            <div className="flex items-center gap-3">
              <button className="hidden sm:flex size-10 items-center justify-center rounded-lg bg-[#e7ebf3] dark:bg-gray-800 text-[#0d121b] dark:text-white hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">notifications</span>
              </button>

              <div
                className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAc_zqWPCY66JwFhgj4TUTraFNpWiBzqhlJGkp2dcxsHXoXQzn1wqgZIVUAjeKmHvwXU18pSGoNv9VbmPJ4_IyLfsaz3bw-EQcxLSY6O1FyWaiJhwZ3nkM8IxOZJJPpnuRuWHidB6UEIS2I0UbjWsj7GL1o07qsuxFJyDTTrDfDETbVt5apdACzL8BZStgospHZve4Z-PLekfpdrKmaSr7WcCj_kFwCf54uPGMf5xxWbwqpliSqXw3uJZy4mZOD0AARZE67z8JpyFk")',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-2">
          <h1 className="text-[#0d121b] dark:text-white tracking-tight text-[32px] md:text-[42px] font-extrabold leading-tight text-center">
            Select Academic Year
          </h1>
          <div class="mb-12">
            <p class="text-[#4c669a] dark:text-gray-400 text-lg font-normal leading-normal text-center max-w-2xl mx-auto">
              Welcome to the Timetable Portal. Choose the relevant academic
              period to view your schedules, course plans, and semester
              breakdowns.
            </p>
          </div>
        </div>

        {/* Academic Year Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {academicYears.map((year) => {
            const isActive = year.status === "ACTIVE";
            return (
              <div
                key={year.id}
                onClick={() => handleCardClick(year)}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  isActive
                    ? "ring-2 ring-primary-blue"
                    : "border border-border-subtle"
                }`}
              >
                {/* Image */}
                <div
                  className="relative h-48 overflow-hidden"
                  style={getStatusImageStyle(year.status)}
                >
                  {getStatusImage(year.status) ? (
                    <img
                      src={getStatusImage(year.status)}
                      alt={`${year.yearLabel} Year`}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(year.status)}`}
                  >
                    {year.status}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-dark mb-2">
                    {year.yearLabel} Year
                  </h3>
                  <p className="text-gray-medium mb-4">
                    {getCardDescription(year.status)}
                  </p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(year);
                    }}
                    className="text-primary-blue font-medium hover:underline inline-flex items-center"
                  >
                    {getActionText(year.status)}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assistance Section */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span class="material-symbols-outlined text-[32px]">support_agent</span>
            </div>
            <div>
              <h3 className="font-bold text-text-dark mb-1">
                Need Immediate Assistance?
              </h3>
              <p className="text-gray-medium">
                Our academic support team is online to resolve timetable
                conflicts.
              </p>
            </div>
          </div>
          <button className="bg-primary-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-blue-light transition-colors flex items-center space-x-2">
            <span class="material-symbols-outlined text-[20px]">forum</span>
            <span class="truncate">Open Emergency Chat</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto px-6 md:px-20 lg:px-40 py-8 border-t border-[#e7ebf3] dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#4c669a] dark:text-gray-500">
          
            <p className="text-gray-medium text-sm">
              © 2026 UniTime Academic Systems. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" class="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" class="hover:text-primary transition-colors">
                User Guide
              </a>
              <a href="#" class="hover:text-primary transition-colors">
                Support Portal
              </a>
            </div>
            
        </div>
      </footer>
    </div>
  );
};

export default SelectAcademicYear;
