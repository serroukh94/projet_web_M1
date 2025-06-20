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
    return this.userModel.findOne().lean();
  }

  @Query(() => [Conversation])
  async conversations(): Promise<Conversation[]> {
    return this.convModel.find().populate(['participants', 'messages']).lean();
  }

  @Query(() => Conversation, { nullable: true })
  async conversation(@Args('id', { type: () => ID }) id: string) {
    return this.convModel.findById(id).populate(['participants', 'messages']).lean();
  }

  // Mutations
  @Mutation(() => User)
  async createUser(@Args('username') username: string): Promise<User> {
    return this.userModel.create({ username });
  }
}
