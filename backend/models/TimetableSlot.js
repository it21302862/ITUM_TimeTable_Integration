export default (sequelize, DataTypes) => {
  return sequelize.define("TimetableSlot", {
    dayOfWeek: {
      type: DataTypes.ENUM(
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY"
      ),
      allowNull: false
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },

    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },

    sessionType: {
      type: DataTypes.ENUM(
        "LECTURE",
        "PRACTICAL",
        "TUTORIAL",
        "EXAM"
      ),
      allowNull: false
    },

    SemesterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    CourseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    InstructorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    LectureHallId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
};
