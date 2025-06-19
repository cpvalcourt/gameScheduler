import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { validationResult } from 'express-validator';
import config from './config/env';
import { testConnection } from './config/database';
import authRoutes from './routes/auth.routes';
import teamRoutes from './routes/team.routes';
import gameSeriesRoutes from './routes/game-series.routes';
import gameRoutes from './routes/game.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validation error handler
app.use((req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
});

// Test database connection
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/game-series', gameSeriesRoutes);
app.use('/api/games', gameRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Game Scheduler API is running' });
});

// Start server
app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`);
}); 