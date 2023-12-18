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
const generateJWT_1 = require("../helpers/generateJWT");
const auth_1 = require("../middlewares/auth");
const errorHandler_1 = require("../helpers/errorHandler");
const messageHelper_1 = require("../helpers/messageHelper");
exports.influencerRouter = express_1.default.Router();
exports.influencerRouter.post('/signup', handleSignup);
exports.influencerRouter.post('/login', handleLogin);
exports.influencerRouter.get('/me', auth_1.authenticateInfluencer, handleMe);
exports.influencerRouter.post('/send', auth_1.authenticateInfluencer, handleSend);
exports.influencerRouter.get('/conversations', auth_1.authenticateInfluencer, handleConversations);
exports.influencerRouter.get('/conversations/:followerId', auth_1.authenticateInfluencer, handleConversationsId);
exports.influencerRouter.get('/:slug', handleSlug);
function handleSignup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedInput = zodSchemas_1.influencerSignupSchema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(422).json({ error: parsedInput.error.message });
        }
        try {
            const data = parsedInput.data;
            const existingUser = yield db_1.User.findOne({ email: data.email, role: enums_1.UserRole.Influencer }).exec();
            if (existingUser) {
                return res.status(403).json({ error: 'User with same email already exists' });
            }
            const slug = yield getSlugFromName(data.fullName);
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
            try {
                var token = (0, generateJWT_1.generateJWT)(newInfluencer._id.toString(), enums_1.UserRole.Influencer);
                res.json({
                    message: `Influencer successfully created`,
                    newInfluencer,
                    token
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
            return (0, errorHandler_1.sendErrorResponse)(res, "User doesn't exist", 422);
        }
        const data = parsedInput.data;
        const existingInfluencer = yield db_1.User.findOne({ email: data.email, role: enums_1.UserRole.Influencer }).exec();
        if (!existingInfluencer) {
            return res.status(403).json({ error: 'No user exists with given email' });
        }
        try {
            const hashedPassword = crypto_1.default.createHash('sha256').update(data.password).digest('hex');
            if (hashedPassword !== existingInfluencer.hashedPassword) {
                return res.status(403).json({ error: 'Wrong password' });
            }
            const token = (0, generateJWT_1.generateJWT)(existingInfluencer._id.toString(), enums_1.UserRole.Influencer);
            res.json({
                message: `Influencer successfully loggedin`,
                influencer: existingInfluencer,
                token
            });
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
function handleMe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const influencer = yield db_1.User.findById(req.headers.influencerId);
            res.json({
                fullName: influencer === null || influencer === void 0 ? void 0 : influencer.fullName,
                id: influencer === null || influencer === void 0 ? void 0 : influencer.id,
                slug: influencer === null || influencer === void 0 ? void 0 : influencer.slug
            });
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
function handleSlug(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const influencer = yield db_1.User.findOne({ slug: req.params.slug, role: enums_1.UserRole.Influencer }).exec();
            if (influencer) {
                res.json({
                    fullName: influencer.fullName,
                    bio: influencer.bio,
                    defaultMessage: influencer.defaultMessage,
                    id: influencer.id
                });
            }
            else {
                res.status(403).json({ error: 'influencer not found' });
            }
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
function handleSend(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const parsedInput = zodSchemas_1.influencerSendSchema.safeParse(req.body);
            if (!parsedInput.success)
                return (0, errorHandler_1.sendErrorResponse)(res, parsedInput.error.message, 422);
            const influencerId = req.headers.influencerId;
            const { followerId, content } = parsedInput.data;
            const follower = yield db_1.User.findById(followerId);
            if (!follower || follower.role !== enums_1.UserRole.Follower) {
                return (0, errorHandler_1.sendErrorResponse)(res, 'Follower does not exist', 403);
            }
            var convo = yield db_1.Conversation.findOne({
                influencer: influencerId,
                follower: followerId
            });
            if (!convo) {
                return (0, errorHandler_1.sendErrorResponse)(res, 'Cant send first message as influencer', 403);
            }
            const newMessage = yield (0, messageHelper_1.addNewMessageToDB)(content, influencerId, followerId, convo.id);
            convo.latestMessage = newMessage.id;
            convo = yield convo.save();
            const messages = yield db_1.Message.find({ conversation: convo.id }).sort({ timestamp: 1 });
            res.json({ messages });
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
function getSlugFromName(fullname) {
    return __awaiter(this, void 0, void 0, function* () {
        var slug = fullname.toLowerCase().replace(/\s+/g, '-');
        const existingUser = yield db_1.User.findOne({ slug }).exec();
        if (existingUser) {
            return slug + Date.now();
        }
        else
            return slug;
    });
}
function handleConversations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const influencerId = req.headers.influencerId;
            var conversations = yield db_1.Conversation.find({
                influencer: influencerId,
            }).sort({ updated_at: 1 });
            if (!conversations || conversations.length === 0) {
                return (0, errorHandler_1.sendErrorResponse)(res, 'No conversations yet', 404);
            }
            const formattedConversationsPromises = conversations.map((c) => __awaiter(this, void 0, void 0, function* () {
                if (!c.latestMessage) {
                    return {
                        conversation: c,
                        latestMessage: null
                    };
                }
                const msg = yield db_1.Message.findById(c.latestMessage._id);
                const follower = yield db_1.User.findById(c.follower);
                return {
                    conversation: c,
                    latestMessage: msg,
                    follower
                };
            }));
            const formattedConversations = yield Promise.all(formattedConversationsPromises);
            res.json({ conversations: formattedConversations });
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
function handleConversationsId(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const parsedParams = zodSchemas_1.getConverationRequestParamsSchema.safeParse(req.params);
            if (!parsedParams.success) {
                console.log('inside parsedparams error');
                return (0, errorHandler_1.sendErrorResponse)(res, parsedParams.error.message, 422);
            }
            const influencerId = req.headers.influencerId;
            const followerId = parsedParams.data.followerId;
            const convo = yield db_1.Conversation.findOne({
                influencer: influencerId,
                follower: followerId
            });
            if (!convo)
                return (0, errorHandler_1.sendErrorResponse)(res, 'Convo doesnt exist', 404);
            const messages = yield db_1.Message.find({
                conversation: convo.id
            }).sort({ timestamp: 1 });
            res.json({ messages });
        }
        catch (error) {
            (0, errorHandler_1.handleError)(error, res);
        }
    });
}
