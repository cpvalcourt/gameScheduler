"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_validator_1 = require("express-validator");
const env_1 = __importDefault(require("./config/env"));
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const game_series_routes_1 = __importDefault(require("./routes/game-series.routes"));
const game_routes_1 = __importDefault(require("./routes/game.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Validation error handler
app.use((req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
});
// Test database connection
(0, database_1.testConnection)();
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/game-series', game_series_routes_1.default);
app.use('/api/games', game_routes_1.default);
// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Game Scheduler API is running' });
});
// Start server
app.listen(env_1.default.PORT, () => {
    console.log(`Server is running on port ${env_1.default.PORT} in ${env_1.default.NODE_ENV} mode`);
});
