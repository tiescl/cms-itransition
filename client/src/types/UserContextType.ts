import User from './User';

export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}
