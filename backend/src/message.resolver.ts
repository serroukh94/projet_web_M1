import { Args, ID, Mutation, Resolver, Subscription } from "@nestjs/graphql";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RabbitMQService } from "./rabbitmq.service";
import { pubSub } from "./pubsub";
import { Message, MessageDocument } from "./schemas/message.schema";
import { User, UserDocument } from "./schemas/user.schema";

@Resolver(() => Message)
export class MessageResolver {
  constructor(
      private readonly rabbitmq: RabbitMQService,
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
      @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>
  ) {}

  @Mutation(() => Message)
  async sendMessage(
      @Args("conversationId", { type: () => ID }) conversationId: string,
      @Args("content") content: string,
      @Args("authorId", { type: () => ID }) authorId: string
  ): Promise<Message> {

    const authorDoc = await this.userModel.findById(authorId);
    const author = authorDoc
        ? {
          id: authorDoc.id,
          username: authorDoc.username,
          createdAt: authorDoc.createdAt,
        }
        : {
          id: new Types.ObjectId().toHexString(),
          username: "temp",
          createdAt: new Date(),
        };


    this.rabbitmq.sendMessage("new_message", {
      conversationId,
      content,
      authorId: author.id,
    });

    return {
      id: new Types.ObjectId().toHexString(),
      content,
      author,
      createdAt: new Date(),
    } as Message;
  }


  @Subscription(() => Message, {
    filter: (payload, variables) =>
        payload.messageAdded.conversationId === variables.conversationId,
  })
  messageAdded(@Args("conversationId") _id: string) {
    return pubSub.asyncIterableIterator("messageAdded");
  }
}
