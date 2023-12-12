import mongoose from "mongoose";
enum UserRole {
    Influencer = "Influencer",
    User = "Follower"
  }
const userSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    fullName: {type: String, required: true},
    role: { type: String, required: true, enum: Object.values(UserRole) },
    bio: {type: String},
    defaultMessage: {type: String},
    slug: {type: String, unique: true},
});

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true }
});

const conversationSchema = new mongoose.Schema({
    influencer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message'},
    updated_at: { type: Date, default: Date.now }
});
export const User = mongoose.model("User", userSchema);
export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
