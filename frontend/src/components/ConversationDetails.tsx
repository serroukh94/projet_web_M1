import { useState } from "react";
import { Conversation, User } from '../types';

type Props = {
  conversation: Conversation | null;
  users: User[];
  onSendMessage: (text: string) => void;
};

export default function ConversationDetails({ conversation, users, onSendMessage }: Props) {
  if (!conversation) return <div>Sélectionnez une conversation</div>;

  const [text, setText] = useState('');

  function getUserName(id: number) {
    return users.find((u) => u.id === id)?.name || 'Unknown';
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  }

  return (
    <div>
      <h3>Détails de la conversation #{conversation.id}</h3>
      <ul>
        {conversation.messages.map((m) => (
          <li key={m.id}>
            <strong>{getUserName(m.senderId)}:</strong> {m.content}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSend}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Votre message"
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}