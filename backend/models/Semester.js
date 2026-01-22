export default (sequelize, DataTypes) => {
  return sequelize.define("Semester", {
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM("CURRENT", "PAST", "DRAFT"),
    },
  });
};
