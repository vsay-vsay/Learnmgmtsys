import express from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    getUserInfo,
    updateUserInfo,
    updatePassword,
    updateAccessToken,
    getAllUsers,
    updateUserRole,
    deleteUser
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getUserInfo);
router.put("/update", isAuthenticated, updateUserInfo);
router.put("/update-password", isAuthenticated, updatePassword);
router.get("/refresh", updateAccessToken);
// Admin routes
router.get("/admin/users", isAuthenticated, authorizeRoles("admin"), getAllUsers);
router.put("/admin/user/:id/role", isAuthenticated, authorizeRoles("admin"), updateUserRole);
router.delete("/admin/user/:id", isAuthenticated, authorizeRoles("admin"), deleteUser);

export default router;
