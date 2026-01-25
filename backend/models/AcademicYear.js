export default (sequelize, DataTypes) => {
  return sequelize.define("AcademicYear", {
    yearLabel: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    status: {
      type: DataTypes.ENUM("PAST", "ACTIVE", "DRAFT"),
      defaultValue: "DRAFT",
    },
  });
};
