import mongoose from "mongoose";

const connectMongodb = async () => {
    try {
     const conn =   mongoose.connect(process.env.MONGO_URI)
     console.log("db connected");
    } catch (error) {
        console.log("db connection failed" , error.message);
        process.exit(1)
    }
}


export default connectMongodb