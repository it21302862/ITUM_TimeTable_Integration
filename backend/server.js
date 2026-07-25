import "dotenv/config";
import { listen } from "./app.js";
import { sequelize } from "./models/index.js";

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});