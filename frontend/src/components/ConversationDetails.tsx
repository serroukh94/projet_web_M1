import { useState, type FormEvent } from 'react';
import type { Conversation } from '../types';

type Props = {
  conversation: Conversation | null;
  onSendMessage: (text: string) => void;
};

export default function ConversationDetails({ conversation, onSendMessage }: Props) {
  const [text, setText] = useState('');
  if (!conversation) return <div className="conversation-details">Sélectionnez une conversation</div>;



  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  }

  return (
    <div className="conversation-details">
      <h3>Détails de la conversation</h3>
      <ul>
        {conversation.messages.map((m) => (
          <li key={m.id}>
            <strong>{m.author.username}:</strong> {m.content}
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