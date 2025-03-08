require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import cloudinary from "cloudinary";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import { sendMail } from "../utils/sendMail";
import {
    accessTokenOptions,
    refreshTokenOptions,
    sendToken,
} from "../utils/jwt";
import User from "../models/user.model";

// register user
export const registerUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

            const isEmailExist = await User.findOne({ email });
            if (isEmailExist) {
                return next(new ErrorHandler("Email already exists", 400));
            }

        const user = await User.create({
            name,
            email,
            password
        });
                res.status(201).json({
            success: true,
            user
        });
    } catch (error: any) {
                return next(new ErrorHandler(error.message, 400));
    }
});
// login user
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
        return next(new ErrorHandler(error.message, 500));
        }
});
// logout user
export const logoutUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.cookie("access_token", "", { maxAge: 1 });
            res.cookie("refresh_token", "", { maxAge: 1 });
        
        // Remove user from Redis
            const userId = req.user?._id || '';
        await redis.del(userId);

            res.status(200).json({
                success: true,
            message: "Logged out successfully"
            });
        } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
        }
});
// Other controller functions...
export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const updateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const socialAuth = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const updateUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const updateProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
};
