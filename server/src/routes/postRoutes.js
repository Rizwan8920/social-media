import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addComment, createPost, deleteComment, deletePost, getPosts, toggleLike, uploadImage } from '../controllers/postController.js';
import { validate } from '../middleware/validate.js';
import { commentSchema, createPostSchema } from '../validators/postValidators.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/', protect, validate(createPostSchema), createPost);
router.put('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);
router.post('/:id/comments', protect, validate(commentSchema), addComment);
router.delete('/comments/:id', protect, deleteComment);
router.post('/upload', protect, upload.single('image'), uploadImage);

export default router;
