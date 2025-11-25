import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateUserDto, LoginUserDto } from '../dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        login: jest.fn(),
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should return user data and token when login is successful', async () => {
            // Arrange
            const loginDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'Password123!'
            };

            const expectedResult = {
                id: 'some-uuid',
                email: loginDto.email,
                fullName: 'Test User',
                isActive: true,
                roles: ['user'],
                token: 'valid.jwt.token'
            };

            mockAuthService.login.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.login(loginDto);

            // Assert
            expect(result).toEqual(expectedResult);
            expect(authService.login).toHaveBeenCalledTimes(1);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });

        it('should propagate UnauthorizedException when credentials are invalid', async () => {
            // Arrange
            const loginDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'WrongPassword'
            };

            mockAuthService.login.mockRejectedValue(new UnauthorizedException('Credentials are not valid'));

            // Act & Assert
            await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('register', () => {
        it('should register a new user and return user data with token', async () => {
            // Arrange
            const createUserDto: CreateUserDto = {
                email: 'newuser@example.com',
                password: 'Password123!',
                name: 'New',
                lastname: 'User',
                roles: ['user']
            };

            const expectedResult = {
                id: 'new-uuid',
                email: createUserDto.email,
                fullName: `${createUserDto.name} ${createUserDto.lastname}`,
                isActive: true,
                roles: ['user'],
                token: 'valid.jwt.token'
            };

            mockAuthService.create.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.register(createUserDto);

            // Assert
            expect(result).toEqual(expectedResult);
            expect(authService.create).toHaveBeenCalledTimes(1);
            expect(authService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should propagate BadRequestException when user already exists', async () => {
            // Arrange
            const createUserDto: CreateUserDto = {
                email: 'existing@example.com',
                password: 'Password123!',
                name: 'Existing',
                lastname: 'User'
            };

            mockAuthService.create.mockRejectedValue(new BadRequestException('User exists in db'));

            // Act & Assert
            await expect(controller.register(createUserDto)).rejects.toThrow(BadRequestException);
            expect(authService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should register user without optional fields (roles)', async () => {
            // Arrange
            const createUserDto: CreateUserDto = {
                email: 'noroles@example.com',
                password: 'Password123!',
                name: 'No',
                lastname: 'Roles'
            };

            const expectedResult = {
                id: 'uuid-no-roles',
                email: createUserDto.email,
                fullName: `${createUserDto.name} ${createUserDto.lastname}`,
                isActive: true,
                roles: ['user'], // Default role assumed
                token: 'valid.jwt.token'
            };

            mockAuthService.create.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.register(createUserDto);

            // Assert
            expect(result).toEqual(expectedResult);
            expect(authService.create).toHaveBeenCalledWith(createUserDto);
        });
    });
});
