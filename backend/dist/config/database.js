"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = __importDefault(require("./env"));
// Create a connection pool
const pool = promise_1.default.createPool({
    host: env_1.default.DB_HOST,
    port: env_1.default.DB_PORT,
    user: env_1.default.DB_USER,
    password: env_1.default.DB_PASSWORD,
    database: env_1.default.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.pool = pool;
// Test the connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection established successfully');
        connection.release();
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
};
exports.testConnection = testConnection;
