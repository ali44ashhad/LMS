# LMS Backend API Documentation & Testing Guide

**Base URL:** `http://localhost:5006/api` (updated from 5005)

> [!IMPORTANT]
> **Authentication & SSO**
> The LMS backend relies on the **Nesta-toys-Backend** for user authentication.
> 1.  **Login** via Nesta Backend (`http://localhost:5010/api/auth/signin`) to get an `accessToken`.
> 2.  **Use Token**: Pass this token in the `Authorization` header for all protected LMS routes.
>     -   Header: `Authorization: Bearer <your_jwt_token>`

---

## 🔐 Authentication (`/api/auth`)

### 1. Validate Token (SSO Handshake)
Verifies the token is valid and returns the user's LMS profile.
- **URL:** `/api/auth/validate`
- **Method:** `GET`
- **Header:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student", // or "teacher", "admin"
      "avatar": "...",
      "bio": "..."
    }
  }
  ```

### 2. Logout
Clears the `accessToken` cookie (useful for frontend).
- **URL:** `/api/auth/logout`
- **Method:** `POST`

---

## 👤 User Profile (`/api/users`)

### 1. Get My Profile
- **URL:** `/api/users/profile`
- **Method:** `GET`
- **Header:** `Authorization: Bearer <token>`

### 2. Update Profile
Updates LMS-specific profile fields.
- **URL:** `/api/users/profile`
- **Method:** `PUT`
- **Header:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "bio": "I love learning about game dev!",
    "phone": "1234567890",
    "address": "123 Learning Lane",
    "avatar": "https://example.com/new-avatar.jpg"
  }
  ```

---

## 📚 Courses (`/api/courses`)

### 1. Get All Published Courses (Public)
- **URL:** `/api/courses`
- **Method:** `GET`
- **Auth:** Optional (Logged-in users might see enrollment status in future updates)

### 2. Get Course by ID (Public)
- **URL:** `/api/courses/:id`
- **Method:** `GET`
- **Auth:** Optional

### 3. Create Course (Instructor Only)
- **URL:** `/api/courses`
- **Method:** `POST`
- **Header:** `Authorization: Bearer <teacher_token>`
- **Body:**
  ```json
  {
    "title": "Advanced PostgreSQL Mastery",
    "description": "Deep dive into indexing and performance tuning.",
    "instructorName": "Dr. SQL", // Optional, defaults to 'Instructor'
    "category": "Development",
    "level": "Advanced",
    "duration": "5h 30m",
    "price": 0,
    "image": "https://example.com/pg-logo.png",
    "thumbnail": "https://example.com/pg-thumb.png",
    "learningOutcomes": ["Understand B-Trees", "Optimize Queries"],
    "prerequisites": ["Basic SQL knowledge"],
    "learningOutcomes": ["Understand B-Trees", "Optimize Queries"],
    "prerequisites": ["Basic SQL knowledge"]
    // Note: Content (Modules & Lessons) is now added via separate API calls after course creation
  }
  ```

### 4. Update Course (Instructor Only)
Can only update courses you own.
- **URL:** `/api/courses/:id`
- **Method:** `PUT`
- **Header:** `Authorization: Bearer <teacher_token>`
- **Body:** Same as Create Course (partial updates allowed).

### 5. Delete Course (Instructor Only)
Can only delete courses you own.
- **URL:** `/api/courses/:id`
- **Method:** `DELETE`
- **Header:** `Authorization: Bearer <teacher_token>`

### 6. Get My Created Courses (Instructor Only)
- **URL:** `/api/courses/instructor/my-courses`
- **Method:** `GET`
- **Header:** `Authorization: Bearer <teacher_token>`

---

## 📦 Modules (`/api/modules`)
**Instructor Only** - Requires `Authorization` header.

### 1. Create Module
- **URL:** `/api/modules`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "courseId": 1,
    "title": "Introduction to Database Internals",
    "description": "Understanding how data is stored on disk.",
    "order": 1
  }
  ```

### 2. Update Module
- **URL:** `/api/modules/:id`
- **Method:** `PUT`
- **Body:**
  ```json
  {
    "title": "New Title",
    "description": "New Description"
  }
  ```

### 3. Manage Order
- **URL:** `/api/modules/reorder/:courseId`
- **Method:** `PUT`
- **Body:**
  ```json
  {
    "modules": [
      { "id": 101, "order": 1 },
      { "id": 102, "order": 2 }
    ]
  }
  ```

### 4. Delete Module
- **URL:** `/api/modules/:id`
- **Method:** `DELETE`

---

## 📝 Lessons (`/api/lessons`)
**Instructor Only** - Requires `Authorization` header.

### 1. Create Lesson
- **URL:** `/api/lessons`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "moduleId": 101,
    "title": "Heap Files vs sequential files",
    "description": "Deep dive into storage engines",
    "videoUrl": "https://youtube.com/...",
    "duration": "10:30",
    "order": 1,
    "resources": [
      { "title": "Slides", "url": "https://cloudinary.com/..." }
    ]
  }
  ```

### 2. Update Lesson
- **URL:** `/api/lessons/:id`
- **Method:** `PUT`
- **Body:** `Same as Create (partial updates allowed)`

### 3. Manage Order
- **URL:** `/api/lessons/reorder/:moduleId`
- **Method:** `PUT`
- **Body:**
  ```json
  {
    "lessons": [
      { "id": 201, "order": 1 },
      { "id": 202, "order": 2 }
    ]
  }
  ```

### 4. Delete Lesson
- **URL:** `/api/lessons/:id`
- **Method:** `DELETE`

---

## 🎓 Enrollments (`/api/enrollments`)

### 1. Enroll in a Course (Student Only)
- **URL:** `/api/enrollments`
- **Method:** `POST`
- **Header:** `Authorization: Bearer <student_token>`
- **Body:**
  ```json
  {
    "courseId": 1 // ID of the course to enroll in
  }
  ```

### 2. Get My Enrollments
Returns all courses the student has enrolled in.
- **URL:** `/api/enrollments/my-enrollments`
- **Method:** `GET`
- **Header:** `Authorization: Bearer <student_token>`

### 3. Update Progress (Mark Lesson Complete)
- **URL:** `/api/enrollments/:id/progress`
- **Method:** `PATCH`
- **Header:** `Authorization: Bearer <student_token>`
- **Params:** `:id` is the **Enrollment ID** (not Course ID).
- **Body:**
  ```json
  {
    "lessonId": 201 // Integer ID of the completed lesson
  }
  ```
  > **Note:** Overall progress % is automatically recalculated based on the total lessons across all modules in the course.

---

## 🛡️ Admin (`/api/admin`)
Requires user with `role: 'admin'` (or `admin` in roles array).

### 1. Get Dashboard Stats
- **URL:** `/api/admin/stats`
- **Method:** `GET`

### 2. Manage Courses (Admin)
- **List All:** `GET /api/admin/courses`
- **Publish/Unpublish:** `PATCH /api/admin/courses/:id/publish`
  ```json
  { "isPublished": true }
  ```
- **Update Any Course:** `PUT /api/admin/courses/:id`
- **Delete Any Course:** `DELETE /api/admin/courses/:id`

### 3. Upload Resource (PDF)
Uploads a PDF to Cloudinary.
- **URL:** `/api/admin/upload`
- **Method:** `POST`
- **Body:** `multipart/form-data`
  - Key: `file` (Select a PDF file)

---

## 🧪 Postman Testing Setup

1.  **Environment Variables:**
    -   `baseUrl`: `http://localhost:5006`
    -   `nestaUrl`: `http://localhost:5010`
    -   `token`: `<paste_jwt_here>`

2.  **Getting a Token (Manual Step):**
    -   Make a request to **Nesta Backend**: `POST {{nestaUrl}}/api/auth/signin`
    -   Body: `{"username": "student_test", "password": "Test123!"}`
    -   Copy `accessToken` from response.

3.  **Authorization:**
    -   In Postman collection, set Authorization type to **Bearer Token**.
    -   Value: `{{token}}`.

## ⚠️ Common Errors
-   **401 Unauthorized:** Token missing or invalid.
-   **403 Forbidden:** You don't have the required role (e.g., Student trying to create a course).
-   **Role Issues:** Ensure the user in `nesta_local.users` has the correct `role` string (`student`, `teacher`, `admin`) AND the `roles` array (e.g., `["user", "teacher"]`).
