import Notification from "../models/notificationModel.js"
import Post from "../models/postModel.js"
import User from "../models/userModel.js"
import {v2 as cloudinary} from 'cloudinary'

export const createPost = async (req,res) => {
    try {
        const {text}  = req.body
        let {img}  = req.body
        const userId = req.user._id

        const user = await User.findById(userId)

        if(!user){
            return res.status(400).json({error:"User not found"})
        }

        if(!text && !img){
            return res.status(400).json({error:"text or image is required"})
        }

        if(img){
            const uploadedResponse = await  cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post(
           { user: userId,
            text,
            img}
        )

        await newPost.save()
        res.status(200).json(newPost)

    } catch (error) {

        res.status(500).json({error:"internal server error"})
        console.log("Error in create post controller:",error);
        
    }
}


export const deletePost = async (req,res) => {
    try {

        const post = await Post.findById(req.params.id)

        if(!post){
           return res.status(404).json({error: "Post not found"}) 
        }
        
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(404).json({error: "you cant delete this post"}) 
 
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json("post deleted successfully")
    } catch (error) {

        res.status(500).json({error:"internal server error"})
        console.log("Error in delete post controller:",error);
        
    }
}


export const commentPost = async (req,res) => {
    try {
        const {text} = req.body
        const postId = req.params.id
        const userId = req.user._id

        if(!text){
            return res.status(400).json({error: "text field is required"})
        }

        const post = await Post.findById(postId)

        if(!post){
            return res.status(400).json({error: "post not found"})

        }

        const comment = {user: userId, text}

        post.comment.push(comment)
        await post.save()
        const updatedComment = post.comment;

        res.status(200).json(updatedComment)

        
    } catch (error) {

        res.status(500).json({error:"internal server error"})
        console.log("Error in comment post controller:",error);
        
    }
}

export const likeUnlikePost = async(req,res) => {
    try {
        const {id:postId} = req.params
        const userId = req.user._id

        const post = await Post.findById(postId)

        if(!post) {
            return res.status(400).json({error: "post not found"})
        }
        
        const userlikedPost = post.likes.includes(userId)

        if(userlikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}


        
    } catch (error) {

        res.status(500).json({error:"internal server error"})
        console.log("Error in comment post controller:",error);
        
    }
}

export const getAllPost = async (req,res) => {
    try {

        const posts = await Post.find().sort({createdAt: -1}).populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path: "comment.user",
            select:"-password"
        })

        if(posts.length === 0 ){
            return res.status(400).json([])
        }
        
        res.status(200).json(posts)
    } catch (error) {

        res.status(500).json({error:"internal server error"})
        console.log("Error in get all post controller:",error);
        
    }
}



export const getLikedPosts = async (req,res) => {

    const userId = req.params.id

    try {

        const user = await User.findById(userId)

        if(!user){
            return res.status(400).json({error: "user not found"})
        }

        const likedPosts = await Post.find({_id:{$in: user.likedPosts}})
        .populate({
            path:"user",
            select:"-password"
        })
        
        res.status(200).json(likedPosts)
    }catch (error) {

        res.status(500).json({error:"internal server error"})
        console.log("Error in get liked post controller:",error);
        
    }
}


export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comment.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comment.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};