Installation and Deployment Guide
This document provides a comprehensive technical guide for setting up the full-stack application environment, initializing the relational database, and deploying to production using free-tier cloud services.

Prerequisites
Ensure the following software is installed on your local system before proceeding:

Node.js: Version 18.0.0 or higher

PostgreSQL: Version 14.0 or higher

npm: Node Package Manager (distributed with Node.js)

Database Management with psql
Before configuring the backend, you must initialize the PostgreSQL database and user permissions using the psql command-line utility.

1. Install PostgreSQL and psql
Windows: Download the installer from the official PostgreSQL website. Ensure "Command Line Tools" is checked during installation.

macOS: Use Homebrew: brew install postgresql

Linux (Ubuntu/Debian): Run sudo apt update && sudo apt install postgresql postgresql-contrib

2. Access the psql Shell
Open your terminal and enter the PostgreSQL interactive terminal as the default superuser:

Bash
# On Linux/macOS
sudo -i -u postgres psql

# On Windows
psql -U postgres
3. Create Database and User
Execute the following commands within the psql interface to set up your environment:

Getty Images

SQL
-- Create the application database
CREATE DATABASE your_database_name;

-- Create a dedicated user with a secure password
CREATE USER your_postgres_user WITH ENCRYPTED PASSWORD 'your_postgres_password';

-- Grant all privileges on the database to the new user
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_postgres_user;

-- Exit psql
\q
Local Installation
1. Backend Configuration
Navigate to the server directory and install dependencies:

Bash
cd backend
npm install
Create a .env file in the backend directory:

Фрагмент кода
PORT=5000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_complex_secret_string
2. Database Schema Initialization
Run the seeding script to build the tables and inject initial data:

Bash
node seed.js
3. Frontend Configuration
Navigate to the client directory and install dependencies:

Bash
cd ../frontend
npm install
Verify that src/api.js points to the local server:

JavaScript
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});
Running the Application Locally
The application requires two active terminal sessions to run the backend and frontend simultaneously.

Start the Backend
Bash
cd backend
npm run dev
The server operates on http://localhost:5000.

Start the Frontend
Bash
cd frontend
npm run dev
The interface operates on http://localhost:5173.

Production Deployment

Shutterstock
1. Database Hosting (Neon or Supabase)
Create an account on Neon.tech or Supabase.com.

Provision a new PostgreSQL project.

Copy the external connection string.

Update your production environment variables with the provided host, port, and credentials.

2. Backend Hosting (Render)
Connect your repository to Render.com.

Create a new Web Service and select the backend directory as the root.

Set the Build Command to npm install.

Set the Start Command to node server.js.

Input all .env variables into the Render Environment Variables dashboard.

3. Frontend Hosting (Vercel or Netlify)
In the frontend source, update src/api.js to use the live Render URL:

JavaScript
baseURL: 'https://your-backend-url.onrender.com/api'
Commit and push changes to GitHub.

Connect the repository to Vercel or Netlify.

Set the Build Command to npm run build.

Set the Output Directory to dist.

Security Considerations
Credential Management: Never commit the .env file to version control. Use .gitignore.

JWT Integrity: Ensure the JWT_SECRET used in production is a high-entropy string distinct from the development key.

CORS Policy: Restrict the backend CORS configuration to accept requests exclusively from your production frontend domain.

Database Access: Use environment variables to handle connection strings to avoid exposing sensitive URI parameters in the codebase.