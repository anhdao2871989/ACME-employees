const express = require('express');
const { Client } = require('pg');
const path = require('path');

const client = new Client({
  user: process.env.DB_USER || 'your_db_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'acme_hr_db',
  password: process.env.DB_PASSWORD || 'your_db_password',
  port: process.env.DB_PORT || 5432,
});

client.connect();

const app = express();
const PORT = process.env.PORT || 3000;

// Create tables and seed data
const createTables = `
  CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_admin BOOLEAN
  );
`;

const seedData = `
  INSERT INTO employees (name, is_admin) VALUES
  ('John Doe', true),
  ('Jane Smith', false),
  ('Bob Johnson', false);
`;

client.query(createTables, (err) => {
  if (err) throw err;
  client.query(seedData, (err) => {
    if (err) throw err;
  });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.get('/api/employees', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM employees');
    const employees = result.rows;
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
