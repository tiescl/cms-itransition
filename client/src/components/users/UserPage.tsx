import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserContext from '../../context/UserContext';

import ErrorPage from '../layout/ErrorPage';
import LoadingScreen from '../layout/LoadingScreen';
import InlineLoadingScreen from '../layout/InlineLoadingScreen';
import CollectionCard from '../collections/Card.jsx';
import { StatusWrapper } from './UsersPanelTiny';
import { Pagination } from 'react-bootstrap';

import stringifyDate from '../../utils/stringifyDate';
import User from '../../types/User';
import JiraIssue from '../../types/JiraIssue';
import Collection from '../../types/Collection';
import { useQuery } from '@tanstack/react-query';

export default function UserPage() {
  let { t } = useTranslation();
  let { userId } = useParams();
  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  var { user } = useContext(UserContext);

  var [pageUser, setPageUser] = useState<User | null>(null),
    [issues, setIssues] = useState<JiraIssue[]>([]),
    [error, setError] = useState(''),
    [totalPages, setTotalPages] = useState(0),
    [currentPage, setCurrentPage] = useState(1);

  var { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      try {
        let response = await fetch(`${prodUrl}/api/users/${userId}`);
        if (response.ok) {
          return await response.json();
        } else {
          let errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        console.log((err as Error).message);
        setError((err as Error).message);
      }
    },
    staleTime: 10 * 1000,
    gcTime: 20 * 60 * 1000
  });

  useEffect(() => {
    setPageUser(data);
  }, [data]);

  let { data: tickets, isLoading } = useQuery({
    queryKey: ['jiraTickets', user, userId, currentPage],
    queryFn: async () => {
      try {
        let response = await fetch(
          `${prodUrl}/api/users/${userId}/tickets?startAt=${
            (currentPage - 1) * 10
          }`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (response.ok) {
          return await response.json();
        } else {
          let errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        console.log((err as Error).message);
        setError((err as Error).message);
        throw err;
      }
    },
    staleTime: 10 * 1000,
    gcTime: 20 * 60 * 1000,
    enabled: user?._id == userId
  });

  useEffect(() => {
    setTotalPages(Math.ceil(tickets?.total / 10));
    setIssues(tickets?.issues || []);
  }, [tickets]);

  let handlePageChange = (page: number) => {
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

      {user?._id == userId && (
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
                <JiraTickets issues={issues} isLoading={isLoading} />

                <Pagination className='justify-content-center'>
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage == 1}
                  />
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 == currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage == totalPages}
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
          {pageUser.collections?.length})
        </h1>
        <div className='row d-flex'>
          {(pageUser.collections as Collection[]).map((collection) => {
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
      setError((err as Error).message);
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

interface ITicketsProps {
  issues: JiraIssue[];
  isLoading: boolean;
}

function JiraTickets({ issues, isLoading }: ITicketsProps) {
  let { t } = useTranslation();

  return isLoading ? (
    <InlineLoadingScreen message='inlineLoading.tickets' />
  ) : (
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
