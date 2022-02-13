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

export const connectFirebaseDB = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyDhpt6yESxEdeWj-l7r_5XDcXWQZ98dh5w",
    authDomain: "tradingrecord-efc44.firebaseapp.com",
    databaseURL: "https://tradingrecord-efc44.firebaseio.com",
    projectId: "tradingrecord-efc44",
    storageBucket: "tradingrecord-efc44.appspot.com",
    messagingSenderId: "693416869750",
    appId: "1:693416869750:web:ca4cf93d31e59586d48457",
    measurementId: "G-NBKD5KJ4D0",
  };

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
};
