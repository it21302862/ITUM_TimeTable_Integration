import sequelize from "../config/database.config.js";
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

const InstructorModel = (sequelize, DataTypes) =>
  sequelize.define("Instructor", {
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

const Instructor = InstructorModel(sequelize, DataTypes);

async function addPasswordsToInstructors() {
  try {
    console.log("🔄 Adding default passwords to instructors...\n");

    const instructors = await Instructor.findAll();

    if (instructors.length === 0) {
      console.log("⚠️  No instructors found in database");
      process.exit(0);
    }

    let updated = 0;

    for (let instructor of instructors) {
      if (!instructor.password) {
        // Generate default password: firstname123
        const firstName = instructor.name.split(" ")[0].toLowerCase();
        const defaultPassword = `${firstName}123`;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await instructor.update({ password: hashedPassword });
        updated++;

        console.log(`✅ ${instructor.email}`);
        console.log(`   Default password: ${defaultPassword}`);
        console.log(`   ⚠️  Instructor should change this on first login\n`);
      } else {
        console.log(`⏭️  ${instructor.email} (already has password)\n`);
      }
    }

    console.log(`\n✨ Done! Updated ${updated} instructor(s) with default passwords`);
    console.log("📝 Instructors should change their passwords on first login");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addPasswordsToInstructors();
