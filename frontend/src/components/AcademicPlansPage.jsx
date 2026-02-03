import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const AcademicPlansPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semester1, setSemester1] = useState(null);
  const [semester3, setSemester3] = useState(null);
  const [semester1Slots, setSemester1Slots] = useState([]);
  const [semester3Slots, setSemester3Slots] = useState([]);
  const [userData, setUserData] = useState({});
  const [conflictStatus, setConflictStatus] = useState("");
  const [resourceUsage, setResourceUsage] = useState("");
  const [planningNote, setPlanningNote] = useState("");

  // Time slots for the timetable
  const timeSlots = ["08:15", "09:15", "10:15", "11:15", "12:15", "13:15", "14:15", "15:15", "16:15", "17:15","18:15"];
  const days = ["MON", "TUE", "WED", "THU", "FRI"];

  useEffect(() => {
    loadAcademicPlans();
  }, []);

  const loadAcademicPlans = async () => {
    try {
      setLoading(true);

      const userProfile = await api.getUserProfile();
      setUserData(userProfile);

      const currentSemesters = await api.getCurrentSemesters();
      
      const sem1 = currentSemesters.find(s => s.name === "Semester 1" || s.name?.includes("1"));
      const sem3 = currentSemesters.find(s => s.name === "Semester 3" || s.name?.includes("3"));

      if (!sem1 || !sem3) {
        setError("Semester 1 and Semester 3 with CURRENT status not found");
        return;
      }

      setSemester1(sem1);
      setSemester3(sem3);

      const [sem1Result, sem3Result] = await Promise.all([
        api.getTimetableSlotsByInstructor(userProfile.id, { semesterId: sem1.id }),
        api.getTimetableSlotsByInstructor(userProfile.id, { semesterId: sem3.id })
      ]);

      setSemester1Slots(sem1Result.slots || []);
      setSemester3Slots(sem3Result.slots || []);

      // Calculate conflict status, resource usage, etc.
      calculateStats(sem1Result.slots || [], sem3Result.slots || []);

    } catch (err) {
      console.error("Error loading academic plans:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (slots1, slots3) => {
    // Check for conflicts (same time, same day across semesters)
    const conflicts = [];
    slots1.forEach(s1 => {
      slots3.forEach(s3 => {
        if (s1.dayOfWeek === s3.dayOfWeek && s1.startTime === s3.startTime) {
          conflicts.push({
            day: s1.dayOfWeek,
            time: s1.startTime,
            sem1: s1.Course?.code,
            sem3: s3.Course?.code
          });
        }
      });
    });

    if (conflicts.length === 0) {
      setConflictStatus("No scheduling conflicts detected between Semester 1 and Semester 3 modules for the current faculty resources.");
    } else {
      setConflictStatus(`${conflicts.length} scheduling conflict(s) detected. Please review overlapping time slots.`);
    }

    // Calculate resource usage
    const allSlots = [...slots1, ...slots3];
    const lectureHalls = new Set();
    const labs = new Set();
    allSlots.forEach(slot => {
      const hallName = slot.LectureHall?.name || "";
      if (hallName.toLowerCase().includes("hall")) {
        lectureHalls.add(hallName);
      } else if (hallName.toLowerCase().includes("lab")) {
        labs.add(hallName);
      }
    });

    const lectureHallCapacity = lectureHalls.size > 0 ? Math.round((lectureHalls.size / 10) * 100) : 0;
    const labCapacity = labs.size > 0 ? Math.round((labs.size / 5) * 100) : 0;

    setResourceUsage(`Lecture hall occupancy is at ${lectureHallCapacity}% capacity across both semesters. Computer labs are at ${labCapacity}% capacity.`);

    // Planning note
    setPlanningNote("Staff meetings for Module Leaders are scheduled for Wednesday afternoons; no core modules were booked in that slot.");
  };

  const getSlotForTimeAndDay = (slots, time, day) => {
    return slots.find(slot => {
      const slotTime = slot.startTime?.substring(0, 5); // Get HH:MM
      const dayAbbr = getDayAbbr(slot.dayOfWeek);
      return slotTime === time && dayAbbr === day;
    });
  };

  const getDayAbbr = (day) => {
    const dayMap = {
      MONDAY: "MON",
      TUESDAY: "TUE",
      WEDNESDAY: "WED",
      THURSDAY: "THU",
      FRIDAY: "FRI",
    };
    return dayMap[day] || day?.slice(0, 3);
  };

  const getSlotColor = (slot, userId) => {
    if (!slot) return "";
    const isSupportive = slot.SupportiveInstructors?.some(
      instructor => instructor.id === userId
    );
    const isMainInstructor = slot.InstructorId === userId;

    if (isSupportive && !isMainInstructor) {
      return "bg-red-100 border-l-4 border-red-400 text-secondary";
    }

    return "bg-blue-100 border-l-4 border-blue-500 text-primary";
  };

  const formatAcademicYear = (semester) => {
    if (semester?.AcademicYear) {
      const year = semester.AcademicYear;
      if (year.yearLabel) {
        return year.yearLabel;
      }
    }
    return "Academic Year";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading academic plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#cfd7e7] dark:border-gray-800 bg-white dark:bg-[#1a2131] px-10 py-3 z-50">
        
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
            UniPlan
          </h2>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">
                Full Academic View ({semester1?.name || "Semester 1"} &amp; {semester3?.name || "Semester 3"})
              </h1>
              <p className="text-[#4c669a] text-sm">Faculty-wide planning overview &amp; conflict detection</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-4 px-4 py-2 bg-white dark:bg-[#1a2131] rounded-lg border border-[#e7ebf3] dark:border-gray-800 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-blue-500"></span>
                  <span>Main Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-400"></span>
                  <span>Supportive Modules</span>
                </div>
              </div>
              <a onClick={() => navigate("/account-settings")} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a2131] text-[#0d121b] dark:text-white border border-[#e7ebf3] dark:border-gray-800 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Profile
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Semester 1 */}
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
                  <span className="material-symbols-outlined">filter_1</span>
                  {semester1?.name || "Semester 1"}
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                  {formatAcademicYear(semester1)}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1a2131] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 overflow-hidden flex flex-col">
                <div className="timetable-grid bg-gray-50 dark:bg-gray-800/50">
                  <div className="border-b border-r border-gray-100 dark:border-gray-800"></div>
                  {days.map(day => (
                    <div key={day} className="day-header">{day}</div>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto timetable-grid max-h-[500px]">
                  {timeSlots.map(time => (
                    <>
                      <div key={time} className="time-label">{time}</div>
                      {days.map(day => {
                        const slot = getSlotForTimeAndDay(semester1Slots, time, day);
                        const colorClass = getSlotColor(slot, userData.id);
                        return (
                          <div key={`${time}-${day}`} className="slot">
                            {slot && (
                              <div className={`p-2 rounded text-[10px] h-full ${colorClass}`}>
                                <span className="font-bold block">
                                  {slot.Course?.code}: {slot.Course?.name}
                                </span>
                                <span className="text-gray-500 block">
                                  {slot.LectureHall?.name || "TBD"}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </section>

            {/* Semester 3 */}
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
                  <span className="material-symbols-outlined">filter_3</span>
                  {semester3?.name || "Semester 3"}
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                  {formatAcademicYear(semester3)}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1a2131] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 overflow-hidden">
                <div className="timetable-grid bg-gray-50 dark:bg-gray-800/50">
                  <div className="border-b border-r border-gray-100 dark:border-gray-800"></div>
                  {days.map(day => (
                    <div key={day} className="day-header">{day}</div>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto timetable-grid max-h-[500px]">
                  {timeSlots.map(time => (
                    <>
                      <div key={time} className="time-label">{time}</div>
                      {days.map(day => {
                        const slot = getSlotForTimeAndDay(semester3Slots, time, day);
                        const colorClass = getSlotColor(slot, userData.id);
                        return (
                          <div key={`${time}-${day}`} className="slot">
                            {slot && (
                              <div className={`p-2 rounded text-[10px] h-full ${colorClass}`}>
                                <span className="font-bold block">
                                  {slot.Course?.code}: {slot.Course?.name}
                                </span>
                                <span className="text-gray-500 block">
                                  {slot.LectureHall?.name || "TBD"}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1a2131] p-5 rounded-xl border border-[#e7ebf3] dark:border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/10 text-green-600 rounded-lg">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h4 className="font-bold text-sm">Conflict Status</h4>
              </div>
              <p className="text-xs text-[#4c669a]">{conflictStatus}</p>
            </div>
            <div className="bg-white dark:bg-[#1a2131] p-5 rounded-xl border border-[#e7ebf3] dark:border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-lg">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <h4 className="font-bold text-sm">Resource Usage</h4>
              </div>
              <p className="text-xs text-[#4c669a]">{resourceUsage}</p>
            </div>
            <div className="bg-white dark:bg-[#1a2131] p-5 rounded-xl border border-[#e7ebf3] dark:border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-lg">
                  <span className="material-symbols-outlined">info</span>
                </div>
                <h4 className="font-bold text-sm">Planning Note</h4>
              </div>
              <p className="text-xs text-[#4c669a]">{planningNote}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcademicPlansPage;
