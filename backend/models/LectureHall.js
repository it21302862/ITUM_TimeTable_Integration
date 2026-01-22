export default (sequelize, DataTypes) => {
  return sequelize.define("LectureHall", {
    name: DataTypes.STRING,
    building: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
  });
};
