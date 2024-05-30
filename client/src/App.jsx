import UserContext from './context/UserContext';
import { useContext } from 'react';

function App() {
  const { user } = useContext(UserContext);
  return (
    <>
      <div>Hello world!</div>
      <div>Hello, {user ? user.username : 'Guest'}</div>
    </>
  );
}

export default App;
