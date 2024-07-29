import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';

import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';

import { UserProvider } from './context/UserContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/utils/i18n.ts';

import EditCollection from './components/collections/Edit.jsx';
import CreateCollection from './components/collections/Create.jsx';
import Collections from './components/collections/Collections.jsx';
import CollectionPage from './components/collections/Page.jsx';

import CreateItem from './components/items/Create.jsx';
import ItemPage from './components/items/ItemPage.jsx';
import EditItem from './components/items/Edit.jsx';

import AdminPanel from './components/users/UsersPanel.jsx';
import UserPage from './components/users/UserPage.jsx';

import SearchPage from './components/layout/SearchPage.jsx';
import ErrorPage from './components/layout/ErrorPage.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<ProtectedRoute />}>
                  <Route path='/' element={<App />} />
                  <Route path='/search' element={<SearchPage />} />
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
                  <Route
                    path='/collections/create'
                    element={<CreateCollection />}
                  />
                  <Route
                    path='/collections/:collectionId/items/create'
                    element={<CreateItem />}
                  />
                  <Route
                    path='/collections/:collectionId/items/:itemId/edit'
                    element={<EditItem />}
                  />
                  <Route
                    path='/collections/:collectionId/items/:itemId'
                    element={<ItemPage />}
                  />
                </Route>
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/*' element={<ErrorPage />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </UserProvider>
      </QueryClientProvider>
    </I18nextProvider>
  </React.StrictMode>
);
