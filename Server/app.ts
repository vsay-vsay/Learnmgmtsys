import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
export const app = express();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors
app.use(cors({
    origin: process.env.ORIGIN || "http://localhost:3000",
    credentials: true
}));
// routes
app.use("/api/v1", userRouter);

// testing route
app.get("/test", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

// unknown route handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

// error middleware
app.use(ErrorMiddleware);

export default app;