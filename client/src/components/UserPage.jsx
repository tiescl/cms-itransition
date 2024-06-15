import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext.jsx';

import ErrorPage from './ErrorPage.jsx';
import LoadingScreen from './LoadingScreen.jsx';
import CollectionCard from './collections/Card.jsx';
import { Pagination } from 'react-bootstrap';
import { StatusWrapper } from './UsersPanelTiny.jsx';

import getHumanReadableError from '../utils/getHumanReadableError.js';
import stringifyDate from '../utils/stringifyDate.js';

export default function UserPage() {
  const { userId } = useParams();
  const { user } = useContext(UserContext);
  const [pageUser, setPageUser] = useState(null);
  const [error, setError] = useState(null);
  const [issues, setIssues] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

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
          setError(getHumanReadableError(err.message));
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
          setError(getHumanReadableError(err.message));
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
      <UserDetails pageUser={pageUser} contextUser={user} setError={setError} />

      {user?._id === userId && (
        <div
          className='container border border-2 rounded-4 p-3 mb-4 table-responsive'
          id='enforce-width-95-user0'
        >
          <>
            <h1 className='mb-4'>
              <i className='bi bi-ticket-perforated'></i> My Jira Tickets
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
              <InlineLoadingScreen message='Fetching tickets..' />
            )}
          </>
        </div>
      )}

      <div
        className='container border border-2 rounded-4 p-3 mb-4'
        id='enforce-width-95-user0'
      >
        <h1 className='mb-4'>
          <i className='bi bi-collection'></i> Collections (
          {pageUser.collections?.length || 0})
        </h1>
        <div className='row d-flex'>
          {pageUser.collections?.map((collection) => {
            return (
              <CollectionCard key={collection._id} collection={collection} />
            );
          })}
        </div>
      </div>
    </>
  ) : (
    <LoadingScreen message='Fetching user data..' long='true' />
  );
}

function UserDetails({ pageUser, contextUser, setError }) {
  const navigate = useNavigate();

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
      setError(getHumanReadableError(err.message));
    }
  };

  return (
    <div
      className='container border border-2 rounded-4 p-3 mb-4 fs-5'
      style={{ marginTop: '120px' }}
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
                    data-bs-toggle='tooltip'
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
        <span className='fw-bold'>ID</span>{' '}
        <code className='text-body-secondary'>#{pageUser._id}</code>
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>Email: </span>
        <code>{pageUser.email}</code>
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>Status:</span>{' '}
        <StatusWrapper
          status={pageUser.isBlocked ? 'blocked' : 'active'}
          accentColor={pageUser.isBlocked ? 'red' : 'darkorange'}
        />
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>Collections:</span>{' '}
        {pageUser.collections?.length || 0}
      </p>

      <p className='mb-2'>
        <span className='fw-bold'>Total items created:</span>{' '}
        {pageUser.collections?.reduce(
          (total, collection) => total + collection.items?.length,
          0
        ) || 0}
      </p>

      <p className='text-body-secondary mt-3 mb-1'>
        <small>Registered: {stringifyDate(pageUser.registerDate)}</small>
      </p>
      <p className='text-body-secondary mb-2'>
        <small>Last Visit: {stringifyDate(pageUser.lastLoginDate)}</small>
      </p>
    </div>
  );
}

function JiraTickets({ issues }) {
  return (
    <table className='table table-bordered table-striped table-hover'>
      <thead>
        <tr>
          <th>Key</th>
          <th>Summary</th>
          <th>Status</th>
          <th>Priority</th>
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

function InlineLoadingScreen({ message }) {
  return (
    <div
      className='position-relative w-100 h-100 d-flex flex-column text-black justify-content-center align-items-center'
      style={{ opacity: 0.5 }}
    >
      <div className='spinner-border' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
      <p className='mt-3 fs-4'>{message}</p>
    </div>
  );
}
