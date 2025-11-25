import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true })
    chatId: string;

    @Prop({ required: true, enum: ['user', 'ai', 'ai-posts'] })
    sender: string;

    @Prop({ required: true })
    content: string;

    @Prop({ enum: ['text', 'image', 'video'], default: 'text' })
    type: string;

    @Prop()
    mediaUrl: string;

    @Prop({ type: Object })
    metadata: any;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
