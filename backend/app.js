import express, { json } from "express";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import academicYearRoutes from "./routes/academicYear.routes.js";
import semesterRoutes from "./routes/semester.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import semesterPlanRoutes from "./routes/semesterPlan.routes.js";
import courseRoutes from "./routes/course.routes.js";
import lectureHallRoutes from "./routes/lectureHall.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import moduleOutlineRoutes from "./routes/moduleOutline.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",                 // Local Vite
  "https://itum-uni-time-manager.vercel.app", // deployed frontend
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman and server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(json());

// Serve uploaded files
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

app.use("/api/auth", authRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/semester-plan", semesterPlanRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lecture-halls", lectureHallRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/module-outlines", moduleOutlineRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Express error:", err);

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON payload",
    });
  }

  res.status(err?.status || 500).json({
    error: err?.message || "Internal Server Error",
  });
});

export const listen = (port, callback) => {
  app.listen(port, callback);
};

export default app;