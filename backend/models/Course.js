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
    
    SemesterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    AcademicYearId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
};
