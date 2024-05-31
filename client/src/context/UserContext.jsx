import { createContext, useState, useEffect } from 'react';

const UserContext = createContext({
  user: null,
  isLoading: true
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trigger, setTrigger] = useState(false);

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      const token = localStorage.getItem('auth');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      try {
        if (token && tokenExpiration && Date.now() < tokenExpiration) {
          const response = await fetch(`${prodUrl}/api/current-user`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
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
        } else {
          localStorage.removeItem('auth');
          localStorage.removeItem('tokenExpiration');
          setUser(null);
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
  }, [trigger]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, setTrigger }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
