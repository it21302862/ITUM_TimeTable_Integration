export default (sequelize, DataTypes) => {
  return sequelize.define("Instructor", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    department: DataTypes.STRING,
    address: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM("MODULE_LEADER", "SUPPORTIVE_INSTRUCTOR", "REGULAR"),
      defaultValue: "REGULAR",
      allowNull: false
    }
  });
};
