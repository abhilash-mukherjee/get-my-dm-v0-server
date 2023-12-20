import { Conversation, Message } from "../db";
export async function addNewConvoToDB(defaultMessage: string, influencerId: string, followerId: string) {
    var newConvo = new Conversation({
        influencer: influencerId,
        follower: followerId,
        updated_at: Date.now()
    })
    newConvo = await newConvo.save();
    const newMessage = await addNewMessageToDB(defaultMessage, influencerId, followerId, newConvo.id);
    newConvo.latestMessage = newMessage.id;
    newConvo = await newConvo.save();
    return newConvo;
}

export async function addNewMessageToDB(content: string, senderId: string, receiverId: string, convoId: string) {
    var newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content: content,
        timestamp: Date.now(),
        messageStatus: 'delivered',
        conversation: convoId
    });
    newMessage = await newMessage.save();
    return newMessage;
}

export async function updateMessageStatus(messageId: string, messageStatus: string) {
    const newMessage = await Message.findByIdAndUpdate(messageId, { messageStatus },{returnDocument: "after"});
    return newMessage;
}