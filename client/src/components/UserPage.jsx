import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function UserPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  //   useEffect(() => {
  //     const fetchUser = async () => {
  //       try {
  //         const response = await fetch(`/api/users/${id}`);
  //         if (response.ok) {
  //           const data = await response.json();
  //           setUser(data);
  //         } else {
  //           // Handle errors here
  //           setError('User not found');
  //           setTimeout(() => {
  //             navigate('/'); // Redirect back to the home page or wherever is appropriate
  //           }, 2000); // Redirect after 2 seconds (adjust as needed)
  //         }
  //       } catch (err) {
  //         console.error('Error fetching user:', err);
  //         setError('An error occurred. Please try again later.');
  //       }
  //     };

  //     fetchUser();
  //   }, [id]);

  if (error) {
    return <div className='alert alert-danger'>{error}</div>;
  }

  //   if (!user) {
  //     return <div>Loading...</div>;
  //   }

  return (
    <div className='container'>
      <h2>Profile # {userId}</h2>

      {/* <div className='mb-3'>
        <strong>Email:</strong> {user.email}
      </div> */}

      {/* Display other relevant user information here (e.g., language, theme, number of collections) */}

      <hr />

      <h3>Collections</h3>
      {/* ... (Optionally, display the user's collections here) ... */}
    </div>
  );
}
