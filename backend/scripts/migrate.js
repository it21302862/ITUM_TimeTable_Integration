import sequelize from "../config/database.config.js";
import { DataTypes } from "sequelize";

async function migrateInstructorPassword() {
  try {
    console.log("🔄 Starting migration...");

    // Add password column if it doesn't exist
    const Instructor = sequelize.define("Instructor", {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      department: DataTypes.STRING,
      address: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("MODULE_LEADER", "SUPPORTIVE_INSTRUCTOR", "REGULAR"),
        defaultValue: "REGULAR",
        allowNull: false,
      },
    });

    // Sync database with model (adds missing columns)
    await sequelize.sync({ alter: true });

    console.log("✅ Migration completed successfully!");
    console.log("📝 Next step: Add passwords to existing instructors");
    console.log("   Run: node backend/scripts/addPasswordsToInstructors.js");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrateInstructorPassword();
