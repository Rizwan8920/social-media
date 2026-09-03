import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

// GET /api/users/:id
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('username email avatar bio followers following createdAt');

    if(!user){
        res.status(400);
        throw new Error('User not found');
    }

    const posts = await Post.find({author: user._id})
        .sort({createdAt: -1})
        .populate('author', 'username avatar');

    res.json({user, posts});
})

// PUT /api/users/me
export const updateProfile = asyncHandler(async (req, res) => {
    const {bio, avatar} = req.body;

    const user = await User.findById(req.user.id);
    if(!user){
        res.status(400);
        throw new Error('User not found');
    }

    if(bio !== undefined) user.bio = bio;
    if(avatar !== undefined) user.avatar = avatar;

    const updated = await user.save();
    res.json({
        id: updated._id,
        username: updated.username,
        email: updated.email,
        avatar: updated.avatar,
        bio: updated.bio,
    })
})

// PUT /api/users/:id/follow
export const toggleFollow = asyncHandler(async (req, res) => {
    const targetId = req.params.id;
    const currentUserId = req.user.id;

    if(targetId == currentUserId){
        res.status(400);
        throw new Error("You can't follow yourself");
    }

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(currentUserId);

    if(!targetUser){
        res.status(404);
        throw new Error('User not found');
    }

    const isFollowing = targetUser.followers.some((id) => id.toString() === currentUserId);

    if(isFollowing){
        targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId);
        currentUser.following = currentUser.following.filter((id) => id.toString() !== targetId);
    }else{
        targetUser.followers.push(currentUserId);
        targetUser.following.push(targetId);
    }

    await targetUser.save();
    await currentUser.save();

    res.json({
        following: !isFollowing,
        followersCount: targetUser.followers.length,
    });
})