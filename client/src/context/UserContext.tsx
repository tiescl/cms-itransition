import { createContext, useState, useEffect } from 'react';
import User from '../types/User';
import { UserContextType } from '../types/UserContextType';

var UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  setTrigger: () => {}
});

interface IProps {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: IProps) => {
  var [user, setUser] = useState<User | null>(null);
  var [isLoading, setIsLoading] = useState(true);
  var [trigger, setTrigger] = useState<boolean>(false);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    let controller = new AbortController();

    let fetchUser = async () => {
      const token = localStorage.getItem('auth');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      try {
        if (
          token &&
          tokenExpiration &&
          Date.now() < Number(tokenExpiration)
        ) {
          let response = await fetch(`${prodUrl}/api/current-user`, {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            let data = await response.json();
            if (JSON.stringify(data) != '{}') {
              setUser(data);
            } else {
              setUser(null);
            }
          } else {
            let errorData = await response.json();
            throw new Error(errorData.error);
          }
        } else {
          localStorage.removeItem('auth');
          localStorage.removeItem('tokenExpiration');
          setUser(null);
        }
      } catch (err) {
        if ((err as Error)?.name != 'AbortError') {
          console.log(
            `Error fetching current user: ${(err as Error)?.message}`
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();

    const intervalId = setInterval(fetchUser, 20000);

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
