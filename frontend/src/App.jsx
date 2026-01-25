import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SelectAcademicYear from "./components/SelectAcademicYear";
import SelectSemester from "./components/SelectSemester";
import WeeklyTimetable from "./components/WeeklyTimetable";
import ModulesPage from "./components/ModulesPage";
import InstructorsPage from "./components/InstructorsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectAcademicYear />} />
        <Route path="/semesters/:yearId" element={<SelectSemester />} />
        {/* Include yearId in timetable route for proper context passing */}
        <Route path="/timetable/:yearId/:semesterId" element={<WeeklyTimetable />} />
        {/* Modules and Instructors with optional semester context */}
        <Route path="/modules/:yearId/:semesterId" element={<ModulesPage />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/instructors/:yearId/:semesterId" element={<InstructorsPage />} />
        <Route path="/instructors" element={<InstructorsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
