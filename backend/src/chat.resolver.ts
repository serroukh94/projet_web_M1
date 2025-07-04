import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { GqlAuthGuard } from './auth/gql-auth.guard';
import { CurrentUser } from './auth/current-user.decorator';

@Resolver()
export class ChatResolver {
  constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      @InjectModel(Conversation.name) private convModel: Model<ConversationDocument>,
  ) {}

  // Queries
  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: { userId: string }): Promise<User | null> {
    return this.userModel.findById(user.userId);
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userModel.find();
  }

  @Query(() => [Conversation])
  @UseGuards(GqlAuthGuard)
  async conversations(@CurrentUser() user: { userId: string }): Promise<Conversation[]> {
    return this.convModel
      .find({ participants: user.userId })
      .populate([
        { path: 'participants' },
        { path: 'messages', populate: { path: 'author' }, options: { strictPopulate: false } }
      ]);
  }

  @Query(() => Conversation, { nullable: true })
  async conversation(@Args('id', { type: () => ID }) id: string) {
    return this.convModel.findById(id).populate([
      { path: 'participants' },
      { path: 'messages', populate: { path: 'author' }, options: { strictPopulate: false } }
    ]);
  }

  // Mutations
  @Mutation(() => User)
  async createUser(@Args('username') username: string): Promise<User> {
    return this.userModel.create({ username });
  }

  @Mutation(() => Conversation)
  @UseGuards(GqlAuthGuard)
  async createConversation(
    @Args({ name: 'participantIds', type: () => [ID] }) participantIds: string[],
    @CurrentUser() user: { userId: string },
  ): Promise<Conversation> {
    if (!participantIds || participantIds.includes(undefined) || participantIds.includes(null)) {
      throw new Error('participantIds manquants ou invalides');
    }

    const uniqueIds = Array.from(new Set([user.userId, ...participantIds]));

    const conv = await this.convModel.create({
      participants: uniqueIds,
      messages: [],
    });

    return this.convModel.findById(conv._id).populate([
      { path: 'participants' },
      { path: 'messages', populate: { path: 'author' }, options: { strictPopulate: false } }
    ]);
  }

}
