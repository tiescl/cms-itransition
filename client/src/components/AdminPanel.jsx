import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRow } from './UsersPanelTiny.jsx';
import UserContext from '../context/UserContext.jsx';
import 'bootstrap/dist/css/bootstrap.css';

function AdminPanel() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const [userList, setUserList] = useState([]),
    [selectedUsers, setSelectedUsers] = useState([]),
    [isCheckedAll, setIsCheckedAll] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const users = await response.json();
          if (isMounted) {
            setUserList(users);
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  });

  const handleBlock = async () => {
    try {
      // update selected users with isBlocked: true

      //   const updatePromises = selectedUsers.map(async (userEmail) => {
      //     const userDocRef = doc(db, `users/${userEmail}`);
      //     return updateDoc(userDocRef, { status: 'blocked' });
      //   });

      //   await Promise.all(updatePromises);

      setSelectedUsers([]);

      fetchData();
    } catch (error) {
      console.error('Error blocking users:', error);
    }
  };

  const handleUnblock = async () => {
    try {
      // update selected users with isBlocked: false

      //   const updatePromises = selectedUsers.map(async (userEmail) => {
      //     const userDocRef = doc(db, `users/${userEmail}`);
      //     return updateDoc(userDocRef, { status: 'active' });
      //   });

      //   await Promise.all(updatePromises);

      setSelectedUsers([]);
      fetchData();
    } catch (error) {
      console.error('Error blocking users:', error);
    }
  };

  const handleDelete = async () => {
    try {
      // delete selected users

      //   const deletePromises = selectedUsers.map(async (userEmail) => {
      //     const userDocRef = doc(db, `users/${userEmail}`);
      //     return deleteDoc(userDocRef);
      //   });

      //   await Promise.all(deletePromises);

      setSelectedUsers([]);
      fetchData();
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  // DONE
  function handleSelectionChange(e, userEmail) {
    setSelectedUsers((prevSelected) => {
      if (e.target.checked) {
        return [...prevSelected, userEmail];
      } else {
        return prevSelected.filter((id) => id !== userEmail);
      }
    });
  }

  // DONE
  function handleSelectAllChange() {
    setIsCheckedAll(!isCheckedAll);
    setSelectedUsers((prevSelected) => {
      if (!isCheckedAll) {
        return userList?.map((user) => user.email);
      } else {
        return [];
      }
    });
  }

  // DONE
  const handleLogout = () => {
    setUser(null);
    fetch('/api/logout')
      .then(() => {
        console.log('logged out');
      })
      .catch((err) => console.log(err.message));
  };

  return (
    <>
      <nav
        style={{ height: '70px', paddingRight: '30px' }}
        className='navbar navbar-light bg-light navbar-expand-sm fixed-top justify-content-end'
      >
        <ul className='navbar-nav align-items-center gap-3'>
          <li className='nav-item'>
            Hello, <strong>{user?.username || 'Guest'}</strong>
          </li>
          <li className='nav-item'>
            <Link
              to='/login'
              onClick={handleLogout}
              className='btn btn-primary'
            >
              Log out
            </Link>
          </li>
        </ul>
      </nav>

      <h1
        style={{ marginTop: '90px', marginBottom: '40px' }}
        className='text-center'
      >
        Users
      </h1>

      <div className='container'>
        <button
          className='btn text-black border-2 fw-bold btn-outline-warning mb-2 mx-1'
          onClick={handleBlock}
        >
          Block 🔒
        </button>
        <button
          className='btn btn-outline-success text-black border-2 fw-bold mb-2 mx-1'
          onClick={handleUnblock}
        >
          Unblock 🔓
        </button>
        <button
          className='btn btn-outline-danger text-black border-2 fw-bold mb-2 mx-1'
          onClick={handleDelete}
        >
          Delete 🗑️
        </button>
      </div>

      <div style={{ width: '100vw' }} className='container text-center'>
        <table
          style={{ borderRadius: '15px' }}
          className='table table-responsive table-striped table-hover table-bordered table-md'
        >
          <caption className='text-center'>
            {userList.length} {userList.length === 1 ? 'user' : 'users'}
          </caption>
          <thead className='table-light'>
            <tr className='align-middle'>
              <th>
                Selection
                <input
                  type='checkbox'
                  style={{ width: '20px', height: '20px', display: 'block' }}
                  className='form-check-input mx-auto'
                  checked={isCheckedAll}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th>Username</th>
              <th>E-mail</th>
              <th>Collection Count</th>
              <th>Last login</th>
              <th>Register Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {userList &&
              userList.map((u) => (
                <UserRow
                  key={u._id}
                  user={u}
                  selectedUsers={selectedUsers}
                  onChange={handleSelectionChange}
                />
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminPanel;
