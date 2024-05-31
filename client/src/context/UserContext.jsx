import { createContext, useState, useEffect } from 'react';

const UserContext = createContext({
  user: null,
  isLoading: true
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const response = await fetch(`${prodUrl}/api/current-user`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (JSON.stringify(data) !== '{}') {
            if (isMounted) {
              setUser(data);
            }
          } else {
            setUser(null);
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        console.log(`Error fetching current user: ${err.message}`);
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
