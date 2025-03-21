### **LMS API Documentation - Summary**

This documentation outlines the API endpoints for a **Learning Management System (LMS)**, structured to manage users, courses, and roles within the system. Below is a summary of the key functionalities:

---

### **1. Authentication APIs**

- **Register User** (`POST /register`): Allows users to register with name, email, password, and role.
- **Login** (`POST /login`): Allows users to log in and receive a JWT token.
- **Logout** (`GET /logout`): Allows users to log out by invalidating their JWT token.

---

### **2. Course Management APIs**

- **Create Course** (`POST /course/create`): Allows tutors/admins to create new courses with details like title, description, price, and media.
- **Get All Courses** (`GET /courses`): Retrieves a list of all courses with optional pagination.
- **Get Course Details** (`GET /course/:id`): Fetches detailed information about a specific course.
- **Search Courses** (`GET /courses/search`): Allows filtering and searching courses based on various parameters (e.g., keyword, price, tags, etc.).
- **Delete Course** (`DELETE /course/:id`): Allows tutors/admins to delete a course.

---

### **3. User Management APIs**

- **Get User Profile** (`GET /me`): Fetches the current user's profile information.
- **Update User Info** (`PUT /update`): Allows users to update their name and email.
- **Update Password** (`PUT /update-password`): Allows users to update their password.

---

### **4. Admin APIs**

- **Get All Users** (`GET /admin/users`): Allows admins to view a list of all users.
- **Update User Role** (`PUT /admin/user/:id/role`): Admins can update the role of a user (e.g., make them a tutor).
- **Delete User** (`DELETE /admin/user/:id`): Admins can delete a user from the system.

---

### **Authentication & Access Control**
- **JWT Token**: Most endpoints require authentication via JWT tokens passed in the Authorization header.
- **Roles**: There are three roles—**Admin**, **Tutor**, and **User**—with different levels of access to the system.

---

### **Additional Features**
- **Pagination**: Many endpoints support pagination with default values of page `1` and limit `10`, with a maximum limit of `100`.
- **File Uploads**: Courses allow file uploads for video (MP4/WebM, max 100MB) and thumbnails (JPG/PNG, max 5MB).

This API structure is designed to manage user registration, course creation, and user roles efficiently while ensuring secure and role-based access control.
