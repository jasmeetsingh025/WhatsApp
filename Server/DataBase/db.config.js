import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB}/chatApp`, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("MongoDB connected using mongoose");
  } catch (err) {
    console.log(err);
  }
};
