import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const WeeklyTimetable = () => {
  const { semesterId } = useParams();
  const location = useLocation();
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());

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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTimeSlots = () => {
    return ['08:00', '10:00', '12:00', '14:00', '16:00'];
  };

  const getDaysOfWeek = () => {
    return ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  };

  const getDayName = (day) => {
    const dayMap = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday'
    };
    return dayMap[day] || day;
  };

  const getSessionTypeColor = (sessionType) => {
    switch (sessionType) {
      case 'LECTURE':
        return 'bg-blue-500';
      case 'PRACTICAL':
        return 'bg-green-500';
      case 'TUTORIAL':
        return 'bg-purple-500';
      case 'EXAM':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSessionTypeLabel = (sessionType) => {
    switch (sessionType) {
      case 'LECTURE':
        return 'LECTURE';
      case 'PRACTICAL':
        return 'LAB SESSION';
      case 'TUTORIAL':
        return 'TUTORIAL';
      case 'EXAM':
        return 'EXAM';
      default:
        return sessionType;
    }
  };

  const isActiveNow = (slot) => {
    const now = new Date();
    const currentDay = now.getDay();
    const dayMap = { 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY' };
    const currentDayName = dayMap[currentDay];
    
    if (slot.dayOfWeek !== currentDayName) return false;
    
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour * 60 + currentMin;
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  const getSlotsForDayAndTime = (day, timeSlot) => {
    return timetableSlots.filter(slot => {
      if (slot.dayOfWeek !== day) return false;
      const [slotHour] = slot.startTime.split(':').map(Number);
      const [timeHour] = timeSlot.split(':').map(Number);
      // Match slots that start at this hour or within the hour range
      return slotHour >= timeHour && slotHour < timeHour + 2;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    const dayMap = { 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY' };
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
  const yearLabel = location.state?.yearLabel || '';

  return (
    <div className="min-h-screen bg-bg-light-alt">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-semibold text-text-dark">UniTime Manager</span>
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
          <a href="/" className="text-primary-blue hover:underline flex items-center space-x-1">
            <span>🏠</span>
            <span>Home</span>
          </a>
          <span className="text-gray-medium-dark">/</span>
          {yearLabel && (
            <>
              <span className="text-primary-blue">{yearLabel}</span>
              <span className="text-gray-medium-dark">/</span>
            </>
          )}
          <span className="text-gray-medium-dark">{semesterName}</span>
          <span className="text-gray-medium-dark">/</span>
          <span className="text-gray-medium-dark">Weekly Timetable</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Timetable Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">Weekly Timetable</h1>
              <p className="text-gray-medium-dark">
                {formatDate(currentWeek.start)} - {formatDate(currentWeek.end)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-medium-dark hover:bg-gray-50 flex items-center space-x-2">
                <span>📥</span>
                <span>Export</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-medium-dark hover:bg-gray-50 flex items-center space-x-2">
                <span>🖨️</span>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-medium-dark border-r border-gray-200">
                    TIME
                  </th>
                  {getDaysOfWeek().map((day) => (
                    <th
                      key={day}
                      className={`px-4 py-3 text-center text-sm font-semibold text-gray-medium-dark border-r border-gray-200 ${
                        isToday(day) ? 'bg-blue-50' : ''
                      }`}
                    >
                      {getDayName(day)}
                      {isToday(day) && (
                        <div className="text-xs text-primary-blue font-normal mt-1">Today</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getTimeSlots().map((timeSlot) => (
                  <tr key={timeSlot} className="border-b border-gray-200">
                    <td className="px-4 py-4 text-sm font-medium text-gray-medium-dark border-r border-gray-200 bg-gray-50">
                      {formatTime(timeSlot)}
                    </td>
                    {getDaysOfWeek().map((day) => {
                      const slots = getSlotsForDayAndTime(day, timeSlot);
                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className={`px-2 py-2 border-r border-gray-200 min-w-[200px] ${
                            isToday(day) ? 'bg-blue-50' : ''
                          }`}
                        >
                          {slots.map((slot) => {
                            const isActive = isActiveNow(slot);
                            return (
                              <div
                                key={slot.id}
                                className={`mb-2 p-3 rounded-lg text-white ${getSessionTypeColor(
                                  slot.sessionType
                                )} ${isActive ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                              >
                                {isActive && (
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold bg-yellow-400 text-gray-900 px-2 py-0.5 rounded">
                                      ACTIVE NOW
                                    </span>
                                    <span className="text-xs">🔲</span>
                                  </div>
                                )}
                                <div className="font-semibold text-sm mb-1">
                                  {getSessionTypeLabel(slot.sessionType)} {slot.Course?.name || slot.Course?.code || slot.CourseId || 'Course'}
                                </div>
                                <div className="text-xs opacity-90">
                                  {slot.LectureHall?.name || slot.LectureHallId || 'Room TBD'}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </div>
                                {slot.Instructor && (
                                  <div className="text-xs opacity-75 mt-1">
                                    {slot.Instructor.name || slot.InstructorId}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-gray-medium-dark">Legend:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-medium-dark">Lectures</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-medium-dark">Labs</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-medium-dark">CA Exams</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-medium-dark">Tutorials</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeeklyTimetable;
