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
exports.influencerRouter = void 0;
const express_1 = __importDefault(require("express"));
const zodSchemas_1 = require("../helpers/zodSchemas");
const db_1 = require("../db");
const enums_1 = require("../helpers/enums");
const crypto_1 = __importDefault(require("crypto"));
exports.influencerRouter = express_1.default.Router();
exports.influencerRouter.get('/me', (req, res) => {
    res.json({ message: 'Hello. its me' });
});
exports.influencerRouter.post('/signup', handleSignup);
function handleSignup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedInput = zodSchemas_1.influencerSignupSchema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(422).json({ error: parsedInput.error.message });
        }
        try {
            const data = parsedInput.data;
            const slug = getSlugFromName(data.fullName);
            const hashedPassword = crypto_1.default.createHash('sha256').update(data.password).digest('hex');
            const newInfluencer = new db_1.User({
                fullName: data.fullName,
                email: data.email,
                hashedPassword,
                role: enums_1.UserRole.Influencer,
                bio: data.bio,
                defaultMessage: data.defaultMessage,
                slug
            });
            yield newInfluencer.save();
            res.json({
                message: `Influencer successfully created`,
                newInfluencer
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        }
    });
}
function getSlugFromName(fullname) {
    return fullname.toLowerCase().replace(/\s+/g, '-');
}
