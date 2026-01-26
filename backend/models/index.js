import sequelize from "../config/database.config.js";
import { DataTypes } from "sequelize";

import AcademicYearModel from "./AcademicYear.js";
import SemesterModel from "./Semester.js";
import CourseModel from "./Course.js";
import InstructorModel from "./Instructor.js";
import LectureHallModel from "./LectureHall.js";
import TimetableSlotModel from "./TimetableSlot.js";
import SemesterEventModel from "./SemesterEvent.js";
import ModuleOutlineModel from "./ModuleOutline.js";

const AcademicYear = AcademicYearModel(sequelize, DataTypes);
const Semester = SemesterModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Instructor = InstructorModel(sequelize, DataTypes);
const LectureHall = LectureHallModel(sequelize, DataTypes);
const TimetableSlot = TimetableSlotModel(sequelize, DataTypes);
const SemesterEvent = SemesterEventModel(sequelize, DataTypes);
const ModuleOutline = ModuleOutlineModel(sequelize, DataTypes);

// Relations
AcademicYear.hasMany(Semester);
Semester.belongsTo(AcademicYear);

Semester.hasMany(TimetableSlot);
TimetableSlot.belongsTo(Semester);

Semester.hasMany(SemesterEvent);
SemesterEvent.belongsTo(Semester);

Course.hasMany(TimetableSlot);
TimetableSlot.belongsTo(Course);

TimetableSlot.belongsTo(Instructor);
Instructor.hasMany(TimetableSlot);

TimetableSlot.belongsTo(LectureHall);
LectureHall.hasMany(TimetableSlot);

Course.belongsTo(Instructor, {
  as: "assignedInstructor",
  foreignKey: "assignedInstructorId"
});

Course.belongsTo(Instructor, {
  as: "moduleLeader",
  foreignKey: "moduleLeaderId"
});

Course.belongsTo(Instructor, {
  as: "moduleCoordinator",
  foreignKey: "moduleCoordinatorId"
});

// Course belongs to Semester and AcademicYear (optional associations)
Course.belongsTo(Semester, { foreignKey: "SemesterId" });
Semester.hasMany(Course, { foreignKey: "SemesterId" });

Course.belongsTo(AcademicYear, { foreignKey: "AcademicYearId" });
AcademicYear.hasMany(Course, { foreignKey: "AcademicYearId" });

// ModuleOutline relations
Course.hasOne(ModuleOutline, { foreignKey: "courseId" });
ModuleOutline.belongsTo(Course, { foreignKey: "courseId" });

export {
  sequelize,
  AcademicYear,
  Semester,
  Course,
  Instructor,
  LectureHall,
  TimetableSlot,
  SemesterEvent,
  ModuleOutline,
};
