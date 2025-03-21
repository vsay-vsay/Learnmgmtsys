require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { sendToken } from "../utils/jwt";

// Register user
export const registerUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if role is valid
        if (role && !['admin', 'tutor', 'user'].includes(role)) {
            return next(new ErrorHandler("Invalid role", 400));
        }

        const isEmailExist = await User.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exists", 400));
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        sendToken(user, 201, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Login user
export const loginUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400));
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        sendToken(user, 200, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Logout user
export const logoutUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        const userId = req.user?._id || '';
        await redis.del(userId);
    res.status(200).json({
        success: true,
            message: "Logged out successfully"
    });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Get user info
export const getUserInfo = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const user = await User.findById(userId);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Update user info
export const updateUserInfo = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body;
        const userId = req.user?._id;
        
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();
        await redis.set(userId, JSON.stringify(user));

        res.status(200).json({
            success: true,
            user
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Update user password
export const updatePassword = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user?._id;

        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("Please enter old and new password", 400));
        }

        const user = await User.findById(userId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isPasswordMatched = await user.comparePassword(oldPassword);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Old password is incorrect", 400));
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Update access token
export const updateAccessToken = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) {
            return next(new ErrorHandler("Please login to access this resource", 401));
        }

        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        if (!decoded) {
            return next(new ErrorHandler("Invalid refresh token", 401));
        }

        const user = await redis.get(decoded.id);
        if (!user) {
            return next(new ErrorHandler("Please login to access this resource", 401));
        }

        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET as string, {
            expiresIn: "5m"
        });

        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({
            success: true,
            accessToken
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Admin: Get all users
export const getAllUsers = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Admin: Update user role
export const updateUserRole = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        if (!['admin', 'tutor', 'user'].includes(role)) {
            return next(new ErrorHandler("Invalid role", 400));
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        );

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Admin: Delete user
export const deleteUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        await user.deleteOne();
        await redis.del(id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});