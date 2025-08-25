import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

// Import refactored route files
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import roleRoutes from "./routes/roles.js";
import plantRoutes from "./routes/plants.js";
import inventoryRoutes from "./routes/spareInventory.js";
import permissionRoutes from "./routes/rolePermissionRoutes.js";

// --- App Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;


// --- Core Middlewares ---
app.use(cors("*"));
app.use(express.json()); // Replaces bodyParser.json()
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/permissions', permissionRoutes);



// --- Root Route for Basic Check ---
app.get('/', (req, res) => {
  res.send('✅ Server is working!');
});

// --- Centralized Error Handling (Optional but Recommended) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
