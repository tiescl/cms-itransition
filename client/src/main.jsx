import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';

import { UserProvider } from './context/UserContext.jsx';

import EditCollection from './components/collections/Edit.jsx';
import CreateCollection from './components/collections/Create.jsx';
import Collections from './components/collections/Collections.jsx';
import CollectionPage from './components/collections/Page.jsx';

import AdminPanel from './components/UsersPanel.jsx';
import UserPage from './components/UserPage.jsx';

import ErrorPage from './components/ErrorPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<App />} />
            <Route path='/users' element={<AdminPanel />} />
            <Route path='/users/:userId' element={<UserPage />} />
            <Route path='/collections' element={<Collections />} />
            <Route
              path='/collections/:collectionId'
              element={<CollectionPage />}
            />
            <Route
              path='/collections/:collectionId/edit'
              element={<EditCollection />}
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
