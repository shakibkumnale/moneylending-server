import express from 'express';
import mongoose from 'mongoose';
import '../src/utils/env.js';
import cors from 'cors';
import connectDB from '../src/config/db.js';
import authRoutes from '../src/routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/', authRoutes);

app.get('/test', async (req, res) => {
    try {
        const serverInfo = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            serverTime: Date.now()
        };
        
        res.json(serverInfo);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});