import { useContext, useState, useEffect } from 'react';
import UserContext from '../context/UserContext.jsx';
import LoadingScreen from './LoadingScreen.jsx';
import { Navigate, Outlet } from 'react-router-dom';

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
      return <LoadingScreen />; 
    }
  
    if (timeoutExpired) {
      console.error('Failed to fetch the current user. Likely cause: connectivity issues.')
    }
    return user?.isBlocked ? <Navigate to='/login' replace /> : <Outlet />;
  };