const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'students_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDb() {
  pool = mysql.createPool(dbConfig);
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(100) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      course VARCHAR(255) NOT NULL,
      year_level VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB;
  `;
  await pool.query(createTableSql);
}

app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { student_id, full_name, course, year_level, email } = req.body;
    if (!student_id || !full_name || !course || !year_level || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const sql = 'INSERT INTO students (student_id, full_name, course, year_level, email) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(sql, [student_id, full_name, course, year_level, email]);
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { student_id, full_name, course, year_level, email } = req.body;
    const { id } = req.params;
    if (!student_id || !full_name || !course || !year_level || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const sql = `UPDATE students SET student_id = ?, full_name = ?, course = ?, year_level = ?, email = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [student_id, full_name, course, year_level, email, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
