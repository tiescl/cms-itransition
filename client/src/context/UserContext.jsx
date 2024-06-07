import { createContext, useState, useEffect } from 'react';

const UserContext = createContext({
  user: null,
  isLoading: true
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trigger, setTrigger] = useState(false);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      const token = localStorage.getItem('auth');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      try {
        if (token && tokenExpiration && Date.now() < tokenExpiration) {
          const response = await fetch(`${prodUrl}/api/current-user`, {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (JSON.stringify(data) !== '{}') {
              setUser(data);
            } else {
              setUser(null);
            }
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error);
          }
        } else {
          localStorage.removeItem('auth');
          localStorage.removeItem('tokenExpiration');
          setUser(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log(`Error fetching current user: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();

    const intervalId = setInterval(fetchUser, 5000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [trigger]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, setTrigger }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
