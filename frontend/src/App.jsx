import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SelectAcademicYear from "./components/SelectAcademicYear";
import SelectSemester from "./components/SelectSemester";
import WeeklyTimetable from "./components/WeeklyTimetable";
import ModulesPage from "./components/ModulesPage";
import InstructorsPage from "./components/InstructorsPage";
import AvailableInstructorsPage from "./components/AvailableInstructorsPage";
import ModuleOutlinesList from "./components/ModuleOutlinesList";
import ModuleOutlinePage from "./components/ModuleOutlinePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<SelectAcademicYear />} />
        <Route path="/semesters/:yearId" element={<SelectSemester />} />
        {/* Include yearId in timetable route for proper context passing */}
        <Route path="/timetable/:yearId/:semesterId" element={<WeeklyTimetable />} />
        {/* Modules and Instructors with optional semester context */}
        <Route path="/modules/:yearId/:semesterId" element={<ModulesPage />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/instructors/:yearId/:semesterId" element={<InstructorsPage />} />
        <Route path="/instructors" element={<InstructorsPage />} />
        <Route path="/available-instructors" element={<AvailableInstructorsPage />} />
        <Route path="/timetable/:yearId/:semesterId/available-instructors" element={<AvailableInstructorsPage />} />
        {/* Module Outlines routes */}
        <Route path="/module-outlines/:yearId/:semesterId" element={<ModuleOutlinesList />} />
        <Route path="/module-outlines" element={<ModuleOutlinesList />} />
        <Route path="/module-outline/:courseId" element={<ModuleOutlinePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

