import { useState, useEffect } from 'react';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
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

const REGISTER_MUTATION = gql`
  mutation ($data: RegisterInput!) {
    register(data: $data)
  }
`;

const LOGIN_MUTATION = gql`
  mutation ($data: LoginInput!) {
    login(data: $data)
  }
`;

const ME_QUERY = gql`
  query {
    me { id username createdAt }
  }
`;

const CREATE_CONVERSATION_MUTATION = gql`
  mutation ($participantIds: [ID!]!) {
    createConversation(participantIds: $participantIds) {
      id
      createdAt
      participants { id username createdAt }
      messages { id content createdAt author { id username } }
    }
  }
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
      conversationId
    }
  }
`;


function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const { data: meData } = useQuery<{ me: User | null }>(ME_QUERY, { skip: !localStorage.getItem('token') });
  const { data: usersData } = useQuery<{ users: User[] }>(USERS_QUERY, { skip: !localStorage.getItem('token') });
  const { data: convData } = useQuery<{ conversations: Conversation[] }>(CONVERSATIONS_QUERY, {
    skip: !localStorage.getItem('token'),
    pollInterval: 500,
  });

  const [register] = useMutation(REGISTER_MUTATION);
  const [login] = useMutation(LOGIN_MUTATION);

  const [createConversation] = useMutation(CREATE_CONVERSATION_MUTATION, {
    update(cache, { data }) {
      const newConv = data?.createConversation as Conversation | undefined;
      if (!newConv) return;
      cache.updateQuery<{ conversations: Conversation[] }>({ query: CONVERSATIONS_QUERY }, (old) => {
        if (!old) return { conversations: [newConv] };
        return { conversations: [...old.conversations, newConv] };
      });
    },
  });

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION);

  useSubscription(MESSAGE_ADDED_SUB, {
    variables: { conversationId: selectedConv?.id ?? '' },
    skip: !selectedConv,
    onData: ({ data }) => {
      const msg = data.data?.messageAdded as Message & { conversationId?: string } | undefined;
      if (!msg) return;
      setConversations((cs) =>
          cs.map((c) =>
              String(c.id) === String(msg.conversationId ?? selectedConv?.id)
                  ? { ...c, messages: [...c.messages, msg] }
                  : c
          )
      );
    }
  });

  useEffect(() => {
    if (usersData) setUsers(usersData.users);
  }, [usersData]);

  useEffect(() => {
    if (meData) setCurrentUser(meData.me);
  }, [meData]);

  useEffect(() => {
    if (convData) setConversations(convData.conversations);
  }, [convData]);

  useEffect(() => {
    if (!selectedConv) return;
    const convMaj = conversations.find((c) => c.id === selectedConv.id);
    if (convMaj && convMaj !== selectedConv) {
      setSelectedConv(convMaj);
    }
  }, [conversations, selectedConv]);



  function handleSelectConv(conv: Conversation) {
    setSelectedConv(conv);
  }

  async function handleStartConversation(other: User) {
    if (!currentUser) return;
    const existing = conversations.find(
        (c) =>
            c.participants.some((p) => String(p.id) === String(currentUser.id)) &&
            c.participants.some((p) => String(p.id) === String(other.id))
    );
    if (existing) {
      setSelectedConv(existing);
      return;
    }
    const { data } = await createConversation({
      variables: { participantIds: [other.id] },
    });
    if (data?.createConversation) {
      setConversations([...conversations, data.createConversation]);
      setSelectedConv(data.createConversation);
    }
  }

  function handleSendMessage(text: string) {
    if (!selectedConv || !currentUser) return;
    sendMessage({
      variables: {
        conversationId: selectedConv.id,
        content: text,
      },
    });
  }

  async function handleRegister(data: { username: string; password: string }) {
    const res = await register({ variables: { data } });
    const token = res.data?.register as string | undefined;
    if (token) {
      localStorage.setItem('token', token);
      window.location.reload();
    }
  }

  async function handleLogin(data: { username: string; password: string }) {
    const res = await login({ variables: { data } });
    const token = res.data?.login as string | undefined;
    if (token) {
      localStorage.setItem('token', token);
      window.location.reload();
    }
  }

  const userConvs = currentUser
      ? conversations.filter((c) => c.participants.some((p) => String(p.id) === String(currentUser.id)))
      : [];

  const otherUsers = currentUser
      ? users.filter((u) => u.id !== currentUser.id)
      : [];

  return (
      <div className="App">
        <h1>Messagerie</h1>
        {!currentUser && (
          <div>
            <RegisterForm onRegister={handleRegister} />
            <LoginForm onLogin={handleLogin} />
          </div>
        )}
        {currentUser && (
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              <div>
                <h2>Bienvenue {currentUser.username}</h2>
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
