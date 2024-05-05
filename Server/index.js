import dotenv from "dotenv";
dotenv.config();
import { connectToDatabase } from "./DataBase/db.config.js";
import { server } from "./server.js";
server.listen(8000, () => {
  console.log("Listening on port 8000");
  connectToDatabase();
});
