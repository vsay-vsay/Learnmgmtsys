import { Request, Response, NextFunction } from "express";
import cloudinary from "cloudinary";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import Course from "../models/course.model";
import fs from 'fs';

interface MulterFile {
    [fieldname: string]: Express.Multer.File[];
}

// Create course
export const createCourse = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const files = req.files as MulterFile;

        // Handle thumbnail upload
        if (files?.thumbnail) {
            const thumbnail = files.thumbnail[0];
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail.path, {
                folder: "courses/thumbnails"
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            };

            // Delete local file
            fs.unlinkSync(thumbnail.path);
        }

        // Handle video upload
        if (files?.video) {
            const video = files.video[0];
            data.videoUrl = `/uploads/${video.filename}`;
        }

        // Add tutor info
        data.tutor = {
            _id: req.user._id,
            name: req.user.name
        };

        const course = await Course.create(data);

        res.status(201).json({
            success: true,
            course
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Get all courses
export const getAllCourses = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            courses
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Get course details by ID
export const getCourseDetails = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        
        // Try to get from cache
        const cachedCourse = await redis.get(courseId);
        
        if (cachedCourse) {
            return res.status(200).json({
                success: true,
                course: JSON.parse(cachedCourse)
            });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        // Set cache
        await redis.set(courseId, JSON.stringify(course), 'EX', 604800); // 7 days

        res.status(200).json({
            success: true,
            course
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Search courses
export const searchCourses = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            keyword,
            category,
            level,
            tags,
            price,
            ratings,
            sort = "newest",
            page = 1,
            limit = 10
        } = req.query;

        const query: any = {};

        // Search by keyword
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { tags: { $in: [new RegExp(keyword as string, "i")] } }
            ];
        }

        // Filters
        if (category) query.category = category;
        if (level) query.level = level;
        if (tags) query.tags = { $in: (tags as string).split(",") };
        if (ratings) query.ratings = { $gte: Number(ratings) };
        
        if (price) {
            const [min, max] = (price as string).split("-").map(Number);
            query.price = { $gte: min, $lte: max };
        }

        // Sorting
        let sortOptions: any = { createdAt: -1 };
        
        switch (sort) {
            case "price-low":
                sortOptions = { price: 1 };
                break;
            case "price-high":
                sortOptions = { price: -1 };
                break;
            case "ratings":
                sortOptions = { ratings: -1 };
                break;
            case "popular":
                sortOptions = { purchased: -1 };
                break;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const courses = await Course.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            courses,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Get tutor courses
export const getTutorCourses = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await Course.find({ "tutor._id": req.user._id });
        
        res.status(200).json({
            success: true,
            courses
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Delete course
export const deleteCourse = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        // Check if user is tutor of the course
        if (course.tutor._id.toString() !== req.user._id.toString()) {
            return next(new ErrorHandler("Unauthorized", 403));
        }

        // Delete thumbnail from cloudinary
        if (course.thumbnail?.public_id) {
            await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
        }

        await course.deleteOne();
        await redis.del(id);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});