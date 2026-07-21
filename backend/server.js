// Core structural frameworks
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

// Database configurations aur Central Associations Engine imports
import { connectDB, sequelize } from './src/config/db.js';
import { setupAssociations } from './src/models/associations.js';

// App Routes pathways imports
import authRoutes from './src/routes/authRoutes.js';
import patientRoutes from './src/routes/patientRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';

// 1. Initialize environment variables immediately
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* 
  =========================================
  SECURITY & PARSING MIDDLEWARE LAYER
  =========================================
*/
app.use(cookieParser());
app.use(helmet());
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://smart-clinic-system-chi.vercel.app' // Aapka Vercel Frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(null, true); // Production test ke liye sab allow kar do agar multiple preview URLs ban rahe hain
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* 
  =========================================
  BASE TESTING HEALTH CHECK ROUTE
  =========================================
*/
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Server is running perfectly!',
    timestamp: new Date().toISOString()
  });
});

/* 
  =========================================
  API ROUTES REGISTRATION (Aligned)
  =========================================
*/
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);

/* 
  =========================================
  GLOBAL ERROR HANDLING SAFETY NET
  =========================================
*/
app.use((err, req, res, next) => {
  console.error(`[CRITICAL ERROR]: ${err.stack}`);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

/* 
  =========================================
  DATABASE SYNC & BOOTSTRAP PIPELINE
  =========================================
*/
const initializeSystem = async () => {
  try {
    // 1. Establish core PostgreSQL authentication link
    await connectDB();

    // 2. Trigger relationships maps inside associations module file
    setupAssociations();

    // 3. Synchronize database mapping columns safely (Single Clean Sync Execution)
    await sequelize.sync({ alter: true });
    console.log('[MIGRATION] PostgreSQL tables synchronized successfully.');

    // 4. Trigger network listener port binding operation
    app.listen(PORT, () => {
      console.log(`[SERVER] Booted successfully and operating on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[BOOT CRASHED] System initialization layer failed: ${error.message}`);
    process.exit(1);
  }
};

// Start the entire system core engine lifecycle
initializeSystem();