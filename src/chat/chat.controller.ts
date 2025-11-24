import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post()
  createChat(@Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(createChatDto);
  }

  @Post('message')
  addMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.chatService.addMessage(createMessageDto);
  }

  @Get('user/:userId')
  getUserChats(@Param('userId') userId: string) {
    return this.chatService.getUserChats(userId);
  }

  @Get(':chatId/messages')
  getChatMessages(@Param('chatId') chatId: string) {
    return this.chatService.getChatMessages(chatId);
  }
}
