import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private convModel: Model<ConversationDocument>,
  ) {}

  async saveFinalMessage(data: { conversationId: string; content: string; authorId: string }) {
    // 1) Création du message
    const msg = await this.messageModel.create({
      content: data.content,
      author: new Types.ObjectId(data.authorId),
    });

    // 2) Upsert de la conversation + push du message
    await this.convModel.findByIdAndUpdate(
      data.conversationId,
      {
        $setOnInsert: { participants: [data.authorId] },
        $push: { messages: msg._id },
      },
      { upsert: true, new: true },
    );

    // 3) Peupler l'auteur pour le retour GraphQL
    return this.messageModel.findById(msg._id).populate('author').lean();
  }
}
