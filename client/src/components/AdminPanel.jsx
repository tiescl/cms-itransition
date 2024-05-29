import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserRow from './UserRow.js';

function AdminPanel() {
  const navigate = useNavigate();

  const [userList, setUserList] = useState([]),
    [user, setUser] = useState(null),
    [selectedUsers, setSelectedUsers] = useState([]),
    [isCheckedAll, setIsCheckedAll] = useState(false);

  const fetchData = async () => {
    try {
      //   const q = await getDocs(collection(db, 'users'));
      //   let usrs = [];
      //   q.forEach((doc) => {
      //     const d = doc.data();
      //     usrs.push({
      //       id: doc.id,
      //       fullName: d.fullName,
      //       email: d.email,
      //       status: d.status,
      //       last_login: d.last_login,
      //       registerDate: d.registerDate
      //     });
      //   });
      //   setUserList(usrs);
    } catch (error) {
      console.error('Error fetching users: ', error);
    }
  };

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

  async function isUserActive(user) {
    try {
      const docSnap = await getDoc(doc(db, 'users', user.email));
      if (docSnap.exists()) {
        return docSnap.data().status === 'active';
      }
    } catch (error) {
      console.error('Error checking state: ', error);
    }
  }

  useEffect(() => {
    // think it's useless

    onAuthStateChanged(auth, (usr) => {
      if (usr) {
        isUserActive(usr)
          .then((isActive) => {
            if (isActive) {
              getDoc(doc(db, 'users', usr.email)).then((doc) => {
                if (doc.exists()) {
                  setUser(doc.data());
                  updateLastLogin(usr.email);
                }
              });
              fetchData();
            } else {
              navigate('/login');
            }
          })
          .catch(() => {
            console.log('Error checking user status.');
          });
      } else {
        navigate('/login');
      }
    });
  }, []);

  return (
    <>
      <nav className='navbar navbar-light bg-light navbar-expand-sm fixed-top justify-content-end'>
        <ul className='navbar-nav align-items-center gap-3'>
          <li className='nav-item'>
            Hello, <strong>{user?.fullName}</strong>
          </li>
          <li className='nav-item'>
            <Link
              to='/login'
              onClick={() => signOut(auth)}
              className='btn btn-primary'
            >
              Log out
            </Link>
          </li>
        </ul>
      </nav>

      <h1 className='greeting'>Users</h1>

      <div className='container'>
        <button
          className='btn handler btn-outline-warning mb-2 mx-1'
          onClick={handleBlock}
        >
          Block 🔒
        </button>
        <button
          className='btn handler btn-outline-success mb-2 mx-1'
          onClick={handleUnblock}
        >
          Unblock 🔓
        </button>
        <button
          className='btn handler btn-outline-danger mb-2 mx-1'
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
            <tr>
              <th className='col-sm-1'>
                Select all{' '}
                <input
                  type='checkbox'
                  className='form-check-input users-checkbox'
                  checked={isCheckedAll}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th>Full Name</th>
              <th>E-mail</th>
              <th>Last login</th>
              <th>Register Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {userList &&
              userList.map((u) => (
                <UserRow
                  key={u.id}
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
