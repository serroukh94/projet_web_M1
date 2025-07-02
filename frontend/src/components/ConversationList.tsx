import type { Conversation } from '../types';

type Props = {
  conversations: Conversation[];
  onSelect: (conv: Conversation) => void;
};

export default function ConversationList({ conversations, onSelect }: Props) {
  return (
    <div>
      <h3>Conversations</h3>
      <ul>
        {conversations.map((c) => {
          const noms = c.participants.map((p) => p.username).join(', ');
          return (
            <li key={c.id}>
              <button onClick={() => onSelect(c)}>
                💬 {noms}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
