import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(response);
        if (!response.ok) {
          // Handle HTTP errors (e.g., 404, 500)
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
          );
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch users');
        }
        
        setUsers(data.data);
      } catch (err) {
        console.error("Fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!users.length) return <div>Loading...</div>;

  return (
    <div>
      <h3>Users List</h3>
      <table className="table-auto w-full">
        <thead>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

UsersList.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default UsersList;
