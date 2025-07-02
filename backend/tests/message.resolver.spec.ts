import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MessageResolver } from '../src/message/message.resolver';
import { RabbitMQService } from '../src/rabbitmq/rabbitmq.service';
import { User } from '../src/schemas/user.schema';
import { Message } from '../src/schemas/message.schema';

const rabbitMock = { sendMessage: jest.fn() };
const userModelMock = {
  findById: jest.fn(),
};
const messageModelMock = {}; // non utilisé directement

describe('MessageResolver', () => {
  let resolver: MessageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageResolver,
        { provide: RabbitMQService, useValue: rabbitMock },
        { provide: getModelToken(User.name), useValue: userModelMock },
        { provide: getModelToken(Message.name), useValue: messageModelMock },
      ],
    }).compile();

    resolver = module.get(MessageResolver);
  });

  afterEach(() => jest.clearAllMocks());

  it('envoie le message dans Rabbit et renvoie un objet optimiste', async () => {
    // Arrange
    const authorDoc: any = {
      id: 'u1',
      username: 'Alice',
      createdAt: new Date('2025-01-01'),
    };
    userModelMock.findById.mockResolvedValue(authorDoc);

    // Act
    const res = await resolver.sendMessage('c1', 'Hello', 'u1');

    // Assert : Rabbit
    expect(rabbitMock.sendMessage).toHaveBeenCalledWith('new_message', {
      conversationId: 'c1',
      content: 'Hello',
      authorId: 'u1',
    });

    // Assert : retour optimiste
    expect(res.content).toBe('Hello');
    expect((res.author as User).username).toBe('Alice');
    expect(Types.ObjectId.isValid(res.id)).toBe(true);
  });
});
