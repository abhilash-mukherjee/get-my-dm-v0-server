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
exports.followerRouter = void 0;
const express_1 = __importDefault(require("express"));
const zodSchemas_1 = require("../helpers/zodSchemas");
const db_1 = require("../db");
const enums_1 = require("../helpers/enums");
const crypto_1 = __importDefault(require("crypto"));
const generateJWT_1 = require("../helpers/generateJWT");
const errorHandler_1 = require("../helpers/errorHandler");
exports.followerRouter = express_1.default.Router();
exports.followerRouter.post('/signup', handleSignup);
exports.followerRouter.post('/login', handleLogin);
function handleSignup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedInput = zodSchemas_1.followerSignupSchema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(422).json({ error: parsedInput.error.message });
        }
        try {
            const data = parsedInput.data;
            const existingFollower = yield db_1.User.findOne({ email: data.email, role: enums_1.UserRole.Follower }).exec();
            if (existingFollower) {
                return res.status(403).json({ error: 'User with same email already exists' });
            }
            const hashedPassword = crypto_1.default.createHash('sha256').update(data.password).digest('hex');
            const newFollower = new db_1.User({
                fullName: data.fullName,
                email: data.email,
                hashedPassword,
                role: enums_1.UserRole.Follower
            });
            yield newFollower.save();
            try {
                var token = (0, generateJWT_1.generateJWT)(newFollower._id.toString(), enums_1.UserRole.Follower);
                res.json({
                    message: `Follower successfully created`,
                    follower: newFollower,
                    token
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(error, res);
            }
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
function handleLogin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedInput = zodSchemas_1.userLoginSchema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(422).json({ error: parsedInput.error.message });
        }
        const data = parsedInput.data;
        const existingFollower = yield db_1.User.findOne({ email: data.email, role: enums_1.UserRole.Follower }).exec();
        if (!existingFollower) {
            return res.status(403).json({ error: 'No user exists with given email' });
        }
        try {
            const hashedPassword = crypto_1.default.createHash('sha256').update(data.password).digest('hex');
            if (hashedPassword !== existingFollower.hashedPassword) {
                return res.status(403).json({ error: 'Wrong password' });
            }
            const token = (0, generateJWT_1.generateJWT)(existingFollower._id.toString(), enums_1.UserRole.Follower);
            res.json({
                message: `Follower successfully loggedin`,
                follower: existingFollower,
                token
            });
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
