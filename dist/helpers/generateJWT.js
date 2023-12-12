"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const enums_1 = require("./enums");
require('dotenv').config();
function generateJWT(userId, role) {
    if (!process.env.INFLUENCER_SK || !process.env.FOLLOWER_SK) {
        throw new Error('Secret keys are not set');
    }
    const token = jsonwebtoken_1.default.sign({ userId }, role === enums_1.UserRole.Influencer ? process.env.INFLUENCER_SK : process.env.FOLLOWER_SK, { expiresIn: '5h' });
    return token;
}
exports.generateJWT = generateJWT;
