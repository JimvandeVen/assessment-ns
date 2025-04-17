import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home() {
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState<{
    id: number;
    full_name: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<'stars' | 'forks' | ''>('');
  const [order, setOrder] = useState<'asc' | 'desc' | ''>('desc');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if a query is passed via URL and trigger search
    const queryFromParams = searchParams.get('query');
    if (queryFromParams) {
      setQuery(queryFromParams);
      handleSearch(queryFromParams);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery = query, sortBy: 'stars' | 'forks' | '' = '', sortOrder: 'asc' | 'desc' = 'desc') => {
    if (!searchQuery) return;

    setLoading(true);
    setError('');
    setRepos([]);

    try {
      const sortParam = sortBy ? `&sort=${sortBy}&order=${sortOrder}` : '';
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${searchQuery}+in:name,description,readme,topics&per_page=10${sortParam}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      setRepos(data.items || []);

      // Save the query to localStorage for history
      const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      if (!storedHistory.includes(searchQuery)) {
        storedHistory.push(searchQuery);
        localStorage.setItem('searchHistory', JSON.stringify(storedHistory));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (sortBy: 'stars' | 'forks') => {
    let newOrder: 'asc' | 'desc' | '' = '';

    if (sort === sortBy) {
      // Toggle between 'asc', 'desc', and '' (none)
      if (order === 'desc') {
        newOrder = 'asc';
      } else if (order === 'asc') {
        newOrder = '';
      } else {
        newOrder = 'desc';
      }
    } else {
      // Default to 'desc' when switching to a new column
      newOrder = 'desc';
    }

    setSort(newOrder ? sortBy : '');
    setOrder(newOrder);
    handleSearch(query, newOrder ? sortBy : '', newOrder || undefined);
  };

  return (
    <div>
      <h1>Search GitHub Repositories</h1>
      <input
        className="search-input"
        type="text"
        placeholder="Enter repository name, description, topics, or README"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(e.currentTarget.value);
          }
        }}
      />
      <button onClick={() => handleSearch()} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {repos.length > 0 && (
        // should be a table component
        <table cellPadding="10" style={{ marginTop: '20px', width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Repository Name</th>
              <th>
                <button onClick={() => handleSort('stars')} style={{ cursor: 'pointer' }}>
                  Stars {sort === 'stars' ? (order === 'desc' ? '▼' : order === 'asc' ? '▲' : '') : ''}
                </button>
              </th>
              <th>
                <button onClick={() => handleSort('forks')} style={{ cursor: 'pointer' }}>
                  Forks {sort === 'forks' ? (order === 'desc' ? '▼' : order === 'asc' ? '▲' : '') : ''}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {repos.map((repo) => (
              <tr key={repo.id}>
                <td>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    {repo.full_name}
                  </a>
                </td>
                <td>{repo.stargazers_count}</td>
                <td>{repo.forks_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Home;