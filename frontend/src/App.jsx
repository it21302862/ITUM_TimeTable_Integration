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
        <Route path="/timetable/:semesterId" element={<WeeklyTimetable />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/instructors" element={<InstructorsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
