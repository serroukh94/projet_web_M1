import { useState, type FormEvent } from 'react';
import type { Conversation } from '../types';

type Props = {
  conversation: Conversation | null;
  onSendMessage: (text: string) => void;
};

export default function ConversationDetails({ conversation, onSendMessage }: Props) {
  if (!conversation) return <div>Sélectionnez une conversation</div>;

  const [text, setText] = useState('');



  function handleSend(e: FormEvent) {
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