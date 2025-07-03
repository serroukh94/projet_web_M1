import { useState, type FormEvent } from 'react';
type Props = {
  onCreate: (username: string) => void;
};

export default function UserForm({ onCreate }: Props) {
  const [name, setName] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name);
    setName('');
  }

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom"
      />
      <button type="submit">Créer le profil</button>
    </form>
  );
}