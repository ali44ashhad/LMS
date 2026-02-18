import pool, { DB_SCHEMA } from '../config/pg-db.js';
import bcrypt from 'bcryptjs';

const USERS_TABLE = `${DB_SCHEMA}.users`;
const USER_LMS_PROFILE_TABLE = `${DB_SCHEMA}.user_lms_profile`;

class User {
  // Get user by ID
  static async findById(userId) {
    const result = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.roles, u.created_at, u.updated_at,
        p.avatar, p.bio, p.phone, p.address, p.name_on_certificate, p.is_active,
        p.created_at as profile_created_at, p.updated_at as profile_updated_at
       FROM ${USERS_TABLE} u
       LEFT JOIN ${USER_LMS_PROFILE_TABLE} p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  // Get user by email
  static async findByEmail(email) {
    const result = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.roles, u.created_at, u.updated_at,
        p.avatar, p.bio, p.phone, p.address, p.name_on_certificate, p.is_active,
        p.created_at as profile_created_at, p.updated_at as profile_updated_at
       FROM ${USERS_TABLE} u
       LEFT JOIN ${USER_LMS_PROFILE_TABLE} p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  // Update LMS profile
  static async updateLMSProfile(userId, profileData) {
    const { avatar, bio, phone, address, name_on_certificate } = profileData;

    // Upsert user_lms_profile
    const result = await pool.query(
      `INSERT INTO ${USER_LMS_PROFILE_TABLE} (user_id, avatar, bio, phone, address, name_on_certificate)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET avatar = $2, bio = $3, phone = $4, address = $5, name_on_certificate = $6, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, avatar, bio, phone, address, name_on_certificate]
    );
    return result.rows[0];
  }

  // Compare password (password is from nesta.users table)
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default User;
