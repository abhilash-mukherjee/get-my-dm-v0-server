import mongoose from "mongoose";
enum UserRole {
    Influencer = "Influencer",
    User = "User"
  }
const userSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    fullName: {type: String, required: true},
    role: { type: String, required: true, enum: Object.values(UserRole) },
});

const influencerSchema = new mongoose.Schema({
    bio: {type: String, required: true},
    defaultMessage: {type: String, required: true},
    slug: {type: String, required: true, unique: true},
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'}
});

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true }
});

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    updated_at: { type: Date, default: Date.now }
});
export const User = mongoose.model("User", userSchema);
export const Influencer = mongoose.model("Influencer", influencerSchema);
export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
