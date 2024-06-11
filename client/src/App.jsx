import 'bootstrap-icons/font/bootstrap-icons.min.css';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from './context/UserContext.jsx';

function App() {
  return (
    <>
      <div
        style={{ textAlign: 'center', marginTop: '150px', fontSize: '40px' }}
      >
        Hello world!
      </div>
    </>
  );
}

export default App;
