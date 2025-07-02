import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { pubSub } from './pubsub';
import { MessageService } from './message.service';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @EventPattern('new_message')
  async handleNewMessage(@Payload() data: any) {
    try {
      const saved = await this.messageService.saveFinalMessage(data);
      await saved.populate('author');


      pubSub.publish('messageAdded', {
        messageAdded: {
          ...saved.toObject(),
          conversationId: data.conversationId
        },
        conversationId: data.conversationId,
      });
    } catch (err) {
      console.error('Erreur dans handleNewMessage:', err);
    }
  }
}
