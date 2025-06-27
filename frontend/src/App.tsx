import { useState, useEffect } from 'react';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import './App.css';
import UserForm from './components/UserForm';
import UsersList from './components/UsersList';
import ConversationList from './components/ConversationList';
import ConversationDetails from './components/ConversationDetails';
import type { User, Conversation, Message } from './types';

const USERS_QUERY = gql`
  query {
    users { id username createdAt }
  }
`;

const CONVERSATIONS_QUERY = gql`
  query {
    conversations {
      id
      createdAt
      participants { id username createdAt }
      messages { id content createdAt author { id username } }
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation ($username: String!) { createUser(username: $username) { id username createdAt } }
`;

const SEND_MESSAGE_MUTATION = gql`
  mutation ($conversationId: ID!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
      id
      content
      createdAt
      author { id username }
    }
  }
`;

const MESSAGE_ADDED_SUB = gql`
  subscription ($conversationId: String!) {
    messageAdded(conversationId: $conversationId) {
      id
      content
      createdAt
      author { id username }
    }
  }
`;


function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const { data: usersData, refetch: refetchUsers } = useQuery<{ users: User[] }>(USERS_QUERY);
  const { data: convData, refetch: refetchConvs } = useQuery<{ conversations: Conversation[] }>(CONVERSATIONS_QUERY);

  const [createUser] = useMutation(CREATE_USER_MUTATION, {
    onCompleted: () => refetchUsers(),
    update(cache, { data }) {
      const newUser = data?.createUser as User | undefined;
      if (!newUser) return;
      cache.updateQuery<{ users: User[] }>({ query: USERS_QUERY }, (old) => {
        if (!old) return { users: [newUser] };
        return { users: [...old.users, newUser] };
      });
    },
  });

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
    onCompleted: () => refetchConvs()
  });

  useSubscription(MESSAGE_ADDED_SUB, {
    variables: { conversationId: selectedConv?.id ?? '' },
    skip: !selectedConv,
    onData: ({ data }) => {
      const msg = data.data?.messageAdded as Message | undefined;
      if (!msg) return;
      setConversations((cs) =>
        cs.map((c) =>
          c.id === selectedConv?.id ? { ...c, messages: [...c.messages, msg] } : c
        )
      );
    }
  });

  useEffect(() => {
    if (usersData) setUsers(usersData.users);
  }, [usersData]);

  useEffect(() => {
    if (convData) setConversations(convData.conversations);
  }, [convData]);

  function handleCreateUser(name: string) {
    createUser({ variables: { username: name } });
  }

  function handleSelectUser(user: User) {
    setSelectedUser(user);
    setSelectedConv(null);
  }

  function handleSelectConv(conv: Conversation) {
    setSelectedConv(conv);
  }

  function generateId() {
    const array = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  function handleStartConversation(other: User) {
    if (!selectedUser) return;
    const existing = conversations.find(
      (c) =>
        c.participants.some((p) => p.id === selectedUser.id) &&
        c.participants.some((p) => p.id === other.id)
    );
    if (existing) {
      setSelectedConv(existing);
      return;
    }
    const newConv: Conversation = {
      id: generateId(),
      participants: [selectedUser, other],
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations([...conversations, newConv]);
    setSelectedConv(newConv);
  }

  function handleSendMessage(text: string) {
    if (!selectedConv || !selectedUser) return;
    sendMessage({ variables: { conversationId: selectedConv.id, content: text } });
  }

  const userConvs = selectedUser
    ? conversations.filter((c) => c.participants.some((p) => p.id === selectedUser.id))
    : [];

  const otherUsers = selectedUser
    ? users.filter((u) => u.id !== selectedUser.id)
    : [];

  return (
    <div className="App">
      <h1>Messagerie</h1>
      <UserForm onCreate={handleCreateUser} />
      <UsersList users={users} onSelect={handleSelectUser} />
      {selectedUser && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <h2>Bienvenue {selectedUser.username}</h2>
            {otherUsers.length > 0 && (
              <div>
                <h4>Démarrer une conversation</h4>
                {otherUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversation(u)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Avec {u.username}
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
            onSendMessage={handleSendMessage}
          />
        </div>
      )}
    </div>
  );
}

export default App;