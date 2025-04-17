import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function History() {
  const [history, setHistory] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load search history from localStorage
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setHistory(storedHistory);
  }, []);

  const handleSearchClick = (query: string) => {
    // Navigate to the home page with the query as a search parameter
    navigate(`/?query=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      <h1>Search History</h1>
      {history.length === 0 ? (
        <p>No search history available.</p>
      ) : (
        // should be table component
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Search Query</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
          <td>{index + 1}</td>
          <td>{item}</td>
          <td>
            <button onClick={() => handleSearchClick(item)} style={{ cursor: 'pointer' }}>
              Search Again
            </button>
          </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;