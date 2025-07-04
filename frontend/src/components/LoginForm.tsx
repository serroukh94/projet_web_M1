import { useState } from 'react';
import type { FormEvent } from 'react';

interface Props {
  onLogin: (data: { username: string; password: string }) => void;
}

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onLogin({ username, password });
  }

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h3>Connexion</h3>
      <input
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Se connecter</button>
    </form>
  );
}
