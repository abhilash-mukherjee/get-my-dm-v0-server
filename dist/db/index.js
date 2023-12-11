"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = exports.Message = exports.Influencer = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var UserRole;
(function (UserRole) {
    UserRole["Influencer"] = "Influencer";
    UserRole["User"] = "User";
})(UserRole || (UserRole = {}));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, required: true, enum: Object.values(UserRole) },
});
const influencerSchema = new mongoose_1.default.Schema({
    bio: { type: String, required: true },
    defaultMessage: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: 'User' }
});
const messageSchema = new mongoose_1.default.Schema({
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    conversation: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Conversation', required: true }
});
const conversationSchema = new mongoose_1.default.Schema({
    participants: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Message' },
    updated_at: { type: Date, default: Date.now }
});
exports.User = mongoose_1.default.model("User", userSchema);
exports.Influencer = mongoose_1.default.model("Influencer", influencerSchema);
exports.Message = mongoose_1.default.model('Message', messageSchema);
exports.Conversation = mongoose_1.default.model('Conversation', conversationSchema);
