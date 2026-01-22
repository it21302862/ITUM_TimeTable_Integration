import "dotenv/config";
import { listen } from "./app.js";
import { sequelize } from "./models/index.js";

sequelize.sync({ alter: true }).then(() => {
  listen(5000, () =>
    console.log("Server running on port 5000")
  );
});
