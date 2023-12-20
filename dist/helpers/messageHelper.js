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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMessageStatus = exports.addNewMessageToDB = exports.addNewConvoToDB = void 0;
const db_1 = require("../db");
function addNewConvoToDB(defaultMessage, influencerId, followerId) {
    return __awaiter(this, void 0, void 0, function* () {
        var newConvo = new db_1.Conversation({
            influencer: influencerId,
            follower: followerId,
            updated_at: Date.now()
        });
        newConvo = yield newConvo.save();
        const newMessage = yield addNewMessageToDB(defaultMessage, influencerId, followerId, newConvo.id);
        newConvo.latestMessage = newMessage.id;
        newConvo = yield newConvo.save();
        return newConvo;
    });
}
exports.addNewConvoToDB = addNewConvoToDB;
function addNewMessageToDB(content, senderId, receiverId, convoId) {
    return __awaiter(this, void 0, void 0, function* () {
        var newMessage = new db_1.Message({
            sender: senderId,
            receiver: receiverId,
            content: content,
            timestamp: Date.now(),
            messageStatus: 'delivered',
            conversation: convoId
        });
        newMessage = yield newMessage.save();
        return newMessage;
    });
}
exports.addNewMessageToDB = addNewMessageToDB;
function updateMessageStatus(messageId, messageStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        const newMessage = yield db_1.Message.findByIdAndUpdate(messageId, { messageStatus }, { returnDocument: "after" });
        return newMessage;
    });
}
exports.updateMessageStatus = updateMessageStatus;
