import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet
} from 'react-router-dom';
import App from './App.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import { UserProvider } from './context/UserContext.jsx';
import AdminPanel from './components/UsersPanel.jsx';
import UserContext from './context/UserContext.jsx';

const ProtectedRoute = () => {
  const { user, isLoading } = useContext(UserContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return user && !user.isBlocked ? (
    <Outlet />
  ) : (
    <Navigate to='/login' replace />
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path='/'
              element={<App />}
              errorElement={<div>Oops! Something got fudged up!</div>}
            />
            <Route path='/users' element={<AdminPanel />} />
            <Route
              path='/users/:userId'
              element={<div>user profile page</div>}
            />
            <Route
              path='/collections'
              element={<div>list of collections page</div>}
            />
            <Route
              path='/collections/:collectionId'
              element={<div>individual collection page</div>}
            />
            <Route
              path='/collections/:collectionId/edit'
              element={<div>collection editing page</div>}
            />
            <Route
              path='/collections/create'
              element={<div>collection creation page</div>}
            />
          </Route>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
