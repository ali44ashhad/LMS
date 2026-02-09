import pool, { DB_SCHEMA } from '../config/pg-db.js';

const ENROLLMENTS_TABLE = `${DB_SCHEMA}.enrollments`;
const COURSES_TABLE = `${DB_SCHEMA}.courses`;
const LESSONS_TABLE = `${DB_SCHEMA}.lessons`;
const MODULES_TABLE = `${DB_SCHEMA}.modules`;

class Enrollment {
  // Create enrollment
  static async create(studentId, courseId) {
    try {
      const result = await pool.query(
        `INSERT INTO ${ENROLLMENTS_TABLE} (student_id, course_id)
         VALUES ($1, $2)
         RETURNING *`,
        [studentId, courseId]
      );

      // Update enrolled_students count
      await pool.query(
        `UPDATE ${COURSES_TABLE} 
         SET enrolled_students = enrolled_students + 1 
         WHERE id = $1`,
        [courseId]
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Already enrolled in this course');
      }
      throw error;
    }
  }

  // Get user enrollments
  static async findByStudent(studentId) {
    const result = await pool.query(
      `SELECT e.*, 
              c.title as course_title, 
              c.instructor_name, 
              c.thumbnail,
              c.category,
              c.level
       FROM ${ENROLLMENTS_TABLE} e
       JOIN ${COURSES_TABLE} c ON e.course_id = c.id
       WHERE e.student_id = $1
       ORDER BY e.created_at DESC`,
      [studentId]
    );
    return result.rows;
  }

  // Get enrollment by ID
  static async findById(enrollmentId) {
    const result = await pool.query(
      `SELECT * FROM ${ENROLLMENTS_TABLE} WHERE id = $1`,
      [enrollmentId]
    );
    return result.rows[0] || null;
  }

  // Check if student is enrolled
  static async isEnrolled(studentId, courseId) {
    const result = await pool.query(
      `SELECT id FROM ${ENROLLMENTS_TABLE} 
       WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId]
    );
    return result.rows.length > 0;
  }

  // Update progress
  static async updateProgress(enrollmentId, completedLessonId) {
    const result = await pool.query(
      `UPDATE ${ENROLLMENTS_TABLE}
       SET completed_lessons = array_append(completed_lessons, $2),
           last_accessed = CURRENT_TIMESTAMP
       WHERE id = $1 AND NOT ($2 = ANY(completed_lessons))
       RETURNING *`,
      [enrollmentId, completedLessonId]
    );

    return result.rows[0];
  }

  // Calculate and update overall progress
  static async calculateProgress(enrollmentId, courseId) {
    // 1. Get total valid lessons count for the course
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM ${LESSONS_TABLE} l
       JOIN ${MODULES_TABLE} m ON l.module_id = m.id
       WHERE m.course_id = $1`,
      [courseId]
    );
    const total = parseInt(totalResult.rows[0].count);

    if (total === 0) {
      await pool.query(`UPDATE ${ENROLLMENTS_TABLE} SET progress = 0 WHERE id = $1`, [enrollmentId]);
      return 0;
    }

    // 2. Count COMPLETED lessons that are VALID (exist in the course's current lessons)
    // This handles cases where lessons were deleted or ids are stale from previous schema
    const completedResult = await pool.query(
      `SELECT COUNT(DISTINCT l.id) as count
       FROM ${ENROLLMENTS_TABLE} e
       CROSS JOIN UNNEST(e.completed_lessons) as completed_id
       JOIN ${LESSONS_TABLE} l ON l.id = completed_id
       JOIN ${MODULES_TABLE} m ON l.module_id = m.id
       WHERE e.id = $1 AND m.course_id = $2`,
      [enrollmentId, courseId]
    );

    const completed = parseInt(completedResult.rows[0].count);
    const progress = Math.round((completed / total) * 100);

    // 3. Update progress
    await pool.query(
      `UPDATE ${ENROLLMENTS_TABLE} SET progress = $1 WHERE id = $2`,
      [progress, enrollmentId]
    );

    return progress;
  }
}

export default Enrollment;
