"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = exports.Message = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enums_1 = require("../helpers/enums");
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, required: true, enum: Object.values(enums_1.UserRole) },
    bio: { type: String },
    defaultMessage: { type: String },
    slug: { type: String, unique: true },
});
const messageSchema = new mongoose_1.default.Schema({
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    conversation: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Conversation', required: true }
});
const conversationSchema = new mongoose_1.default.Schema({
    influencer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    follower: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    latestMessage: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Message' },
    updated_at: { type: Date, default: Date.now }
});
exports.User = mongoose_1.default.model("User", userSchema);
exports.Message = mongoose_1.default.model('Message', messageSchema);
exports.Conversation = mongoose_1.default.model('Conversation', conversationSchema);
