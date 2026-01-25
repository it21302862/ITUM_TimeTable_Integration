export default (sequelize, DataTypes) => {
  return sequelize.define("Course", {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    credit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    assignedInstructorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    moduleLeaderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    moduleCoordinatorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Link to Semester (optional - courses can be semester-specific)
    SemesterId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Link to Academic Year (optional - courses can be year-specific)
    AcademicYearId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });
};
