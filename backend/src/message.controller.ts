import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { pubSub } from './pubsub';
import { MessageService } from './message.service';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @EventPattern('new_message')
  async handleNewMessage(@Payload() data: any, @Ctx() context: RmqContext) {
    const saved = await this.messageService.saveFinalMessage(data);
    pubSub.publish('messageAdded', { messageAdded: saved, conversationId: data.conversationId });
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}

