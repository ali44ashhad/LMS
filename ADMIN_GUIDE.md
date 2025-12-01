# Admin Panel Features Guide

## Admin Dashboard

### Statistics Overview
The admin dashboard displays:
- 👥 **Total Users** - Breakdown by Students/Teachers
- 📚 **Total Courses** - Published/Unpublished count
- 🎓 **Total Enrollments** - Recent enrollment trends
- 📝 **Total Assessments** - Assignments + Quizzes

### Quick Actions
- View All Users
- Manage Courses
- View Enrollments

## User Management

### Features
1. **View All Users**
   - List of all registered users
   - Filterable by role (Student, Teacher, Admin)
   - Searchable by name or email
   - Pagination support

2. **User Actions**
   - **Change Role** - Convert student to teacher or vice versa
   - **Activate/Deactivate** - Suspend user accounts
   - **Delete User** - Remove users from system
   - Real-time updates after each action

3. **User Information Display**
   - User avatar (initials)
   - Name and email
   - Current role with color-coded badge
   - Active/Inactive status
   - Join date

### Access Control
Only users with **Admin** role can:
- Access admin dashboard
- View user management page
- Modify user roles
- Activate/deactivate accounts
- Delete users (except themselves)

## Navigation

### Admin Menu Items
- 👨‍💼 Admin Dashboard
- 👥 User Management
- 📊 Student View (switch to student perspective)
- 📚 All Courses
- 👤 Profile

### Role-Specific Views
The sidebar automatically adjusts based on user role:
- **Admin** sees admin menu
- **Student** sees student menu (Dashboard, Courses, Assignments, etc.)
- **Teacher** sees teacher menu (same as student + creation tools)

## API Integration

All admin features are connected to backend APIs:

### User Management APIs
```javascript
// Get all users with filters
GET /api/admin/users?role=student&search=john&page=1&limit=10

// Update user
PUT /api/admin/users/:id
Body: { isActive: false, role: "teacher" }

// Delete user
DELETE /api/admin/users/:id

// Get system statistics
GET /api/admin/stats
```

### Response Format
```json
{
  "success": true,
  "users": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 45
}
```

## Security Features

1. **Authentication Required**
   - All admin routes require valid JWT token
   - Token checked on every request

2. **Role Verification**
   - Middleware verifies admin role
   - Non-admin users get 403 Forbidden

3. **Protected Actions**
   - Admins cannot delete themselves
   - Confirmation required for destructive actions

4. **Secure Data**
   - Passwords never returned in API responses
   - User tokens stored securely in localStorage

## Usage Examples

### Scenario 1: Converting Student to Teacher
1. Login as admin (admin@lms.com)
2. Navigate to User Management
3. Find the student user
4. Change role dropdown to "Teacher"
5. User can now create courses and grade assignments

### Scenario 2: Deactivating Problematic User
1. Go to User Management
2. Search for user by name/email
3. Click "Deactivate" button
4. User cannot login until reactivated

### Scenario 3: System Overview
1. Open Admin Dashboard
2. View total users, courses, enrollments
3. See recent enrollment trends
4. Quick access to user/course management

## Color Coding

### Role Badges
- 🟣 **Admin** - Purple background
- 🟢 **Teacher** - Green background
- 🔵 **Student** - Blue background

### Status Indicators
- 🟢 **Active** - Green badge
- 🔴 **Inactive** - Red badge

## Error Handling

The admin panel handles errors gracefully:
- Connection errors show error messages
- Failed operations display alerts
- Confirmation dialogs prevent accidents
- Loading states during API calls

## Responsive Design

The admin panel is fully responsive:
- ✅ Desktop - Full table view with all columns
- ✅ Tablet - Adjusted layout
- ✅ Mobile - Stacked cards view

## Best Practices

1. **Regular Monitoring**
   - Check admin dashboard for system health
   - Monitor enrollment trends
   - Review active user count

2. **User Management**
   - Verify users before role changes
   - Document reasons for deactivations
   - Regular cleanup of inactive accounts

3. **Security**
   - Change default admin password
   - Use strong JWT secrets in production
   - Regular backup of user data

## Future Enhancements

Potential additions to admin panel:
- 📊 Advanced analytics charts
- 📧 Bulk email to users
- 📈 Performance reports
- 🔍 Advanced search filters
- 📄 Export data to CSV/Excel
- 🔔 System notifications management
- 📝 Audit log of admin actions

---

**Admin Panel Status:** ✅ Fully Functional  
**Pages Created:** 2 (Dashboard, User Management)  
**API Endpoints:** 7  
**Security Level:** High (JWT + RBAC)
