import { Controller, Post, Body, Get, Param, Delete, Patch } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

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

  @Delete(':id')
  deleteChat(@Param('id') id: string) {
    return this.chatService.deleteChat(id);
  }

  @Patch(':id')
  updateChat(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.updateChat(id, updateChatDto);
  }

  @Patch('message/:messageId')
  updateMessageMedia(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto
  ) {
    return this.chatService.updateMessageMedia(
      messageId,
      updateMessageDto.platform,
      updateMessageDto.mediaUrl
    );
  }
}
