import type { User } from '../types';

type Props = {
  users: User[];
  onSelect: (user: User) => void;
};

export default function UsersList({ users, onSelect }: Props) {
  return (
    <div className="users-list">
      <h3>Utilisateurs</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <button onClick={() => onSelect(u)}>{u.username}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}