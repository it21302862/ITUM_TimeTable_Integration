export default (sequelize, DataTypes) => {
  return sequelize.define("Course", {
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    credit: DataTypes.INTEGER,
  });
};
