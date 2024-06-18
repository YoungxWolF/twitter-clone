import express from 'express'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import dotenv from 'dotenv'
import connectMongodb from './db/connectMongodb.js'
import cookieParser from 'cookie-parser'
import {v2 as cloudinary} from 'cloudinary'

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const app = express()
app.use(express.json({limit:"5mb"}))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
const PORT = process.env.PORT || 5000

app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/posts",postRoutes)
app.use("/api/notifications", notificationRoutes)

app.listen(PORT,()=>{
    connectMongodb()
    console.log("server running on port:",PORT);
    
})