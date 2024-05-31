import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRow } from './UsersPanelTiny.jsx';
import UserContext from '../context/UserContext.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import Navbar from './Navbar.jsx';

function AdminPanel() {
  const { user } = useContext(UserContext);

  const [userList, setUserList] = useState([]),
    [selectedUsers, setSelectedUsers] = useState([]),
    [isCheckedAll, setIsCheckedAll] = useState(false),
    [refreshTrigger, setRefreshTrigger] = useState(false);

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';
  const token = localStorage.getItem('auth');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${prodUrl}/api/users`);
        if (response.ok) {
          const users = await response.json();
          setUserList(users);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  const handleBlock = async () => {
    try {
      const property = 'isBlocked';
      const value = true;

      const response = await fetch(`${prodUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers, property, value })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        setRefreshTrigger((prev) => !prev);
      } else {
        throw new Error('users_block_unsuccessful');
      }
    } catch (error) {
      console.error('Error blocking users:', error.message);
    }
  };

  const handleUnblock = async () => {
    try {
      const property = 'isBlocked';
      const value = false;

      const response = await fetch(`${prodUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers, property, value })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        setRefreshTrigger((prev) => !prev);
      } else {
        throw new Error('users_unblock_unsuccessful');
      }
    } catch (error) {
      console.error('Error unblocking users:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${prodUrl}/api/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        setRefreshTrigger((prev) => !prev);
      } else {
        throw new Error('user_deletion_unsuccessful');
      }
    } catch (error) {
      console.error('Error deleting users:', error.message);
    }
  };

  const handleMakeAdmin = async () => {
    try {
      const property = 'isAdmin';
      const value = true;

      const response = await fetch(`${prodUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers, property, value })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        setRefreshTrigger((prev) => !prev);
      } else {
        throw new Error('promotion_unsuccessful');
      }
    } catch (error) {
      console.error('Error promoting users:', error.message);
    }
  };

  const handleAdminDelete = async () => {
    try {
      const property = 'isAdmin';
      const value = false;

      const response = await fetch(`${prodUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedUsers, property, value })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setIsCheckedAll(false);
        setRefreshTrigger((prev) => !prev);
      } else {
        throw new Error('demotion_unsuccessful');
      }
    } catch (error) {
      console.error('Error demoting users:', error.message);
    }
  };

  function handleSelectionChange(e, userEmail) {
    setSelectedUsers((prevSelected) => {
      if (e.target.checked) {
        return [...prevSelected, userEmail];
      } else {
        return prevSelected.filter((id) => id !== userEmail);
      }
    });
  }

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

  return (
    <>
      <Navbar />

      <h1
        style={{
          marginTop: '120px',
          marginBottom: '40px',
          fontSize: '40px',
          fontWeight: '500'
        }}
        className='text-center'
      >
        Users
      </h1>

      {user && user.isAdmin ? (
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
          <div
            style={{
              display: 'inline',
              borderLeft: '2px solid black',
              height: '20px',
              margin: '0 20px'
            }}
          ></div>
          <button
            className='btn btn-dark border-2  fw-semibold mb-2 mx-1'
            onClick={handleMakeAdmin}
          >
            Make Admin 👑
          </button>
          <button
            className='btn btn-warning border-2 fw-semibold mb-2 mx-1'
            onClick={handleAdminDelete}
          >
            Revoke Admin ❌
          </button>
        </div>
      ) : null}

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
              <th style={{ minWidth: '200px' }}>Username</th>
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
