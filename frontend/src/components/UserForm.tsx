import { useState, FormEvent } from 'react';
import { User } from '../types';

type Props = {
  onCreate: (user: User) => void;
  nextId: number;
};

export default function UserForm({ onCreate, nextId }: Props) {
  const [name, setName] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ id: nextId, name });
    setName('');
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom"
      />
      <button type="submit">Créer le profil</button>
    </form>
  );
}