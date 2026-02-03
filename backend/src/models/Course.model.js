import { query, table, transaction } from '../utils/db.js';

class Course {
  // Create course (shell only)
  static async create(courseData) {
    const { prerequisites, learningOutcomes, ...courseFields } = courseData;

    const result = await query(
      `INSERT INTO ${table('courses')} 
       (title, description, instructor_id, instructor_name, category, level, duration, 
        image, thumbnail, price, syllabus, prerequisites, learning_outcomes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        courseFields.title,
        courseFields.description,
        courseFields.instructor_id,
        courseFields.instructor_name,
        courseFields.category,
        courseFields.level,
        courseFields.duration,
        courseFields.image || '📚',
        courseFields.thumbnail || '',
        courseFields.price || 0,
        courseFields.syllabus || '',
        prerequisites || [],
        learningOutcomes || []
      ]
    );

    return result.rows[0];
  }

  // Get all published courses
  static async findPublished() {
    const result = await query(
      `SELECT * FROM ${table('courses')} WHERE is_published = true ORDER BY created_at DESC`
    );
    return result.rows;
  }

  // Get all courses (for admin)
  static async findAll() {
    const result = await query(
      `SELECT * FROM ${table('courses')} ORDER BY created_at DESC`
    );
    return result.rows;
  }

  // Get courses by instructor
  static async findByInstructor(instructorId) {
    const result = await query(
      `SELECT * FROM ${table('courses')} WHERE instructor_id = $1 ORDER BY created_at DESC`,
      [instructorId]
    );
    return result.rows;
  }

  // Get course by ID with modules and lessons
  static async findByIdWithModules(courseId) {
    const courseResult = await query(
      `SELECT * FROM ${table('courses')} WHERE id = $1`,
      [courseId]
    );

    if (courseResult.rows.length === 0) return null;
    const course = courseResult.rows[0];

    // Fetch modules
    const modulesResult = await query(
      `SELECT * FROM ${table('modules')} WHERE course_id = $1 ORDER BY order_num`,
      [courseId]
    );
    const modules = modulesResult.rows;

    // Fetch lessons for all modules
    if (modules.length > 0) {
      const moduleIds = modules.map(m => m.id);
      const lessonsResult = await query(
        `SELECT * FROM ${table('lessons')} 
         WHERE module_id = ANY($1) 
         ORDER BY module_id, order_num`,
        [moduleIds]
      );
      const lessons = lessonsResult.rows;

      // Group lessons by module
      modules.forEach(module => {
        module.lessons = lessons.filter(l => l.module_id === module.id);
      });
    } else {
      // Fetch orphaned lessons (if any, though schema prevents this usually) or empty
      // In new schema, lessons must belong to a module.
    }

    return {
      ...course,
      modules: modules
    };
  }

  // Update course
  // Update course
  static async update(courseId, updates) {
    const { prerequisites, learningOutcomes, ...otherUpdates } = updates;

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(otherUpdates).forEach(key => {
      if (key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(otherUpdates[key]);
        paramCount++;
      }
    });

    // Add special handling for arrays
    if (prerequisites !== undefined) {
      fields.push(`prerequisites = $${paramCount}`);
      values.push(prerequisites);
      paramCount++;
    }

    if (learningOutcomes !== undefined) {
      fields.push(`learning_outcomes = $${paramCount}`);
      values.push(learningOutcomes);
      paramCount++;
    }

    values.push(courseId);

    const result = await query(
      `UPDATE ${table('courses')} SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Delete course (cascades to lessons via FK)
  static async delete(courseId) {
    await query(`DELETE FROM ${table('courses')} WHERE id = $1`, [courseId]);
  }
}

export default Course;
