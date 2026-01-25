import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { api } from "../services/api";

const WeeklyTimetable = () => {
  const { semesterId } = useParams();
  const location = useLocation();

  const [timetableSlots, setTimetableSlots] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [lectureHalls, setLectureHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeek] = useState(getCurrentWeek());
  const [viewMode, setViewMode] = useState("weekly");
  const [selectedSlot, setSelectedSlot] = useState(null);

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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "10:00",
    sessionType: "LECTURE",
    CourseId: "",
    InstructorId: "",
    LectureHallId: "",
  });

  function getCurrentWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    return { start: monday, end: friday, today: new Date() };
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

    if (semesterId) fetchTimetable();
  }, [semesterId]);

  // Form change handler for modal
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSlotForm((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for adding new slot
  const openAddModal = () => {
    setSlotForm({
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "10:00",
      sessionType: "LECTURE",
      CourseId: "",
      InstructorId: "",
      LectureHallId: "",
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateSlot = (e) => {
    e.preventDefault();
    console.log("Creating slot:", slotForm);
    setIsModalOpen(false);
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeLabel = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const getTimeSlots = () => {
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

  const getDaysOfWeek = () => [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ];

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
        return "bg-blue-100/60 dark:bg-blue-900/30 border-l-4 border-blue-600";
      case "PRACTICAL":
        return "bg-green-100/60 dark:bg-green-900/30 border-l-4 border-green-600";
      case "TUTORIAL":
        return "bg-purple-100/60 dark:bg-purple-900/30 border-l-4 border-purple-600";
      case "EXAM":
        return "bg-orange-100/60 dark:bg-orange-900/30 border-l-4 border-orange-600";
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

  const getSlotsForDayAndTime = (day, timeSlot) => {
    const [rowH, rowM] = timeSlot.split(":").map(Number);
    const rowStart = rowH * 60 + rowM;
    const rowEnd = rowStart + 60; // one row = 1 hour

    return timetableSlots.filter((slot) => {
      if (slot.dayOfWeek !== day) return false;

      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);

      const slotStart = startH * 60 + startM;
      const slotEnd = endH * 60 + endM;

      // ✅ overlap check
      return slotStart < rowEnd && slotEnd > rowStart;
    });
  };

  const isToday = (day) => {
    const dayMap = {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
    };
    return dayMap[new Date().getDay()] === day;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading timetable...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );

  const timeSlots = getTimeSlots();
  const daysToRender =
    viewMode === "weekly"
      ? getDaysOfWeek()
      : [getDaysOfWeek().find(isToday) || getDaysOfWeek()[0]];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
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

      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-[#e7ebf3] dark:border-gray-800 flex flex-col">
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                Navigation
              </h3>
              <nav className="space-y-1.5">
                <button
                  onClick={() => setViewMode("weekly")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    viewMode === "weekly"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    calendar_view_week
                  </span>
                  Weekly View
                </button>
                <button
                  onClick={() => setViewMode("daily")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    viewMode === "daily"
                      ? "bg-blue-600/10 text-blue-700 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="material-symbols-outlined">view_day</span>
                  List View
                </button>
              </nav>
            </div>

            <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={openAddModal}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-primary-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
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

        {/* Timetable Grid */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-gray-50 dark:bg-gray-950">
          <div className="max-w-screen-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Weekly Timetable
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {formatDate(currentWeek.start)} – {formatDate(currentWeek.end)}
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <div
                className="grid min-w-[720px] lg:min-w-0"
                style={{
                  gridTemplateColumns: `80px repeat(${daysToRender.length}, minmax(220px, 1fr))`,
                  gridTemplateRows: `auto repeat(${getTimeSlots().length}, minmax(64px, auto))`,
                }}
              >
                {/* Empty top-left corner */}
                <div className="bg-gray-100/60 dark:bg-gray-800/40 border-b border-r dark:border-gray-800" />

                {/* Day headers */}
                {daysToRender.map((day) => (
                  <div
                    key={day}
                    className={`p-3 text-center font-semibold text-sm border-b border-r last:border-r-0 dark:border-gray-800 ${
                      isToday(day) ? "text-blue-600 dark:text-blue-400" : ""
                    }`}
                  >
                    {getDayName(day).toUpperCase()}
                  </div>
                ))}

                {/* Time rows */}
                {getTimeSlots().map((time) => (
                  <>
                    <div className="p-3 text-right text-xs text-gray-500 font-medium border-b border-r dark:border-gray-800">
                      {formatTimeLabel(time)}
                    </div>

                    {daysToRender.map((day) => {
                      const slots = getSlotsForDayAndTime(day, time);
                      return (
                        <div
                          key={`${day}-${time}`}
                          className={`border-b border-r last:border-r-0 dark:border-gray-800 p-1.5 relative ${
                            isToday(day)
                              ? "bg-blue-50/30 dark:bg-blue-950/20"
                              : ""
                          }`}
                        >
                          {slots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`w-full h-full text-left rounded p-2.5 ${getSessionTypeColor(
                                slot.sessionType,
                              )} hover:opacity-90 transition-opacity text-xs`}
                            >
                              <div className="font-bold uppercase text-[10px] opacity-90">
                                {getSessionTypeLabel(slot.sessionType)}
                              </div>
                              <div className="font-semibold mt-0.5">
                                {slot.Course?.name ||
                                  slot.Course?.code ||
                                  "Course"}
                              </div>
                              <div className="text-[10px] opacity-80">
                                {slot.LectureHall?.name || "Room TBD"}
                              </div>
                              <div className="text-[10px] opacity-70 mt-1">
                                {formatTime(slot.startTime)} –{" "}
                                {formatTime(slot.endTime)}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right Details Panel */}
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
                        <span className="text-gray-400 text-[11px]">
                          Session Type
                        </span>
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
                          {getDayName(
                            selectedSlot.dayOfWeek || "",
                          ).toUpperCase()}
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
                        <span className="text-gray-400 text-[11px]">
                          Lab/Room
                        </span>
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
      </div>

      {/* Add New Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-[#e7ebf3] dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined font-bold">
                    add_box
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  Add New Slot
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Module / Course
                </label>
                <select
                  name="CourseId"
                  value={slotForm.CourseId}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-3"
                >
                  <option disabled selected>
                    Select a module
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Session Type
                  </label>
                  <select
                    name="sessionType"
                    value={slotForm.sessionType}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-3"
                  >
                    <option>LECTURE</option>
                    <option>PRACTICAL</option>
                    <option>TUTORIAL</option>
                    <option>EXAM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Lecture Hall / Lab
                  </label>
                  <select
                    name="LectureHallId"
                    value={slotForm.LectureHallId}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-3"
                  >
                    <option disabled selected>
                      Select Location
                    </option>
                    {lectureHalls.map((lecturehall) => (
                    <option key={lecturehall.id} value={lecturehall.id}>
                      {lecturehall.name}
                    </option>
                  ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Instructor
                </label>
                <select
                  name="InstructorId"
                  value={slotForm.InstructorId}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-3"
                >
                  <option disabled selected>
                    Assign Instructor
                  </option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Day of Week
                  </label>
                  <select
                    name="dayOfWeek"
                    value={slotForm.dayOfWeek}
                    onChange={handleFormChange}
                    className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-primary uppercase py-2 px-3"
                  >
                    <option>MONDAY</option>
                    <option>TUESDAY</option>
                    <option>WEDNESDAY</option>
                    <option>THURSDAY</option>
                    <option>FRIDAY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Start Time
                  </label>
                  <input
                    name="startTime"
                    type="time"
                    value={slotForm.startTime}
                    onChange={handleFormChange}
                    className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-primary py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    End Time
                  </label>
                  <input
                    name="endTime"
                    type="time"
                    value={slotForm.endTime}
                    onChange={handleFormChange}
                    className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-primary py-2 px-3"
                  />
                </div>
              </div>

              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTimetable;
