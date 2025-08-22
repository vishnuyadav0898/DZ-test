
import postgres from 'postgres';
import 'dotenv/config'; 

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(connectionString, {
  ssl: 'require', 
});
console.log('✅ PostgreSQL connection pool established');

export default sql;
