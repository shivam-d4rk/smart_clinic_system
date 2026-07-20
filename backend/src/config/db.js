import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection instance configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres', // Yahan humne database engine postgres set kar diya
    logging: false, // Console ko clean rakhne ke liye raw queries hide ki hain
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DATABASE] PostgreSQL (Elephant) engine connected successfully.');
  } catch (error) {
    console.error(`[DATABASE ERROR] Postgres connection failed: ${error.message}`);
    process.exit(1);
  }
};

export { sequelize, connectDB };