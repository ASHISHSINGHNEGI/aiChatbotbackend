import app from "./app.js";
import dotenv from "dotenv";
import { connect } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
try {
  await connect();
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${
        process.env.NODE_ENV || "development"
      } mode on port ${PORT}`
    );
  });
} catch (error) {}
