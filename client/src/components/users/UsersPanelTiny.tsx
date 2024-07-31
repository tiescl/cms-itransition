import { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import stringifyDate from '../../utils/stringifyDate';
import User from '../../types/User';

interface IRowProps {
  user: User;
  selectedUsers: string[];
  onChange: (e: ChangeEvent<HTMLInputElement>, email: string) => void;
}

export function UserRow({ user, selectedUsers, onChange }: IRowProps) {
  let { t, i18n } = useTranslation();
  var [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    setForceUpdate(!forceUpdate);
  }, [i18n.language]);

  return (
    <tr className='align-middle'>
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
      <td>{user.collections.length}</td>
      <td>{stringifyDate(user.lastLoginDate, t, forceUpdate)}</td>
      <td>{stringifyDate(user.registerDate, t, forceUpdate)}</td>
      <td>
        <StatusWrapper
          status={
            user.isBlocked
              ? t('user.status.blocked')
              : t('user.status.active')
          }
          accentColor={user.isBlocked ? 'red' : 'darkorange'}
        />
      </td>
    </tr>
  );
}

interface IWrapperProps {
  status: string;
  accentColor: string;
}

export function StatusWrapper({ status, accentColor }: IWrapperProps) {
  let styling = {
    border: '2px solid',
    borderColor: accentColor,
    borderRadius: '7px',
    color: accentColor,
    padding: '2px 4px'
  };
  return <span style={styling}>{status}</span>;
}

interface ICheckBoxProps {
  user: User;
  selectedUsers: string[];
  onChange: (e: ChangeEvent<HTMLInputElement>, email: string) => void;
}

export function CheckBox({
  user,
  selectedUsers,
  onChange
}: ICheckBoxProps) {
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
