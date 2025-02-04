import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'

export const signup = async (req,res) => {
 
    try {
        const {fullname,username,email,password} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}
        const existingUser = await User.findOne({username})
        if (existingUser) {
			return res.status(400).json({ error: "username already exists" });
		}
        const existingEmail = await User.findOne({email})
        if (existingEmail) {
			return res.status(400).json({ error: "email id already exists" });
		}

        if(password.length < 6) {
          return  res.status(400).json("password must be 6 character or more")
        }

        //hash password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id,res)
            await newUser.save()
            res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullname,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
        }
        else{
            res.status(400).json({message:"invalid user data"})
        }

    } catch (error) {
        console.log("error in signup controller",error.message);
        res.status(500).json({error:error.message})
    }
    
}


export const login = async (req,res) => {
    try{
        const {username,password}= req.body
        const user = await User.findOne({username})
        const isPasswordCorrect = await bcrypt.compare(password,user?.password || '')

        if(!password || !isPasswordCorrect) {
            return res.status(400).json({message: "Invalid username or password"})
        }

        generateTokenAndSetCookie(user._id,res)
        res.status(201).json({
            _id: user._id,
            fullName: user.fullname,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });

    }
   catch (error) {
    console.log("error in login controller",error.message);
    res.status(500).json({error:error.message})
}

}

export const logout = async (req,res) => {
    
    try {
        res.cookie("jwt",{maxAge:0})
        res.status(200).json("Logout successfully")
        
    }   catch (error) {
        console.log("error in logout controller",error.message);
        res.status(500).json({error:error.message})
    }
}


export const getMe = async (req,res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json({user})
    } catch (error) {
        console.log("error in getme controller",error.message);
        res.status(500).json({error:error.message})
    }
}