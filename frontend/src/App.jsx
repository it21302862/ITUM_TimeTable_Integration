import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import AccountSettingsPage from "./components/AccountSettingsPage";
import SelectAcademicYear from "./components/SelectAcademicYear";
import SelectSemester from "./components/SelectSemester";
import WeeklyTimetable from "./components/WeeklyTimetable";
import ModulesPage from "./components/ModulesPage";
import InstructorsPage from "./components/InstructorsPage";
import AvailableInstructorsPage from "./components/AvailableInstructorsPage";
import ModuleOutlinesList from "./components/ModuleOutlinesList";
import ModuleOutlinePage from "./components/ModuleOutlinePage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />
        
        {/* Protected Routes - Require authentication */}
        <Route path="/account-settings" element={<PrivateRoute><AccountSettingsPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><SelectAcademicYear /></PrivateRoute>} />
        <Route path="/semesters/:yearId" element={<PrivateRoute><SelectSemester /></PrivateRoute>} />
        <Route path="/timetable/:yearId/:semesterId" element={<PrivateRoute><WeeklyTimetable /></PrivateRoute>} />
        <Route path="/modules/:yearId/:semesterId" element={<PrivateRoute><ModulesPage /></PrivateRoute>} />
        <Route path="/modules" element={<PrivateRoute><ModulesPage /></PrivateRoute>} />
        <Route path="/instructors/:yearId/:semesterId" element={<PrivateRoute><InstructorsPage /></PrivateRoute>} />
        <Route path="/instructors" element={<PrivateRoute><InstructorsPage /></PrivateRoute>} />
        <Route path="/available-instructors" element={<PrivateRoute><AvailableInstructorsPage /></PrivateRoute>} />
        <Route path="/timetable/:yearId/:semesterId/available-instructors" element={<PrivateRoute><AvailableInstructorsPage /></PrivateRoute>} />
        <Route path="/module-outlines/:yearId/:semesterId" element={<PrivateRoute><ModuleOutlinesList /></PrivateRoute>} />
        <Route path="/module-outlines" element={<PrivateRoute><ModuleOutlinesList /></PrivateRoute>} />
        <Route path="/module-outline/:yearId/:semesterId/:courseId" element={<PrivateRoute><ModuleOutlinePage /></PrivateRoute>} />
        
        {/* Redirect undefined routes to dashboard (if authenticated) or login (if not) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

