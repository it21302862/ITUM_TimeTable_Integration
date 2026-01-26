export default (sequelize, DataTypes) => {
  return sequelize.define("ModuleOutline", {
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Courses",
        key: "id"
      }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    outcomes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },

    weeklyTopics: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },

    assessments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },

    bibliography: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    contentQuality: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Medium"
    }
  });
};
