export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  createdAt: string;
}