export default (sequelize, DataTypes) => {
  return sequelize.define("Notification", {
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("ASSIGNMENT_NOTE", "SYSTEM"),
      defaultValue: "ASSIGNMENT_NOTE",
    },
    sessionDetails: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
};
