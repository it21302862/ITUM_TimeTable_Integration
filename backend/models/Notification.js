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
      type: DataTypes.ENUM(
        "ASSIGNMENT_NOTE",
        "ASSIGNMENT_ACCEPTED",
        "ASSIGNMENT_REJECTED",
        "SYSTEM"
      ),
      defaultValue: "ASSIGNMENT_NOTE",
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACCEPTED", "REJECTED"),
      defaultValue: "PENDING",
    },
    sessionDetails: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    timetableSlotId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    relatedNotificationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
};
