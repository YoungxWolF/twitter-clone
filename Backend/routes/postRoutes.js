import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { commentPost, createPost, deletePost, getAllPost, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from '../controllers/postController.js'

const router = express.Router()

router.get("/all",protectRoute,getAllPost)
router.get("/likes/:id",protectRoute,getLikedPosts)
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create",protectRoute,createPost)
router.post("/like/:id",protectRoute,likeUnlikePost)
router.post("/comment/:id",protectRoute,commentPost)
router.delete("/:id",protectRoute,deletePost)


export default router