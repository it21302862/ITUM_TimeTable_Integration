import sequelize from "../config/database.config.js";
import { DataTypes } from "sequelize";

import AcademicYearModel from "./AcademicYear.js";
import SemesterModel from "./Semester.js";
import CourseModel from "./Course.js";
import InstructorModel from "./Instructor.js";
import LectureHallModel from "./LectureHall.js";
import TimetableSlotModel from "./TimetableSlot.js";
import SemesterEventModel from "./SemesterEvent.js";

const AcademicYear = AcademicYearModel(sequelize, DataTypes);
const Semester = SemesterModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Instructor = InstructorModel(sequelize, DataTypes);
const LectureHall = LectureHallModel(sequelize, DataTypes);
const TimetableSlot = TimetableSlotModel(sequelize, DataTypes);
const SemesterEvent = SemesterEventModel(sequelize, DataTypes);

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

export {
  sequelize,
  AcademicYear,
  Semester,
  Course,
  Instructor,
  LectureHall,
  TimetableSlot,
  SemesterEvent,
};
