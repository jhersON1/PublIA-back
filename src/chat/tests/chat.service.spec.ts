import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatService } from '../chat.service';
import { Chat } from '../schemas/chat.schema';
import { Message } from '../schemas/message.schema';
import { CreateChatDto } from '../dto/create-chat.dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { NotFoundException } from '@nestjs/common';

describe('ChatService', () => {
    let service: ChatService;
    let chatModel: any;

    const mockChatModel = jest.fn().mockImplementation((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue({
            _id: 'chat-id',
            ...dto,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    })) as any;

    const mockMessageModel = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getModelToken(Chat.name),
                    useValue: mockChatModel,
                },
                {
                    provide: getModelToken(Message.name),
                    useValue: mockMessageModel,
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        chatModel = module.get(getModelToken(Chat.name));
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createChat', () => {
        it('should create a new chat successfully', async () => {
            // Arrange
            const createChatDto: CreateChatDto = {
                userId: 'user-id',
                title: 'New Chat',
            };

            // Act
            const result = await service.createChat(createChatDto);

            // Assert
            expect(chatModel).toHaveBeenCalledWith(createChatDto);
            expect(result).toEqual(expect.objectContaining({
                _id: 'chat-id',
                userId: createChatDto.userId,
                title: createChatDto.title,
            }));
        });

        it('should create a chat without optional title', async () => {
            // Arrange
            const createChatDto: CreateChatDto = {
                userId: 'user-id',
            };

            // Act
            const result = await service.createChat(createChatDto);

            // Assert
            expect(chatModel).toHaveBeenCalledWith(createChatDto);
            expect(result).toEqual(expect.objectContaining({
                _id: 'chat-id',
                userId: createChatDto.userId,
            }));
        });
    });

    describe('addMessage', () => {
        it('should add a message to an existing chat', async () => {
            // Arrange
            const createMessageDto: CreateMessageDto = {
                chatId: 'chat-id',
                sender: 'user',
                content: 'Hello AI',
            };

            const mockChat = { _id: 'chat-id' };
            mockChatModel.findById = jest.fn().mockResolvedValue(mockChat);
            mockMessageModel.mockImplementation((dto) => ({
                ...dto,
                save: jest.fn().mockResolvedValue({
                    _id: 'message-id',
                    ...dto,
                    createdAt: new Date(),
                }),
            }));

            // Act
            const result = await service.addMessage(createMessageDto);

            // Assert
            expect(mockChatModel.findById).toHaveBeenCalledWith(createMessageDto.chatId);
            expect(mockMessageModel).toHaveBeenCalledWith(createMessageDto);
            expect(result).toEqual(expect.objectContaining({
                _id: 'message-id',
                content: createMessageDto.content,
                sender: createMessageDto.sender,
            }));
        });

        it('should throw NotFoundException if chat does not exist', async () => {
            // Arrange
            const createMessageDto: CreateMessageDto = {
                chatId: 'non-existent-chat-id',
                sender: 'user',
                content: 'Hello?',
            };

            mockChatModel.findById = jest.fn().mockResolvedValue(null);

            // Act & Assert
            await expect(service.addMessage(createMessageDto)).rejects.toThrow(NotFoundException);
            expect(mockChatModel.findById).toHaveBeenCalledWith(createMessageDto.chatId);
            expect(mockMessageModel).not.toHaveBeenCalled();
        });

        it('should add a message with optional type and mediaUrl', async () => {
            // Arrange
            const createMessageDto: CreateMessageDto = {
                chatId: 'chat-id',
                sender: 'ai',
                content: 'Here is an image',
                type: 'image',
                mediaUrl: 'http://example.com/image.png',
            };

            const mockChat = { _id: 'chat-id' };
            mockChatModel.findById = jest.fn().mockResolvedValue(mockChat);
            mockMessageModel.mockImplementation((dto) => ({
                ...dto,
                save: jest.fn().mockResolvedValue({
                    _id: 'message-id-2',
                    ...dto,
                    createdAt: new Date(),
                }),
            }));

            // Act
            const result = await service.addMessage(createMessageDto);

            // Assert
            expect(result).toEqual(expect.objectContaining({
                type: 'image',
                mediaUrl: 'http://example.com/image.png',
            }));
        });

        it('should propagate database errors during save', async () => {
            // Arrange
            const createMessageDto: CreateMessageDto = {
                chatId: 'chat-id',
                sender: 'user',
                content: 'Error message',
            };

            const mockChat = { _id: 'chat-id' };
            mockChatModel.findById = jest.fn().mockResolvedValue(mockChat);
            mockMessageModel.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error('Database error')),
            }));

            // Act & Assert
            await expect(service.addMessage(createMessageDto)).rejects.toThrow('Database error');
        });
    });
});
