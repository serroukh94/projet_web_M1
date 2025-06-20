import { Conversation } from '../types';

type Props = {
  conversations: Conversation[];
  onSelect: (conv: Conversation) => void;
};

export default function ConversationList({ conversations, onSelect }: Props) {
  return (
    <div>
      <h3>Conversations</h3>
      <ul>
        {conversations.map((c) => (
          <li key={c.id}>
            <button onClick={() => onSelect(c)}>
              Conversation #{c.id} ({c.participants.join(', ')})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}