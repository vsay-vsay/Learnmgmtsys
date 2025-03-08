import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { catchAsyncErrors } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

// Extend Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// Authenticated user
export const isAuthenticated = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 401));
    }
});

// Validate user role
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role (${req.user?.role}) is not allowed to access this resource`, 403));
        }
        next();
    };
};
