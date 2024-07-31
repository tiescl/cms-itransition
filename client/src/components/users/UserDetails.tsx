import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';

import stringifyDate from '../../utils/stringifyDate';
import { StatusWrapper } from './UsersPanelTiny';

import User from '../../types/User';
import Collection from '../../types/Collection';

interface IUserDetailsProps {
  pageUser: User;
  contextUser: User | null;
  setError: (err: string) => void;
}

function UserDetails({
  pageUser,
  contextUser,
  setError
}: IUserDetailsProps) {
  let navigate = useNavigate();
  let { t, i18n } = useTranslation();
  var [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    setForceUpdate(!forceUpdate);
  }, [i18n.language]);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  let handleDeleteUser = async (userId: string) => {
    try {
      let response = await fetch(`${prodUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        let data = await response.json();
        console.log(data);
        navigate('/');
      } else {
        let errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setError((err as Error)?.message);
    }
  };

  return (
    <div
      className='container border border-2 rounded-4 p-3 mb-4 fs-5'
      style={{ marginTop: '125px' }}
      id='enforce-width-95-user1'
    >
      <div className='row'>
        <div className='col-10'>
          <h1 className='fs-1 mb-0'>
            {pageUser.username} {pageUser.isAdmin && '👑'}
          </h1>
        </div>

        <div className='col-2 d-flex align-items-start justify-content-end'>
          {pageUser &&
            contextUser &&
            (pageUser._id == contextUser._id || contextUser.isAdmin) && (
              <>
                <Link to='/'>
                  <button
                    className='btn btn-danger mt-1'
                    onClick={() => handleDeleteUser(pageUser._id)}
                    title='Delete user'
                  >
                    <i className='bi bi-trash'></i>
                  </button>
                </Link>
              </>
            )}
        </div>
      </div>

      <p className='mb-2'>
        <span className='fw-bold'>{t('user.collector')} ID: </span>
        <code className='text-body-secondary'>#{pageUser._id}</code>
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>{t('emailLabel')}: </span>
        <code>{pageUser.email}</code>
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>{t('user.status')}: </span>
        <StatusWrapper
          status={
            pageUser.isBlocked
              ? t('user.status.blocked')
              : t('user.status.active')
          }
          accentColor={pageUser.isBlocked ? 'red' : 'darkorange'}
        />
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>{t('user.collections')}: </span>
        {pageUser.collections?.length}
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>{t('user.totalItems')}: </span>
        {pageUser.collections?.reduce(
          (total, collection) =>
            total + (collection as Collection).items?.length,
          0
        ) || 0}
      </p>

      {/* for a more user-friendly tickets navigation */}
      <div id='tickets-section'></div>

      <p className='text-body-secondary mt-3 mb-1'>
        <small>
          {t('user.registered')}:{' '}
          {stringifyDate(pageUser.registerDate, t, forceUpdate)}
        </small>
      </p>
      <p className='text-body-secondary mb-2'>
        <small>
          {t('user.lastLogin')}:{' '}
          {stringifyDate(pageUser.lastLoginDate, t, forceUpdate)}
        </small>
      </p>
    </div>
  );
}

export default UserDetails;
