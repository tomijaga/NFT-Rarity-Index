import mongoose from "mongoose";

async function connectDB() {
  // check if we have a connection to the database or if it's currently
  // connecting or disconnecting (readyState 1, 2 and 3)
  console.log(mongoose.connection?.readyState);
  if (mongoose.connection?.readyState >= 1) {
    return;
  }

  await mongoose.connect(process.env.MONGO_URI!);
  console.log(mongoose.connection.readyState);

  console.log("DB Connection Successful");
  return;
}

export default connectDB;
