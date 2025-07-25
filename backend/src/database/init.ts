import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'oasis_scribe',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
})

export async function initDatabase() {
  try {
    await pool.query('SELECT NOW()')
    console.log('Database connection established')

    const initSQLPath = path.join(__dirname, 'init.sql')
    if (fs.existsSync(initSQLPath)) {
      const initSQL = fs.readFileSync(initSQLPath, 'utf8')
      await pool.query(initSQL)
      console.log('Database tables initialized')
    }
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

export { pool } 