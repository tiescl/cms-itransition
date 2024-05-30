import Navbar from './components/Navbar.jsx';
import IncompleteRoute from './components/IncompleteRoute.jsx';

function App() {
  return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '300px' }}>
        Hello world!
        <IncompleteRoute text='Landing page' />
      </div>
    </>
  );
}

export default App;
