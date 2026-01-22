export default (sequelize, DataTypes) => {
  return sequelize.define("SemesterEvent", {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    eventType: {
      type: DataTypes.ENUM("EXAM", "LAB", "HOLIDAY", "MILESTONE"),
    },
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  });
};
