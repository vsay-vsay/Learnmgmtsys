import express from 'express';
import { loginUser } from '../controllers/user.controller';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors';
const router = express.Router();

router.post('/login', catchAsyncErrors(loginUser));
export default router;
