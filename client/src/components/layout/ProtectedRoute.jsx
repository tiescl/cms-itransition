import { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import UserContext from '../../context/UserContext';

import LoadingScreen from './LoadingScreen';
import Layout from './Layout';

export default function ProtectedRoute() {
  const { user, isLoading } = useContext(UserContext);
  const [timeoutExpired, setTimeoutExpired] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => setTimeoutExpired(true), 3500);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !timeoutExpired) {
    return <LoadingScreen long={true} />;
  }

  if (timeoutExpired) {
    console.error(
      'Failed to fetch the current user. Likely cause: connectivity issues.'
    );
  }
  return user?.isBlocked ? (
    <Navigate to='/login' replace />
  ) : (
    <Layout>
      <Outlet />
    </Layout>
  );
}
