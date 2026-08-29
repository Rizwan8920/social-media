import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { addComment, createPost, deleteComment, deletePost, getPosts, toggleLike } from '../controllers/postController';

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);
router.post('/:id/comments', protect, addComment);
router.delete('/comments/:id', protect, deleteComment);

export default router;
