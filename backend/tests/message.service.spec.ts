import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MessageService } from '../src/message.service';
import { Message } from '../src/schemas/message.schema';
import { Conversation } from '../src/schemas/conversation.schema';


// helpers de mock
const createModelMock = () => ({
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
});

describe('MessageService', () => {
  let service: MessageService;
  const msgModelMock = createModelMock();
  const convModelMock = createModelMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: getModelToken(Message.name), useValue: msgModelMock },
        { provide: getModelToken(Conversation.name), useValue: convModelMock },
      ],
    }).compile();

    service = module.get(MessageService);
  });

  afterEach(() => jest.clearAllMocks());

  it('crée le message + l’ajoute à la conversation + renvoie le message populé', async () => {
    // Arrange
    const fakeData = { conversationId: 'c1', content: 'Hi', authorId: 'u1' };
    const createdMsg: any = { _id: 'm1' };
    msgModelMock.create.mockResolvedValue(createdMsg);
    msgModelMock.populate.mockResolvedValue({ id: 'm1', content: 'Hi' });

    // Act
    const result = await service.saveFinalMessage(fakeData);

    // Assert
    expect(msgModelMock.create).toHaveBeenCalledWith({
      content: 'Hi',
      author: 'u1',
    });
    expect(convModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      'c1',
      { $push: { messages: createdMsg._id } },
    );
    expect(msgModelMock.findById).toHaveBeenCalledWith(createdMsg._id);
    expect(result).toEqual({ id: 'm1', content: 'Hi' });
  });
});
