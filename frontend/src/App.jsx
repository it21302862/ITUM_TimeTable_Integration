import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SelectAcademicYear from './components/SelectAcademicYear';
import SelectSemester from './components/SelectSemester';
import WeeklyTimetable from './components/WeeklyTimetable';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectAcademicYear />} />
        <Route path="/semesters/:yearId" element={<SelectSemester />} />
        <Route path="/timetable/:semesterId" element={<WeeklyTimetable />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
