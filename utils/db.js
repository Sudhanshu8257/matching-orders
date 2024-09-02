import mongoose from "mongoose";

const dbURL = "mongodb+srv://lohanajoy:OJznvGz4kdBf6nBn@cluster0.u5nbz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const data= await mongoose.connect(dbURL);
    console.log(
      `Database connection established with ${data?.connection?.host}! `
    );
  } catch (error) {
    console.log(
      `Error: Unable to connect to the database. ${error?.message}`
    );
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

/*
lohanajoy

*/