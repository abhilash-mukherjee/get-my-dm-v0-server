import { Conversation, Message } from "../db";
export async function addNewConvoToDB(defaultMessage : string, influencerId : string, followerId:string){
    var newConvo = new Conversation({
        influencer: influencerId,
        follower: followerId,
        updated_at: Date.now()
    })
    newConvo = await newConvo.save();
    const   newMessage = await addNewMessageToDB(defaultMessage,influencerId, followerId, newConvo.id);
    newConvo.latestMessage = newMessage.id;
    newConvo = await newConvo.save();
    return newConvo;
}

export async function addNewMessageToDB(content : string, senderId : string, receiverId :string, convoId : string){
    var newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content: content,
        timestamp: Date.now(),
        conversation: convoId
    });
    newMessage = await newMessage.save();
    return newMessage;
}