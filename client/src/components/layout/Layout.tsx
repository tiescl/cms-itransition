import Navbar from '../../views/Navbar';
import HelpButton from '../jiraElems/HelpButton';

interface IProps {
  children: React.ReactNode;
}

export default function Layout({ children }: IProps) {
  return (
    <>
      <Navbar />
      {children}
      <HelpButton />
    </>
  );
}
