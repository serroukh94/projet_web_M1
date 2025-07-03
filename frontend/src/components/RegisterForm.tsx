import { useState } from 'react';
import type { FormEvent } from 'react';

interface Props {
  onRegister: (data: { username: string; password: string }) => void;
}

export default function RegisterForm({ onRegister }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onRegister({ username, password });
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <h3>Inscription</h3>
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
      <button type="submit">S'inscrire</button>
    </form>
  );
}
