import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserProfile, toggleFollow, updateProfile } from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { updateProfileSchema } from "../validators/userValidators.js";


const router = express.Router();

router.get('/:id', protect, getUserProfile);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.put('/:id/follow', protect, toggleFollow);

export default router;