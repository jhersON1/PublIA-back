import { Test, TestingModule } from '@nestjs/testing';
import { GptController } from '../gpt.controller';
import { GptService } from '../gpt.service';
import { ChatTextDto } from '../dto/chat-text.dto';
import { BadRequestException } from '@nestjs/common';

describe('GptController', () => {
    let controller: GptController;
    let service: GptService;

    const mockGptService = {
        chat: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GptController],
            providers: [
                {
                    provide: GptService,
                    useValue: mockGptService,
                },
            ],
        }).compile();

        controller = module.get<GptController>(GptController);
        service = module.get<GptService>(GptService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('chat', () => {
        it('should call gptService.chat with correct parameters and return result', async () => {
            // Arrange
            const chatTextDto: ChatTextDto = {
                prompt: 'Hello GPT',
                chatId: 'chat-123',
            };

            const expectedResult = {
                message: 'Hello User',
            };

            mockGptService.chat.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.chat(chatTextDto);

            // Assert
            expect(service.chat).toHaveBeenCalledTimes(1);
            expect(service.chat).toHaveBeenCalledWith(chatTextDto);
            expect(result).toEqual(expectedResult);
        });

        it('should handle chat request without optional chatId', async () => {
            // Arrange
            const chatTextDto: ChatTextDto = {
                prompt: 'New conversation',
            };

            const expectedResult = {
                message: 'Starting new chat',
            };

            mockGptService.chat.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.chat(chatTextDto);

            // Assert
            expect(service.chat).toHaveBeenCalledWith(chatTextDto);
            expect(result).toEqual(expectedResult);
        });

        it('should propagate errors thrown by gptService', async () => {
            // Arrange
            const chatTextDto: ChatTextDto = {
                prompt: 'Error prompt',
            };

            const error = new BadRequestException('Invalid prompt');
            mockGptService.chat.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.chat(chatTextDto)).rejects.toThrow(BadRequestException);
            expect(service.chat).toHaveBeenCalledWith(chatTextDto);
        });

        it('should handle unexpected errors gracefully', async () => {
            // Arrange
            const chatTextDto: ChatTextDto = {
                prompt: 'Crash prompt',
            };

            mockGptService.chat.mockRejectedValue(new Error('Unexpected error'));

            // Act & Assert
            await expect(controller.chat(chatTextDto)).rejects.toThrow('Unexpected error');
        });
    });
});
