import { Injectable } from '@nestjs/common';
import { conversations, messages, users } from './datastore';
import { Message } from './models/message.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageService {
  async saveFinalMessage(data: { conversationId: string; content: string }): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      content: data.content,
      author: users[0],
      createdAt: new Date().toISOString(),
    };
    let conv = conversations.find(c => c.id === data.conversationId);
    if (!conv) {
      conv = { id: data.conversationId, participants: [], messages: [] };
      conversations.push(conv);
    }
    conv.messages.push(message);
    messages.push(message);
    return message;
  }
}

