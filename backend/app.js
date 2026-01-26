import express, { json } from "express";
import cors from "cors";
import academicYearRoutes from "./routes/academicYear.routes.js";
import semesterRoutes from "./routes/semester.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import semesterPlanRoutes from "./routes/semesterPlan.routes.js";
import courseRoutes from "./routes/course.routes.js";
import lectureHallRoutes from "./routes/lectureHall.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import moduleOutlineRoutes from "./routes/moduleOutline.routes.js";

const app = express();
app.use(cors());
app.use(json());

app.use("/api/academic-years", academicYearRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/semester-plan", semesterPlanRoutes);

app.use("/api/courses", courseRoutes);
app.use("/api/lecture-halls", lectureHallRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/module-outlines", moduleOutlineRoutes);


export const listen = (port, callback) => {
  app.listen(port, callback);
};

export default app;
