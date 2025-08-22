import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config'; // Replaces require('dotenv').config()

import authRoutes from './routes/auth.js'; 
import userRoute from './routes/user.js';
import roleRoutes from "./routes/roles.js";
import plantRoutes from "./routes/plants.js";
import InventoryRoutes from "./routes/spareInventory.js";
import permissionRoutes from "./routes/rolePermissionRoutes.js";
import { initPermissionTables } from "./models/Permission.js";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

const allowedOrigins = ['http://0.0.0.0:5173', 'http://192.168.1.21:3000'];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
// }));

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || "*"); // allow any origin
    },
    credentials: true,
  })
);

app.use(bodyParser.json());
await initPermissionTables();
// Your routes (preserved the commented-out lines)
app.use('/api', authRoutes); 
app.use('/api', userRoute); 
app.use("/api", roleRoutes);
app.use("/api", plantRoutes);
app.use("/api", InventoryRoutes);
app.use("/api", permissionRoutes);

app.get('/', (req, res) => {
  res.send('✅ Server is working!');
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
