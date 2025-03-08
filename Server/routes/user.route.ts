import express from "express";
import { 
    loginUser,
    logoutUser,
    registerUser,
    updateAccessToken,
    getUserInfo,
    updateUserInfo,
    updatePassword,
    getAllUsers,
    updateUserRole,
    deleteUser
} from "../controllers/user.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";

const router = express.Router();

// Authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logoutUser);
router.get("/refresh-token", updateAccessToken);

// User routes
router.get("/me", isAuthenticated, getUserInfo);
router.put("/update-info", isAuthenticated, updateUserInfo);
router.put("/update-password", isAuthenticated, updatePassword);

// Admin routes
router.get("/admin/users", isAuthenticated, authorizeRoles("admin"), getAllUsers);
router.put("/admin/user/:id", isAuthenticated, authorizeRoles("admin"), updateUserRole);
router.delete("/admin/user/:id", isAuthenticated, authorizeRoles("admin"), deleteUser);

export default router;
