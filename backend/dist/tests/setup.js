"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
// Global test setup
beforeAll(async () => {
    // Add any global setup here
});
// Global test teardown
afterAll(async () => {
    // Close all database connections
    await database_1.pool.end();
});
// Reset database between tests
beforeEach(async () => {
    // Clear any test data if needed
});
afterEach(async () => {
    // Clean up after each test
    jest.clearAllMocks();
});
