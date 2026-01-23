import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { Link } from "react-router-dom";

const WeeklyTimetable = () => {
  const { semesterId } = useParams();
  const location = useLocation();
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [viewMode, setViewMode] = useState("weekly"); // 'weekly' | 'daily'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "10:00",
    sessionType: "LECTURE",
    CourseId: "",
    InstructorId: "",
    LectureHallId: "",
  });

  // Get current week (Monday to Friday)
  function getCurrentWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    return {
      start: monday,
      end: friday,
      today: new Date()
    };
  }

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await api.getTimetableBySemester(semesterId);
        setTimetableSlots(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (semesterId) {
      fetchTimetable();
    }
  }, [semesterId]);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeLabel = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const h = hours.toString().padStart(2, "0");
    const m = minutes.toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const getTimeSlots = () => {
    // One-hour slots from 08:15 to 18:15
    const slots = [];
    let hour = 8;
    let minute = 15;
    while (hour < 18 || (hour === 18 && minute <= 15)) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
      hour += 1;
    }
    return slots;
  };

  const getDaysOfWeek = () => {
    return ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  };

  const getDayName = (day) => {
    const dayMap = {
      MONDAY: "Mon",
      TUESDAY: "Tue",
      WEDNESDAY: "Wed",
      THURSDAY: "Thu",
      FRIDAY: "Fri",
    };
    return dayMap[day] || day;
  };

  const getSessionTypeColor = (sessionType) => {
    switch (sessionType) {
      case "LECTURE":
        return "bg-blue-100/60 dark:bg-blue-900/30 border-l-4 border-primary-blue";
      case "PRACTICAL":
        return "bg-green-100/60 dark:bg-green-900/30 border-l-4 border-green-500";
      case "TUTORIAL":
        return "bg-purple-100/60 dark:bg-purple-900/30 border-l-4 border-purple-500";
      case "EXAM":
        return "bg-orange-100/60 dark:bg-orange-900/30 border-l-4 border-orange-500";
      default:
        return "bg-gray-100/70 dark:bg-gray-800/40 border-l-4 border-gray-400";
    }
  };

  const getSessionTypeLabel = (sessionType) => {
    switch (sessionType) {
      case "LECTURE":
        return "LECTURE";
      case "PRACTICAL":
        return "LABORATORY";
      case "TUTORIAL":
        return "TUTORIAL";
      case "EXAM":
        return "EXAM PREP";
      default:
        return sessionType;
    }
  };

  const isActiveNow = (slot) => {
    const now = new Date();
    const currentDay = now.getDay();
    const dayMap = {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
    };
    const currentDayName = dayMap[currentDay];
    
    if (slot.dayOfWeek !== currentDayName) return false;
    
    const [startHour, startMin] = slot.startTime.split(":").map(Number);
    const [endHour, endMin] = slot.endTime.split(":").map(Number);
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour * 60 + currentMin;
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  const getSlotsForDayAndTime = (day, timeSlot) => {
    return timetableSlots.filter((slot) => {
      if (slot.dayOfWeek !== day) return false;
      const [slotHour, slotMin] = slot.startTime.split(":").map(Number);
      const [timeHour, timeMin] = timeSlot.split(":").map(Number);

      const slotStart = slotHour * 60 + slotMin;
      const rowStart = timeHour * 60 + timeMin;
      const rowEnd = rowStart + 60;

      // Slot starts within this one-hour window
      return slotStart >= rowStart && slotStart < rowEnd;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    const dayMap = {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
    };
    return dayMap[today.getDay()] === day;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light-alt">
        <div className="text-gray-medium">Loading timetable...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light-alt">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const semesterName = location.state?.semesterName || 'Semester';
  const yearLabel = location.state?.yearLabel || "";

  const timeSlots = getTimeSlots();
  const allDays = getDaysOfWeek();
  const daysToRender =
    viewMode === "weekly"
      ? allDays
      : allDays.filter((d) => isToday(d)) || [allDays[0]];

  const resetFormForNew = () => {
    setIsCreating(true);
    setSelectedSlot(null);
    setSlotForm({
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "10:00",
      sessionType: "LECTURE",
      CourseId: "",
      InstructorId: "",
      LectureHallId: "",
    });
  };

  const hydrateFormFromSlot = (slot) => {
    if (!slot) return;
    setIsCreating(false);
    setSlotForm({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime?.slice(0, 5) || "09:00",
      endTime: slot.endTime?.slice(0, 5) || "10:00",
      sessionType: slot.sessionType,
      CourseId: slot.CourseId || "",
      InstructorId: slot.InstructorId || "",
      LectureHallId: slot.LectureHallId || "",
    });
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    hydrateFormFromSlot(slot);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSlotForm((prev) => ({ ...prev, [name]: value }));
  };

  const reloadTimetable = async () => {
    const data = await api.getTimetableBySemester(semesterId);
    setTimetableSlots(data);
  };

  const handleSaveSlot = async () => {
    const payload = {
      ...slotForm,
      SemesterId: Number(semesterId),
      CourseId: slotForm.CourseId ? Number(slotForm.CourseId) : null,
      InstructorId: slotForm.InstructorId ? Number(slotForm.InstructorId) : null,
      LectureHallId: slotForm.LectureHallId ? Number(slotForm.LectureHallId) : null,
    };

    if (isCreating) {
      await api.createTimetableSlot(payload);
    } else if (selectedSlot?.id) {
      await api.updateTimetableSlot(selectedSlot.id, payload);
    }

    await reloadTimetable();
    setIsCreating(false);
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot?.id) return;
    await api.deleteTimetableSlot(selectedSlot.id);
    await reloadTimetable();
    setSelectedSlot(null);
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white">
      {/* Header */}
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
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
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

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-2 py-4">
  <button
    type="button"
    onClick={() => navigate("/")}
    className="text-primary-blue hover:underline text-base font-medium leading-normal flex items-center gap-1"
  >
    <span className="material-symbols-outlined text-sm">home</span>
    {yearLabel}
  </button>

  <span className="text-[#4c669a] text-base font-medium leading-normal">/</span>

  <button
    type="button"
    onClick={() => navigate(`/semesters/${yearId}`)}
    className="text-primary-blue hover:underline text-base font-medium leading-normal"
  >
    <span className="text-[#0d121b] dark:text-white">
      {semesterName}
    </span>
  </button>
</div>

      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden px-2 pb-12 w-full">
        {/* Left sidebar navigation */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-[#e7ebf3] dark:border-gray-800 flex flex-col">
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Navigation
              </h3>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setViewMode("weekly")}
                  className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    viewMode === "weekly"
                      ? "bg-primary-blue text-white font-semibold shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">calendar_view_week</span>
                  <span>Weekly View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("daily")}
                  className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    viewMode === "daily"
                      ? "bg-primary-blue/10 text-primary-blue font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">view_day</span>
                  <span>List View</span>
                </button>
              </nav>
            </div>

            <div className="space-y-4 mt-auto border-t border-gray-100 dark:border-gray-800 pt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Quick Access
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={resetFormForNew}
                  className="flex items-center gap-3 px-4 py-3 bg-primary-blue text-white rounded-xl shadow-lg shadow-primary-blue/20 hover:scale-[1.02] transition-transform font-bold"
                >
                  <span className="material-symbols-outlined">add_box</span>
                  <span>Add Slot</span>
                </button>
                <a
                  href="/modules"
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  <span className="material-symbols-outlined">book</span>
                  <span>Modules</span>
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

        {/* Centre: timetable */}
        <section className="flex-1 overflow-y-auto p-4 bg-background-light dark:bg-background-dark">
          <div className="max-w-5xl mx-auto">
            {/* Timetable Header */}
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-[#0d121b] dark:text-white text-2xl font-bold leading-tight">
                  Weekly Timetable
                </h2>
                <p className="text-[#4c669a] text-sm">
                  {formatDate(currentWeek.start)} - {formatDate(currentWeek.end)}
                </p>
              </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white dark:bg-[#1a2131] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 overflow-hidden">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `80px repeat(${daysToRender.length}, minmax(0, 1fr))`,
                  gridTemplateRows: `auto repeat(${timeSlots.length}, minmax(60px, 1fr))`,
                }}
              >
                {/* Header row */}
                <div className="p-4 border-b border-r border-[#e7ebf3] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30" />
                {daysToRender.map((day) => (
                  <div
                    key={`head-${day}`}
                    className={`p-4 border-b border-r last:border-r-0 border-[#e7ebf3] dark:border-gray-800 text-center font-bold text-sm bg-gray-50/50 dark:bg-gray-800/30 ${
                      isToday(day) ? "text-primary-blue" : ""
                    }`}
                  >
                    {getDayName(day).toUpperCase()}
                  </div>
                ))}

                {/* Time rows */}
                {timeSlots.map((timeSlot) => (
                  <>
                    {/* Time label cell */}
                    <div
                      key={`time-${timeSlot}`}
                      className="p-4 border-b border-r border-[#e7ebf3] dark:border-gray-800 text-right text-xs text-[#4c669a] font-medium"
                    >
                      {formatTimeLabel(timeSlot)}
                    </div>

                    {daysToRender.map((day) => {
                      const slots = getSlotsForDayAndTime(day, timeSlot);
                      const isCurrentDay = isToday(day);
                      return (
                        <div
                          key={`${day}-${timeSlot}`}
                          className={`border-b border-r last:border-r-0 border-[#e7ebf3] dark:border-gray-800 p-1 relative ${
                            isCurrentDay ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                          }`}
                        >
                          {slots.map((slot) => {
                            const isActive = isActiveNow(slot);
                            const visualClasses = getSessionTypeColor(slot.sessionType);
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`h-full w-full text-left ${visualClasses} p-2 rounded flex flex-col justify-between text-[#0d121b] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/60`}
                              >
                                <span className="text-[10px] font-bold uppercase opacity-90">
                                  {getSessionTypeLabel(slot.sessionType)}
                                </span>
                                <p className="text-xs font-bold leading-tight">
                                  {slot.Course?.name ||
                                    slot.Course?.code ||
                                    slot.CourseId ||
                                    "Course"}
                                </p>
                                <p className="text-[10px] opacity-80">
                                  {slot.LectureHall?.name ||
                                    slot.LectureHallId ||
                                    "Room TBD"}
                                </p>
                                <p className="text-[10px] opacity-70 mt-1">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </p>
                                {isActive && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary-blue">
                                    <span className="size-1.5 rounded-full bg-primary-blue" />
                                    Active now
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right: slot details */}
        <aside className="w-80 bg-white dark:bg-gray-900 border-l border-[#e7ebf3] dark:border-gray-800 flex flex-col">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">
                {selectedSlot ? "Slot Details" : "No Slot Selected"}
              </h2>
              {selectedSlot && (
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            {selectedSlot ? (
              <div className="space-y-6">
                <div className="p-4 bg-primary-blue/5 rounded-xl border border-primary-blue/10">
                  <span className="text-[10px] font-black text-primary-blue uppercase tracking-widest">
                    Selected Session
                  </span>
                  <h3 className="text-xl font-bold mt-1">
                    {selectedSlot.Course?.name ||
                      selectedSlot.Course?.code ||
                      "Course"}
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        category
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-[11px]">Session Type</span>
                        <span className="font-semibold">
                          {getSessionTypeLabel(selectedSlot.sessionType)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        event
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-[11px]">Day</span>
                        <span className="font-semibold">
                          {getDayName(selectedSlot.dayOfWeek || "").toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        schedule
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-[11px]">Time</span>
                        <span className="font-semibold">
                          {formatTime(selectedSlot.startTime)} -{" "}
                          {formatTime(selectedSlot.endTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        meeting_room
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-[11px]">Lab/Room</span>
                        <span className="font-semibold">
                          {selectedSlot.LectureHall?.name ||
                            selectedSlot.LectureHallId ||
                            "Not set"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        person
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-[11px]">
                          Instructor Name
                        </span>
                        <span className="font-semibold">
                          {selectedSlot.Instructor?.name ||
                            selectedSlot.InstructorId ||
                            "Not assigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800">
                  <button className="w-full bg-primary-blue text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md">
                    <span className="material-symbols-outlined">save</span>
                    Update Slot
                  </button>
                  <button className="w-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                    <span className="material-symbols-outlined">delete</span>
                    Delete Slot
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Select a time slot on the timetable to view its details here.
              </p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default WeeklyTimetable;
