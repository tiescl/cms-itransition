import Navbar from './Navbar.jsx';
import HelpButton from '../jiraElems/HelpButton.jsx';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <HelpButton />
    </>
  );
}
