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
        process.env.NODE_ENV || "dev"
      } mode on port ${PORT}`
    );
   
  });
} catch (error) {
  console.log(error);
}
