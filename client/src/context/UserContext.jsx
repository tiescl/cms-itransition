import { createContext, useState, useEffect } from 'react';

const UserContext = createContext({
  user: null,
  isLoading: true
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
