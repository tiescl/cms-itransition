import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import { UserProvider } from './context/UserContext.jsx';
import AdminPanel from './components/AdminPanel.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={<App />}
            errorElement={<div>Oops! Something got fudged up!</div>}
          />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/users' element={<AdminPanel />} />
          <Route path='/users/:id' element={<div>user profile page</div>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
