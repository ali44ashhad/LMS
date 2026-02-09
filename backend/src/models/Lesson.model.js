import pool, { DB_SCHEMA } from '../config/pg-db.js';
import { transaction } from '../utils/db.js';

const LESSONS_TABLE = `${DB_SCHEMA}.lessons`;

class Lesson {
    // Create new lesson
    static async create(lessonData) {
        const { module_id, title, description, video_url, duration, order_num, resources } = lessonData;

        const result = await pool.query(
            `INSERT INTO ${LESSONS_TABLE} 
       (module_id, title, description, video_url, duration, order_num, resources)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                module_id,
                title,
                description || '',
                video_url || '',
                duration || '',
                order_num,
                JSON.stringify(resources || [])
            ]
        );

        return result.rows[0];
    }

    // Find all lessons for a module (ordered)
    static async findByModuleId(moduleId) {
        const result = await pool.query(
            `SELECT * FROM ${LESSONS_TABLE} 
       WHERE module_id = $1 
       ORDER BY order_num ASC`,
            [moduleId]
        );
        return result.rows;
    }

    // Find lesson by ID
    static async findById(id) {
        const result = await pool.query(
            `SELECT * FROM ${LESSONS_TABLE} WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Update lesson
    static async update(id, updates) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        // Handle standard fields
        const standardFields = ['title', 'description', 'video_url', 'duration', 'resources'];

        standardFields.forEach(field => {
            if (updates[field] !== undefined) {
                if (field === 'resources') {
                    fields.push(`${field} = $${paramCount}`);
                    values.push(JSON.stringify(updates[field]));
                } else {
                    fields.push(`${field} = $${paramCount}`);
                    values.push(updates[field]);
                }
                paramCount++;
            }
        });

        if (fields.length === 0) return null;

        values.push(id);

        const result = await pool.query(
            `UPDATE ${LESSONS_TABLE} 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Delete lesson
    static async delete(id) {
        await pool.query(
            `DELETE FROM ${LESSONS_TABLE} WHERE id = $1`,
            [id]
        );
    }

    // Reorder lessons
    static async reorder(moduleId, lessonsOrder) {
        // lessonsOrder is array of { id, order }
        // Use two-phase update to avoid unique constraint violations:
        // Phase 1: Set all to temporary negative values
        // Phase 2: Set to final positive values
        return await transaction(async (client) => {
            // Phase 1: Set temporary negative order values to avoid conflicts
            for (let i = 0; i < lessonsOrder.length; i++) {
                const item = lessonsOrder[i];
                await client.query(
                    `UPDATE ${LESSONS_TABLE} 
                     SET order_num = $1 
                     WHERE id = $2 AND module_id = $3`,
                    [-(i + 1), item.id, moduleId]
                );
            }

            // Phase 2: Set final order values
            const results = [];
            for (const item of lessonsOrder) {
                const result = await client.query(
                    `UPDATE ${LESSONS_TABLE} 
                     SET order_num = $1 
                     WHERE id = $2 AND module_id = $3
                     RETURNING *`,
                    [item.order, item.id, moduleId]
                );
                if (result.rows[0]) {
                    results.push(result.rows[0]);
                }
            }
            return results;
        });
    }
}

export default Lesson;
