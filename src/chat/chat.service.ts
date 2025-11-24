import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { Message } from './schemas/message.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<Chat>,
        @InjectModel(Message.name) private messageModel: Model<Message>,
    ) { }

    async createChat(createChatDto: CreateChatDto): Promise<Chat> {
        const newChat = new this.chatModel(createChatDto);
        return newChat.save();
    }

    async addMessage(createMessageDto: CreateMessageDto): Promise<Message> {
        const { chatId } = createMessageDto;
        const chat = await this.chatModel.findById(chatId);
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${chatId} not found`);
        }

        const newMessage = new this.messageModel(createMessageDto);
        return newMessage.save();
    }

    async getUserChats(userId: string): Promise<Chat[]> {
        return this.chatModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }

    async getChatMessages(chatId: string): Promise<Message[]> {
        return this.messageModel.find({ chatId }).sort({ createdAt: 1 }).exec();
    }

    async deleteChat(chatId: string): Promise<void> {
        const chat = await this.chatModel.findByIdAndDelete(chatId);
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${chatId} not found`);
        }
        await this.messageModel.deleteMany({ chatId });
    }

    async updateChat(chatId: string, updateChatDto: UpdateChatDto): Promise<Chat> {
        const updatedChat = await this.chatModel.findByIdAndUpdate(
            chatId,
            updateChatDto,
            { new: true },
        );
        if (!updatedChat) {
            throw new NotFoundException(`Chat with ID ${chatId} not found`);
        }
        return updatedChat;
    }
}
