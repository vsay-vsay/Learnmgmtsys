import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

// Authenticated user interface
export interface IAuthRequest extends Request {
            user?: any;
        }
// Authenticate user
export const isAuthenticated = catchAsyncErrors(async (req: IAuthRequest, res: Response, next: NextFunction) => {
        const access_token = req.cookies.access_token;

        if (!access_token) {
            return next(new ErrorHandler("Please login to access this resource", 401));
        }

        const decoded = jwt.verify(access_token, process.env.JWT_SECRET as string) as JwtPayload;

        if (!decoded) {
            return next(new ErrorHandler("Access token is not valid", 401));
        }

        const user = await redis.get(decoded.id);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        req.user = JSON.parse(user);
        next();
});

// Validate user role
export const authorizeRoles = (...roles: string[]) => {
    return (req: IAuthRequest, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role (${req.user?.role}) is not allowed to access this resource`, 403));
        }
        next();
    };
};

// Authorize tutor
export const authorizeTutor = (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'tutor' && req.user?.role !== 'admin') {
        return next(new ErrorHandler('Only tutors and admins can access this resource', 403));
    }
    next();
};