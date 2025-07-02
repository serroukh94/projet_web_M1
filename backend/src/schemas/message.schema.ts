import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.schema';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Prop({ required: true })
  @Field()
  content: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Field(() => User)
  author: Types.ObjectId | User;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  conversationId?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
