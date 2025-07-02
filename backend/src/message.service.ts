import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Injectable()
export class MessageService {
  constructor(
      @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
      @InjectModel(Conversation.name) private readonly convModel: Model<ConversationDocument>,
  ) {}

  async saveFinalMessage(data: { conversationId: string, content: string, authorId: string }) {
    const message = await this.messageModel.create({
      content: data.content,
      author: data.authorId,
    });

    await this.convModel.findByIdAndUpdate(
        data.conversationId,
        { $push: { messages: message._id } }
    );

    // 3. On retourne le message populé (important !)
    return this.messageModel.findById(message._id).populate('author');
  }
}
