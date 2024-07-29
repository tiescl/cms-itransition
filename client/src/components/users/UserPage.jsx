import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserContext from '../../context/UserContext.jsx';

import ErrorPage from '../layout/ErrorPage.jsx';
import LoadingScreen from '../layout/LoadingScreen.jsx';
import InlineLoadingScreen from '../layout/InlineLoadingScreen.jsx';
import CollectionCard from '../collections/Card.jsx';
import { Pagination } from 'react-bootstrap';
import { StatusWrapper } from './UsersPanelTiny.jsx';

import stringifyDate from '../../utils/stringifyDate.ts';

export default function UserPage() {
  const { userId } = useParams();
  const { user } = useContext(UserContext);
  const [pageUser, setPageUser] = useState(null);
  const [error, setError] = useState(null);
  const [issues, setIssues] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const { t } = useTranslation();

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const response = await fetch(`${prodUrl}/api/users/${userId}`, {
          signal: controller.signal
        });
        if (response.ok) {
          const data = await response.json();
          setPageUser(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log(err.message);
          setError(err.message);
        }
      }
    };

    fetchUser();

    const intervalId = setInterval(fetchUser, 10000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `${prodUrl}/api/users/${userId}/tickets?startAt=${
            (currentPage - 1) * 10
          }`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          }
        );
        if (response.ok) {
          const data = await response.json();
          setIssues(data.issues);
          setTotalPages(Math.ceil(data.total / 10));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log(err.message);
          setError(err.message);
        }
      }
    };

    if (user?._id === userId) {
      fetchTickets();

      const intervalId = setInterval(fetchTickets, 10000);

      return () => {
        clearInterval(intervalId);
        controller.abort();
      };
    }
  }, [currentPage, user, userId]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return error ? (
    <ErrorPage err={error} />
  ) : pageUser ? (
    <>
      <UserDetails
        pageUser={pageUser}
        contextUser={user}
        setError={setError}
      />

      {user?._id === userId && (
        <div
          className='container border border-2 rounded-4 p-3 mb-4 table-responsive'
          id='enforce-width-95-user0'
        >
          <>
            <h1 className='mb-4'>
              <i className='bi bi-ticket-perforated'></i>{' '}
              {t('user.jiraHeading')}
            </h1>
            {issues ? (
              <>
                <JiraTickets issues={issues} />

                <Pagination className='justify-content-center'>
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </>
            ) : (
              <InlineLoadingScreen message='inlineLoading.tickets' />
            )}
          </>
        </div>
      )}

      <div
        className='container border border-2 rounded-4 p-3 mb-4'
        id='enforce-width-95-user0'
      >
        <h1 className='mb-4'>
          <i className='bi bi-collection'></i> {t('user.collections')} (
          {pageUser.collections?.length || 0})
        </h1>
        <div className='row d-flex'>
          {pageUser.collections?.map((collection) => {
            return (
              <CollectionCard
                key={collection._id}
                collection={collection}
              />
            );
          })}
        </div>
      </div>
    </>
  ) : (
    <LoadingScreen message='loading.user' long={true} />
  );
}

function UserDetails({ pageUser, contextUser, setError }) {
  const navigate = useNavigate();
  const [forceUpdate, setForceUpdate] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setForceUpdate(!forceUpdate);
  }, [i18n.language]);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${prodUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        navigate('/');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setError(err.message);
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
            (pageUser._id === contextUser._id || contextUser.isAdmin) && (
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
        {pageUser.collections?.length || 0}
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>{t('user.totalItems')}: </span>
        {pageUser.collections?.reduce(
          (total, collection) => total + collection.items?.length,
          0
        ) || 0}
      </p>

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

function JiraTickets({ issues }) {
  const { t } = useTranslation();

  return (
    <table className='table table-bordered table-striped table-hover'>
      <thead>
        <tr>
          <th>{t('user.jKey')}</th>
          <th>{t('user.jSummary')}</th>
          <th>{t('user.jStatus')}</th>
          <th>{t('user.jPriority')}</th>
        </tr>
      </thead>
      <tbody>
        {issues.map((issue) => (
          <tr key={issue.key}>
            <td>
              <Link
                to={`https://cms-tiescl.atlassian.net/browse/${issue.key}`}
                className='text-decoration-none'
                target='_blank'
                rel='noreferrer'
              >
                {issue.key}
              </Link>
            </td>
            <td>{issue.summary}</td>
            <td>{issue.status}</td>
            <td>{issue.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
