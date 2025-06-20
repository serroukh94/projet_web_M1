import { useState } from 'react';
import './App.css';
import UserForm from './components/UserForm';
import UsersList from './components/UsersList';
import ConversationList from './components/ConversationList';
import ConversationDetails from './components/ConversationDetails';
import type { User, Conversation, Message } from './types';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const nextUserId = users.length + 1;
  const nextConvId = conversations.length + 1;

  function handleCreateUser(user: User) {
    setUsers([...users, user]);
  }

  function handleSelectUser(user: User) {
    setSelectedUser(user);
    setSelectedConv(null);
  }

  function handleSelectConv(conv: Conversation) {
    setSelectedConv(conv);
  }

  function handleStartConversation(other: User) {
    if (!selectedUser) return;
    const existing = conversations.find(
      (c) =>
        c.participants.includes(selectedUser.id) &&
        c.participants.includes(other.id)
    );
    if (existing) {
      setSelectedConv(existing);
      return;
    }
    const newConv: Conversation = {
      id: nextConvId,
      participants: [selectedUser.id, other.id],
      messages: [],
    };
    setConversations([...conversations, newConv]);
    setSelectedConv(newConv);
  }

  function handleSendMessage(text: string) {
    if (!selectedConv || !selectedUser) return;
    const newMsg: Message = {
      id: selectedConv.messages.length + 1,
      senderId: selectedUser.id,
      content: text,
      timestamp: new Date().toISOString(),
    };
    const updatedConv: Conversation = {
      ...selectedConv,
      messages: [...selectedConv.messages, newMsg],
    };
    setConversations(
      conversations.map((c) => (c.id === updatedConv.id ? updatedConv : c))
    );
    setSelectedConv(updatedConv);
  }

  const userConvs = selectedUser
    ? conversations.filter((c) => c.participants.includes(selectedUser.id))
    : [];

  const otherUsers = selectedUser
    ? users.filter((u) => u.id !== selectedUser.id)
    : [];

  return (
    <div className="App">
      <h1>Messagerie</h1>
      <UserForm onCreate={handleCreateUser} nextId={nextUserId} />
      <UsersList users={users} onSelect={handleSelectUser} />
      {selectedUser && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <h2>Bienvenue {selectedUser.name}</h2>
            {otherUsers.length > 0 && (
              <div>
                <h4>Démarrer une conversation</h4>
                {otherUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversation(u)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Avec {u.name}
                  </button>
                ))}
              </div>
            )}
            <ConversationList
              conversations={userConvs}
              onSelect={handleSelectConv}
            />
          </div>
          <ConversationDetails
            conversation={selectedConv}
            users={users}
            onSendMessage={handleSendMessage}
          />
        </div>
      )}
    </div>
  );
}

export default App;