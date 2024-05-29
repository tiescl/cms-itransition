import UserContext from './context/UserContext';
import { useContext } from 'react';

function App() {
  const { user, setUser } = useContext(UserContext);
  return (
    <>
      <div>Hello world!</div>
      <div>Hello, {user ? user.username : 'Guest'}</div>
      <button
        onClick={() => {
          setUser(null);
          fetch('/api/logout')
            .then(() => {
              console.log('logged out');
            })
            .catch((err) => console.log(err.message));
          // navigate where you need to
        }}
      >
        Log Out
      </button>
    </>
  );
}

export default App;
