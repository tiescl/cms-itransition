import { Link, useParams } from 'react-router-dom';
import stringifyDate from '../../utils/stringifyDate.js';

export function UserRow({ user, selectedUsers, onChange }) {
  return (
    <tr style={{ verticalAlign: 'middle' }}>
      <td className='col-sm-1'>
        <CheckBox
          user={user}
          selectedUsers={selectedUsers}
          onChange={onChange}
        />
      </td>
      <td>
        <Link
          to={`/users/${user._id}`}
          className='text-primary text-decoration-none'
        >
          {user.username} {user.isAdmin ? '👑' : ''}
        </Link>
      </td>
      <td>{user.email}</td>
      <td>
        {Array.isArray(user.collections)
          ? user.collections?.length
          : user.collections !== undefined
          ? 1
          : 0}
      </td>
      <td>{stringifyDate(user.lastLoginDate)}</td>
      <td>{stringifyDate(user.registerDate)}</td>
      <td>
        <StatusWrapper
          status={user.isBlocked ? 'blocked' : 'active'}
          accentColor={user.isBlocked ? 'red' : 'darkorange'}
        />
      </td>
    </tr>
  );
}

export function StatusWrapper({ status, accentColor }) {
  const styling = {
    border: '2px solid',
    borderColor: accentColor,
    borderRadius: '7px',
    color: accentColor,
    padding: '2px 4px'
  };
  return <span style={styling}>{status}</span>;
}

export function CheckBox({ user, selectedUsers, onChange }) {
  return (
    <input
      type='checkbox'
      style={{ width: '20px', height: '20px' }}
      className='form-check-input mx-auto'
      checked={selectedUsers?.includes(user.email)}
      onChange={(e) => onChange(e, user.email)}
    />
  );
}
