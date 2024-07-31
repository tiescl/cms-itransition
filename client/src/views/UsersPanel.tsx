import { useState, useContext, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import UserContext from '../context/UserContext';
import ThemeContext from '../context/ThemeContext';

import { UserRow } from '../components/users/UsersPanelTiny';
import User from '../types/User';
import { useQuery } from '@tanstack/react-query';
import LoadingScreen from '../components/layout/LoadingScreen';

function AdminPanel() {
  let { t } = useTranslation();
  var { user } = useContext(UserContext);
  var { theme } = useContext(ThemeContext);

  var [selectedUsers, setSelectedUsers] = useState<string[]>([]),
    [isCheckedAll, setIsCheckedAll] = useState(false);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  var {
    data: userList,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      let response = await fetch(`${prodUrl}/api/users`);
      if (response.ok) {
        return await response.json();
      } else {
        let errorData = await response.json();
        throw new Error(errorData.error);
      }
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 20 * 60 * 1000
  });

  let handleBlock = async () => {
    try {
      let property = 'isBlocked';
      let value = true;

      let response = await fetch(`${prodUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers, property, value })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        refetch();
      } else {
        throw new Error('users_block_unsuccessful');
      }
    } catch (error) {
      console.error('Error blocking users:', (error as Error)?.message);
    }
  };

  let handleUnblock = async () => {
    try {
      let property = 'isBlocked';
      let value = false;

      let response = await fetch(`${prodUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers, property, value })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        refetch();
      } else {
        throw new Error('users_unblock_unsuccessful');
      }
    } catch (error) {
      console.error('Error unblocking users:', error);
    }
  };

  let handleDelete = async () => {
    try {
      let response = await fetch(`${prodUrl}/api/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        refetch();
      } else {
        throw new Error('user_deletion_unsuccessful');
      }
    } catch (error) {
      console.error('Error deleting users:', (error as Error)?.message);
    }
  };

  let handleMakeAdmin = async () => {
    try {
      let property = 'isAdmin';
      let value = true;

      let response = await fetch(`${prodUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers, property, value })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        refetch();
      } else {
        throw new Error('promotion_unsuccessful');
      }
    } catch (error) {
      console.error('Error promoting users:', (error as Error)?.message);
    }
  };

  let handleAdminDelete = async () => {
    try {
      let property = 'isAdmin';
      let value = false;

      let response = await fetch(`${prodUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers, property, value })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        refetch();
      } else {
        throw new Error('demotion_unsuccessful');
      }
    } catch (error) {
      console.error('Error demoting users:', (error as Error)?.message);
    }
  };

  function handleSelectionChange(
    e: ChangeEvent<HTMLInputElement>,
    userEmail: string
  ) {
    setSelectedUsers((prevSelected) => {
      if (e.target.checked) {
        return [...prevSelected, userEmail];
      } else {
        return prevSelected.filter((id) => id != userEmail);
      }
    });
  }

  function handleSelectAllChange() {
    setIsCheckedAll(!isCheckedAll);
    setSelectedUsers(
      !isCheckedAll ? userList?.map((user: User) => user.email) : []
    );
  }

  return (
    <>
      <h1
        style={{
          marginTop: '125px',
          marginBottom: '30px',
          fontSize: '40px',
          fontWeight: '500'
        }}
        className='text-center'
      >
        {t('panel.heading')}
      </h1>

      {user && user.isAdmin ? (
        <div className='container-fluid px-4 px-md-5'>
          <button
            className={`btn text-${
              theme == 'light' ? 'black' : 'light'
            } border-2 fw-bold btn-outline-success mb-2 mx-1`}
            onClick={handleBlock}
          >
            {t('panel.block')} 🔒
          </button>
          <button
            className={`btn btn-outline-success text-${
              theme == 'light' ? 'black' : 'light'
            } border-2 fw-bold mb-2 mx-1`}
            onClick={handleUnblock}
          >
            {t('panel.unblock')} 🔓
          </button>
          <button
            className={`btn btn-outline-danger text-${
              theme == 'light' ? 'black' : 'light'
            } border-2 fw-bold mb-2 mx-1`}
            onClick={handleDelete}
          >
            {t('panel.delete')} 🗑️
          </button>
          <div
            style={{
              display: 'inline',
              borderLeft: '2px solid gray',
              height: '20px',
              margin: '0 20px'
            }}
          ></div>
          <button
            className={`btn btn-${
              theme == 'light' ? 'dark' : 'light'
            } border-2  fw-semibold mb-2 mx-1`}
            onClick={handleMakeAdmin}
          >
            {t('panel.promote')} 👑
          </button>
          <button
            className='btn btn-warning border-2 fw-semibold mb-2 mx-1'
            onClick={handleAdminDelete}
          >
            {t('panel.demote')} 🪓
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingScreen message='loading.users' />
      ) : (
        <div className='container-fluid text-center table-responsive px-4 px-md-5'>
          <table className='table table-striped table-bordered table-hover table-md'>
            <caption className='text-center'>
              {userList.length}{' '}
              {userList.length == 1
                ? t('panel.caption.singular')
                : t('panel.caption.plural')}
            </caption>
            <thead className={`table-${theme}`}>
              <tr className='align-middle'>
                <th>
                  {t('panel.selection')}
                  <input
                    type='checkbox'
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'block'
                    }}
                    className='form-check-input mx-auto'
                    checked={isCheckedAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
                <th style={{ minWidth: '200px' }}>
                  {t('panel.username')}
                </th>
                <th>{t('emailLabel')}</th>
                <th>{t('user.collections')}</th>
                <th style={{ minWidth: '240px' }}>
                  {t('user.lastLogin')}
                </th>
                <th style={{ minWidth: '240px' }}>
                  {t('user.registered')}
                </th>
                <th style={{ minWidth: '70px' }}>{t('user.status')}</th>
              </tr>
            </thead>
            <tbody>
              {userList &&
                userList.map((u: User) => (
                  <UserRow
                    key={u._id}
                    user={u}
                    selectedUsers={selectedUsers}
                    onChange={handleSelectionChange}
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminPanel;
