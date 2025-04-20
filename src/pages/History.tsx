import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function History() {
  // State to store the search history loaded from localStorage
  const [history, setHistory] = useState<
    { query: string; filters: { language: string; minStars: string; minForks: string }; url: string }[]
  >([]);
  const navigate = useNavigate(); // Hook to programmatically navigate to other routes

  useEffect(() => {
    // Load search history from localStorage when the component mounts
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setHistory(storedHistory); // Update the state with the loaded history
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle the "Search Again" button click
  const handleSearchClick = (item: { query: string; filters: { language: string; minStars: string; minForks: string }; url: string }) => {
    const { query, filters } = item; // Destructure the query and filters from the history item
    // Create URL search parameters from the query and filters
    const searchParams = new URLSearchParams({
      query,
      language: filters.language || '', // Add language filter if available
      minStars: filters.minStars || '', // Add minimum stars filter if available
      minForks: filters.minForks || '', // Add minimum forks filter if available
    });
    // Navigate to the home page with the search parameters in the URL
    navigate(`/?${searchParams.toString()}`);
  };

  return (
    <div>
      <h1>Search History</h1>
      {history.length === 0 ? (
        // Display a message if no search history is available
        <p>No search history available.</p>
      ) : (
        // Display the search history in a table
        <table cellPadding="10" style={{ marginTop: '20px', width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>#</th> {/* Column for the index */}
              <th>Search Query</th> {/* Column for the search query */}
              <th>Filters</th> {/* Column for the applied filters */}
              <th>URL</th> {/* Column for the API URL */}
              <th>Action</th> {/* Column for the "Search Again" button */}
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td> {/* Display the index of the history item */}
                <td>{item.query}</td> {/* Display the search query */}
                <td>
                  {/* Display the filters applied during the search */}
                  {`Language: ${item.filters.language || 'N/A'}, Min Stars: ${item.filters.minStars || 'N/A'}, Min Forks: ${
                    item.filters.minForks || 'N/A'
                  }`}
                </td>
                <td>
                  {/* Display the API URL as a clickable link */}
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View API URL
                  </a>
                </td>
                <td>
                  {/* Button to trigger the same search again */}
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