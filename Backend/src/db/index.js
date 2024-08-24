// dbSetup.js
import mysql2 from "mysql2";

// Create a connection pool
const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    ssl: {
        // Allow self-signed certificates (for development purposes)
        rejectUnauthorized: false
    }
}).promise();

// Function to check if the table exists and create it if not
export async function initializeDatabase() {
    try {
        // Check if the table exists
        const [rows] = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'defaultdb'
            AND table_name = 'schools';
        `);
        if (rows.length === 0) {
            // Table does not exist, create it
            await pool.query(`
                CREATE TABLE schools (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    address VARCHAR(255) NOT NULL,
                    latitude FLOAT(10, 6) NOT NULL,
                    longitude FLOAT(10, 6) NOT NULL
                );
            `);
            console.log('Schools table created successfully.');
        } else {
            console.log('Schools table already exists.');
        }
    } catch (err) {
        console.error('Error checking/creating schools table:', err);
    }
}

// Export the pool for other database operations
export default pool;
