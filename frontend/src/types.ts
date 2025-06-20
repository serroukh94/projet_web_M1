export interface User {
  id: number;
  name: string;
}

export interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: number;
  participants: number[]; // user ids
  messages: Message[];
}