import mongoose from "mongoose";
import firebase, { initializeApp, getApps } from "firebase/app";

export async function connectMongoDB() {
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

export async function callMongoBackupDB(callback: () => Promise<void>) {
  // disconnect from main db
  await mongoose.connection.close();

  await mongoose.connect(process.env.BACKUP_MONGO_URI!);
  console.log(mongoose.connection.readyState);
  await Promise.resolve(callback());

  console.log("Backup DB Successfully called");

  // disconnect from backup db
  await mongoose.connection.close();
}

export const connectFirebaseDB = () => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "tradingrecord-efc44.firebaseapp.com",
    databaseURL: "https://tradingrecord-efc44.firebaseio.com",
    projectId: "tradingrecord-efc44",
    storageBucket: "tradingrecord-efc44.appspot.com",
    messagingSenderId: "693416869750",
    appId: "1:693416869750:web:ca4cf93d31e59586d48457",
  };

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
};
