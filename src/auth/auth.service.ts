import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './schemas/user.schema';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
    ) { }

    async create(createUserDto: CreateUserDto) {
        try {
            const { password, ...userData } = createUserDto;

            const user = await this.userModel.create({
                ...userData,
                password: bcrypt.hashSync(password, 10),
            });

            return {
                ...user.toJSON(),
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async login(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;

        const user = await this.userModel.findOne({ email }).select('+password');

        if (!user) {
            throw new UnauthorizedException('Credentials are not valid (email)');
        }

        if (!bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedException('Credentials are not valid (password)');
        }

        return {
            ...user.toJSON(),
            token: this.getJwtToken({ id: user.id }),
        };
    }

    checkAuthStatus(user: User) {
        return {
            ...user.toJSON(),
            token: this.getJwtToken({ id: user.id }),
        };
    }

    private getJwtToken(payload: JwtPayload) {
        const token = this.jwtService.sign(payload);
        return token;
    }

    private handleDBErrors(error: any): never {
        if (error.code === 11000) {
            throw new BadRequestException(
                `User exists in db ${JSON.stringify(error.keyValue)}`,
            );
        }
        console.log(error);
        throw new InternalServerErrorException('Please check server logs');
    }
}
