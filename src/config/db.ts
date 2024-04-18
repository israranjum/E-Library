import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log(`MongoDB Connected successfully`);
        })

        mongoose.connection.on("error", (error) => {
            console.log("Error in connecting to database ", error);
        })
        const conn = await mongoose.connect(config.dataBaseUrl as string);
        
    } catch (error) {
        console.log("Connection Failed ", error);
        process.exit(1);
    }
}

export default connectDB