import UserContext from './context/UserContext';
import { useContext } from 'react';
import Navbar from './components/Navbar';

function App() {
  const { user } = useContext(UserContext);
  return (
    <>
      <Navbar />
      <div className=' mt-20 mx-auto'>Hello world!</div>
    </>
  );
}

export default App;
