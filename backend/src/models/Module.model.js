import { query, table, transaction } from '../utils/db.js';

class Module {
    // Create new module
    static async create(moduleData) {
        const { course_id, title, description, order_num } = moduleData;

        const result = await query(
            `INSERT INTO ${table('modules')} 
       (course_id, title, description, order_num)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [course_id, title, description || '', order_num]
        );

        return result.rows[0];
    }

    // Find all modules for a course (ordered)
    static async findByCourseId(courseId) {
        const result = await query(
            `SELECT * FROM ${table('modules')} 
       WHERE course_id = $1 
       ORDER BY order_num ASC`,
            [courseId]
        );
        return result.rows;
    }

    // Find module by ID
    static async findById(id) {
        const result = await query(
            `SELECT * FROM ${table('modules')} WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Update module
    static async update(id, updates) {
        const { title, description } = updates;

        const result = await query(
            `UPDATE ${table('modules')} 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
            [title, description, id]
        );

        return result.rows[0];
    }

    // Delete module (cascades to lessons)
    static async delete(id) {
        await query(
            `DELETE FROM ${table('modules')} WHERE id = $1`,
            [id]
        );
    }

    // Reorder modules
    static async reorder(courseId, modulesOrder) {
        // modulesOrder is array of { id, order }
        // Use two-phase update to avoid unique constraint violations:
        // Phase 1: Set all to temporary negative values
        // Phase 2: Set to final positive values
        return await transaction(async (client) => {
            // Phase 1: Set temporary negative order values to avoid conflicts
            for (let i = 0; i < modulesOrder.length; i++) {
                const item = modulesOrder[i];
                await client.query(
                    `UPDATE ${table('modules')} 
                     SET order_num = $1 
                     WHERE id = $2 AND course_id = $3`,
                    [-(i + 1), item.id, courseId]
                );
            }

            // Phase 2: Set final order values
            const results = [];
            for (const item of modulesOrder) {
                const result = await client.query(
                    `UPDATE ${table('modules')} 
                     SET order_num = $1 
                     WHERE id = $2 AND course_id = $3
                     RETURNING *`,
                    [item.order, item.id, courseId]
                );
                if (result.rows[0]) {
                    results.push(result.rows[0]);
                }
            }
            return results;
        });
    }
}

export default Module;
