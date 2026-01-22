export default (sequelize, DataTypes) => {
  return sequelize.define("Instructor", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    department: DataTypes.STRING,
  });
};
