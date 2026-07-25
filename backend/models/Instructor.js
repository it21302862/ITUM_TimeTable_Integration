export default (sequelize, DataTypes) => {
  return sequelize.define("Instructor", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    department: DataTypes.STRING,
    address: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM("MODULE_LEADER", "SUPPORTIVE_INSTRUCTOR", "REGULAR"),
      defaultValue: "REGULAR",
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }
    ,
    resetCode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    resetExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    }
    ,
    // Privacy settings
    showEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    showPhone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    shareSchedule: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  });
};
