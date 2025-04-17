import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function History() {
  const [history, setHistory] = useState<
    { query: string; filters: { language: string; minStars: string; minForks: string }; url: string }[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load search history from localStorage
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setHistory(storedHistory);
  }, []);

  const handleSearchClick = (item: { query: string; filters: { language: string; minStars: string; minForks: string }; url: string }) => {
    const { query, filters } = item;
    const searchParams = new URLSearchParams({
      query,
      language: filters.language || '',
      minStars: filters.minStars || '',
      minForks: filters.minForks || '',
    });
    navigate(`/?${searchParams.toString()}`);
  };

  return (
    <div>
      <h1>Search History</h1>
      {history.length === 0 ? (
        <p>No search history available.</p>
      ) : (
        <table cellPadding="10" style={{ marginTop: '20px', width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Search Query</th>
              <th>Filters</th>
              <th>URL</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.query}</td>
                <td>
                  {`Language: ${item.filters.language || 'N/A'}, Min Stars: ${item.filters.minStars || 'N/A'}, Min Forks: ${
                    item.filters.minForks || 'N/A'
                  }`}
                </td>
                <td>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View API URL
                  </a>
                </td>
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