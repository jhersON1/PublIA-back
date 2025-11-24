import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    lastname: string;

    @Prop({ type: [String], default: ['user'] })
    roles: string[];

    @Prop({ default: true })
    isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
