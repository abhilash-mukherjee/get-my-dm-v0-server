"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateFollower = exports.authenticateInfluencer = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zodSchemas_1 = require("../helpers/zodSchemas");
const errorHandler_1 = require("../helpers/errorHandler");
const db_1 = require("../db");
const enums_1 = require("../helpers/enums");
function authenticateInfluencer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedHeader = zodSchemas_1.headerSchema.safeParse(req.headers);
        if (!parsedHeader.success) {
            return res.status(403).json({ error: parsedHeader.error.message });
        }
        const token = getAuthToken(parsedHeader.data.authorization);
        if (!token) {
            return res.status(403).json({ error: 'Invalid auth token' });
        }
        try {
            if (!process.env.INFLUENCER_SK) {
                throw new Error('Secret keys are not set');
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.INFLUENCER_SK);
            const decodedPayload = decoded;
            if (decodedPayload) {
                console.log(decodedPayload);
                const influencer = yield db_1.User.findById(decodedPayload.userId);
                if (influencer && influencer.role === enums_1.UserRole.Influencer) {
                    req.headers['influencerId'] = influencer._id.toString();
                    next();
                }
                else {
                    res.status(403).json({ error: "Couldn't find influencer" });
                }
            }
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
exports.authenticateInfluencer = authenticateInfluencer;
function authenticateFollower(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedHeader = zodSchemas_1.headerSchema.safeParse(req.headers);
        if (!parsedHeader.success) {
            return res.status(403).json({ error: parsedHeader.error.message });
        }
        const token = getAuthToken(parsedHeader.data.authorization);
        if (!token) {
            return res.status(403).json({ error: 'Invalid auth token' });
        }
        try {
            if (!process.env.FOLLOWER_SK) {
                throw new Error('Secret keys are not set');
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.FOLLOWER_SK);
            const decodedPayload = decoded;
            if (decodedPayload) {
                console.log(decodedPayload);
                const follower = yield db_1.User.findById(decodedPayload.userId);
                if (follower && follower.role === enums_1.UserRole.Follower) {
                    req.headers['followerId'] = follower._id.toString();
                    next();
                }
                else {
                    res.status(403).json({ error: "Couldn't find user" });
                }
            }
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
exports.authenticateFollower = authenticateFollower;
function getAuthToken(authorization) {
    return authorization.split(' ')[1];
}
