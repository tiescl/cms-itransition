import { createContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/current-user');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        const data = await response.json();
        if (isMounted) {
          setUser(data);
        }
      } catch (err) {
        console.log('Fetching user data..');
      }
    };
    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
