import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

export const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Cloud database SSL handshake requirement
        }
      },
      logging: false
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      }
    );

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DATABASE] PostgreSQL connected successfully.');
  } catch (error) {
    console.error('[DATABASE ERROR] Postgres connection failed:', error.message);
    throw error;
  }
};