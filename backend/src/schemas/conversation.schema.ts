import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.schema';
import { Message } from './message.schema';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Conversation {
  @Field(() => ID)
  id: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }] })
  @Field(() => [User])
  participants: Types.ObjectId[] | User[];

  @Prop({ type: [{ type: Types.ObjectId, ref: Message.name }] })
  @Field(() => [Message])
  messages: Types.ObjectId[] | Message[];

  @Field()
  createdAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
