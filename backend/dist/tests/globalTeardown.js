"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
exports.default = async () => {
    await database_1.pool.end();
};
