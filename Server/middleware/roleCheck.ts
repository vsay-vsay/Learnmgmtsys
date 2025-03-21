import { Request, Response, NextFunction } from 'express';

export const roleCheck = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role; // Assuming user role is stored in req.user

        if (userRole === role) {
            return next(); // User has the required role
        }

        return res.status(403).json({
            success: false,
            message: "Access denied. Insufficient permissions."
        });
    };
};
