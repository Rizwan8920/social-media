import Post from '../models/Post';
import Comment from '../models/Comment.js';
import asyncHandler from '../middleware/asyncHandler.js';

// GET /api/posts?page=1&limit=10
export const getPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find()
        .sort({createdAt: -1})
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username avatar')
        .populate({
            path: 'comments',
            populate: {path: 'author', select: 'username avatar'}
        })
    
    res.json(posts);
})


// POST //api/posts
export const createPost = asyncHandler(async (req, res) => {
    const post = await Post.create({
        author: req.user.id,
        text: req.body.text,
        image: req.body.image || null,
    });
    const populated = await post.populate('author', 'username avatar');
    res.status(201).json(populated);
})

// PUT /api/posts/:id/like
export const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(400).json({message: 'Post not found'});

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if(alreadyLiked){
        post.likes = post.likes.filter((id) => id.toString() !== userId);
    }else{
        post.likes.push(userId);
    }

    await post.save();
    res.json({likes: post.likes});
})

// DELETE /api/post/:id
export const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({message: 'Post not found'});
    if(post.author.toString() !== req.user.id){
        return res.status(403).json({message: 'Not authorized'});
    }
    await Comment.deleteMany({post: post._id});
    await post.deleteOne();
    res.json({message: 'Post deleted'});
})

// POST /api/posts/:id/comments
export const addComment = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({message: 'Post not found'});

    const comment = await Comment.create({
        post: post._id,
        author: req.user.id,
        text: req.body.text,
    })

    post.comments.push(comment._id);
    await post.save();

    const populated = await comment.populate('author', 'username, avatar');
    res.status(201).json(populated);
})

// DELETE /api/comments/:id
export const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if(!comment) return res.status(404).json({message: 'Comment not found'});
    if(comment.author.toString() !== req.user.id){
        return res.status(403).json({message: 'Not authorized'});
    }
    await Post.findByIdAndUpdate(comment.post, {$pull: {comments: comment._id}})
    await comment.deleteOne();
    res.json({message: 'Comment deleted', postId: comment.post});
})