import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext.jsx';

import Navbar from './Navbar.jsx';
import ErrorPage from './ErrorPage.jsx';
import LoadingScreen from './LoadingScreen.jsx';

import getHumanReadableError from '../utils/getHumanReadableError.js';
import stringifyDate from '../utils/stringifyDate.js';

export default function UserPage() {
  const { userId } = useParams();
  const { user } = useContext(UserContext);
  const [pageUser, setPageUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  useEffect(() => {
    setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const intervalId = setInterval(fetchUser, 10000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [userId]);

  return error ? (
    <ErrorPage err={error} />
  ) : pageUser && !isLoading ? (
    <>
      <Navbar />

      <UserDetails pageUser={pageUser} contextUser={user} setError={setError} />

      <div className='container'>
        <h2>Profile # {userId}</h2>

        {/* <div className='mb-3'>
        <strong>Email:</strong> {user.email}
      </div> */}

        {/* Display other relevant user information here (e.g., language, theme, number of collections) */}

        <hr />

        <h3>Collections</h3>
        {/* ... (Optionally, display the user's collections here) ... */}
      </div>
    </>
  ) : (
    <LoadingScreen message='Fetching user data..' long='true' />
  );
}

function UserDetails({ pageUser, contextUser, setError }) {
  const navigate = useNavigate();

  const handleDeleteUser = () => {};

  return (
    <div
      className='container border border-2 rounded-4 p-3 mb-4'
      style={{ marginTop: '120px' }}
      id='enforce-width-95-user1'
    >
      <div className='row'>
        <div className='col-10'>
          <h1 className='fs-1'>
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
                    onClick={handleDeleteUser}
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

      <p className='mb-1'>
        <span className='fw-bold'>Email: </span>
        <code>{pageUser.email}</code>
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
