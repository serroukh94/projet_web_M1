import { Args, ID, Mutation, Resolver, Subscription } from "@nestjs/graphql";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RabbitMQService } from "./rabbitmq.service";
import { pubSub } from "./pubsub";
import { Message } from "./schemas/message.schema";
import { User, UserDocument } from "./schemas/user.schema";

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly rabbitmq: RabbitMQService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  // ──────────────────────────────────────────────────────────────
  // Mutation : envoie un message
  // ──────────────────────────────────────────────────────────────
  @Mutation(() => Message)
  async sendMessage(
    @Args("conversationId", { type: () => ID }) conversationId: string,
    @Args("content") content: string
  ): Promise<Message> {
    // 1) tente de récupérer l’utilisateur courant
    const authorDoc = await this.userModel.findOne(); 
    const author = authorDoc
      ? {
          id: authorDoc.id, // getter mongoose -> string
          username: authorDoc.username,
          createdAt: authorDoc.createdAt,
        }
      : {
          id: new Types.ObjectId().toHexString(),
          username: "temp",
          createdAt: new Date(),
        };

    // 2) publish sur Rabbit et retour optimiste
    this.rabbitmq.sendMessage("new_message", {
      conversationId,
      content,
      authorId: author.id,
    });

    return {
      id: new Types.ObjectId().toHexString(), // id temporaire du message
      content,
      author, // toujours avec id
      createdAt: new Date(),
    } as Message;
  }

  // ──────────────────────────────────────────────────────────────
  // Subscription : écoute des nouveaux messages d'une conversation
  // ──────────────────────────────────────────────────────────────
  @Subscription(() => Message, {
    filter: (payload, variables) =>
      payload.messageAdded.conversationId === variables.conversationId,
  })
  messageAdded(@Args("conversationId") _id: string) {
    return pubSub.asyncIterableIterator("messageAdded");
  }
}
