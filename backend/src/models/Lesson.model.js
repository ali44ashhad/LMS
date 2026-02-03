import { query, table, transaction } from '../utils/db.js';

class Lesson {
    // Create new lesson
    static async create(lessonData) {
        const { module_id, title, description, video_url, duration, order_num, resources } = lessonData;

        const result = await query(
            `INSERT INTO ${table('lessons')} 
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
        const result = await query(
            `SELECT * FROM ${table('lessons')} 
       WHERE module_id = $1 
       ORDER BY order_num ASC`,
            [moduleId]
        );
        return result.rows;
    }

    // Find lesson by ID
    static async findById(id) {
        const result = await query(
            `SELECT * FROM ${table('lessons')} WHERE id = $1`,
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

        const result = await query(
            `UPDATE ${table('lessons')} 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Delete lesson
    static async delete(id) {
        await query(
            `DELETE FROM ${table('lessons')} WHERE id = $1`,
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
                    `UPDATE ${table('lessons')} 
                     SET order_num = $1 
                     WHERE id = $2 AND module_id = $3`,
                    [-(i + 1), item.id, moduleId]
                );
            }

            // Phase 2: Set final order values
            const results = [];
            for (const item of lessonsOrder) {
                const result = await client.query(
                    `UPDATE ${table('lessons')} 
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
