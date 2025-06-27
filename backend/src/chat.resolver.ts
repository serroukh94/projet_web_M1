import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Resolver()
export class ChatResolver {
  constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      @InjectModel(Conversation.name) private convModel: Model<ConversationDocument>,
  ) {}

  // Queries
  @Query(() => User, { nullable: true })
  async me(): Promise<User | null> {
    return this.userModel.findOne();
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userModel.find();
  }

  @Query(() => [Conversation])
  async conversations(): Promise<Conversation[]> {
    return this.convModel.find().populate([
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
  async createConversation(
      @Args({ name: 'participantIds', type: () => [ID] }) participantIds: string[]
  ): Promise<Conversation> {
    console.log('APPEL MUTATION', participantIds);
    if (!participantIds || !participantIds.length || participantIds.includes(undefined) || participantIds.includes(null)) {
      throw new Error('participantIds manquants ou invalides');
    }

    const conv = await this.convModel.create({
      participants: participantIds,
      messages: [],
    });

    return this.convModel.findById(conv._id).populate([
      { path: 'participants' },
      { path: 'messages', populate: { path: 'author' }, options: { strictPopulate: false } }
    ]);
  }

}
