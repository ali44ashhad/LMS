import { query, table } from '../utils/db.js';
import bcrypt from 'bcryptjs';

class User {
  // Get user by ID
  static async findById(userId) {
    const result = await query(
      `SELECT u.*, p.avatar, p.bio, p.phone, p.address, p.is_active
       FROM ${table('users')} u
       LEFT JOIN ${table('user_lms_profile')} p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  // Get user by email
  static async findByEmail(email) {
    const result = await query(
      `SELECT u.*, p.avatar, p.bio, p.phone, p.address, p.is_active
       FROM ${table('users')} u
       LEFT JOIN ${table('user_lms_profile')} p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  // Update LMS profile
  static async updateLMSProfile(userId, profileData) {
    const { avatar, bio, phone, address } = profileData;

    // Upsert user_lms_profile
    const result = await query(
      `INSERT INTO ${table('user_lms_profile')} (user_id, avatar, bio, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET avatar = $2, bio = $3, phone = $4, address = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, avatar, bio, phone, address]
    );
    return result.rows[0];
  }

  // Compare password (password is from nesta.users table)
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default User;
