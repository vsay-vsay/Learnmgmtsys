import express from "express";
import { 
    createCourse,
    getAllCourses,
    getCourseDetails,
    searchCourses,
    getTutorCourses,
    deleteCourse
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { upload } from "../middleware/multer";

const router = express.Router();

// Public routes
router.get("/courses", getAllCourses);
router.get("/course/:id", getCourseDetails);
router.get("/courses/search", searchCourses);

// Protected routes
router.use(isAuthenticated);

// Tutor routes
router.post(
    "/course/create",
    isAuthenticated,
    authorizeRoles("tutor", "admin"),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    createCourse
);

router.get(
    "/tutor/courses",
    isAuthenticated,
    authorizeRoles("tutor", "admin"),
    getTutorCourses
);

router.delete(
    "/course/:id",
    isAuthenticated,
    authorizeRoles("tutor", "admin"),
    deleteCourse
);

export default router;