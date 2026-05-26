# Student Information Management System — Final Exam

This repository contains a Node.js Student Information Management System demonstrating CRUD operations, MySQL database integration (Aiven compatible), and deployment readiness for Render.

Deployment link: (add your Render URL here)

Required files in repo:
- `package.json`
- `crud_final_exam.js`
- `README.md`

Quick setup (local):

1. Create a `.env` file in the project root with these values (for local testing only):

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=students_db
PORT=3000
```

2. Install dependencies:

```bash
npm install
```

3. Run the server:

```bash
npm start
```

Database schema (SQL):

```sql
CREATE DATABASE IF NOT EXISTS students_db;
USE students_db;
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  year_level VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL
);
```

Render deployment notes:
- Do NOT commit database credentials to GitHub. Use Render environment variables.
- On Render, set the following environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- The start command is `npm start` and the port will be read from `process.env.PORT`.

Aiven notes:
- Create a managed MySQL instance on Aiven and record the host, port, user, password and database name.
- Add those values to Render environment variables to keep credentials out of the repo.

Security:
- This example uses prepared statements via `mysql2` and basic input checks. For production, add authentication, stronger validation and TLS for DB connections.

If you want, I can:
- Initialize a Git repo and show example commit messages
- Create a GitHub repository and push the code (you'll need to authenticate)
- Provide Render and Aiven step-by-step deployment steps
# Mark_Bryan_Mantilla_Final_Exam