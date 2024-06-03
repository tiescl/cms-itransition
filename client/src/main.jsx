import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import { UserProvider } from './context/UserContext.jsx';
import AdminPanel from './components/UsersPanel.jsx';
import CreateCollection from './components/CreateCollection.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import IncompleteRoute from './components/IncompleteRoute.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './styles/build.css';
import Collections from './components/Collections.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<App />} />
            <Route path='/users' element={<AdminPanel />} />
            <Route
              path='/users/:userId'
              element={<IncompleteRoute text='Page of an individual user ' />}
            />
            <Route path='/collections' element={<Collections />} />
            <Route
              path='/collections/:collectionId'
              element={
                <IncompleteRoute text='Page of an individual collection ' />
              }
            />
            <Route
              path='/collections/:collectionId/edit'
              element={<IncompleteRoute text='Page for editing collections ' />}
            />
            <Route path='/collections/create' element={<CreateCollection />} />
          </Route>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/*' element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
