import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Search() {
  // State variables to manage input fields, search results, and UI states
  const [query, setQuery] = useState(''); // Search query
  const [language, setLanguage] = useState(''); // Programming language filter
  const [minStars, setMinStars] = useState(''); // Minimum stars filter
  const [minForks, setMinForks] = useState(''); // Minimum forks filter
  const [repos, setRepos] = useState<{
    id: number;
    full_name: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
  }[]>([]); // List of repositories
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error message
  const [sort, setSort] = useState<'stars' | 'forks' | ''>(''); // Sorting column
  const [order, setOrder] = useState<'asc' | 'desc' | ''>('desc'); // Sorting order
  const [searchParams] = useSearchParams(); // URL search parameters

  // Effect to populate input fields and load results from localStorage or API
  useEffect(() => {
    // Extract query parameters from the URL
    const queryFromParams = searchParams.get('query');
    const languageFromParams = searchParams.get('language');
    const minStarsFromParams = searchParams.get('minStars');
    const minForksFromParams = searchParams.get('minForks');
  
    // Populate input fields with query parameters
    if (queryFromParams) setQuery(queryFromParams);
    if (languageFromParams) setLanguage(languageFromParams);
    if (minStarsFromParams) setMinStars(minStarsFromParams);
    if (minForksFromParams) setMinForks(minForksFromParams);
  
    // Check if results for the current query and filters exist in localStorage
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const matchingHistory = storedHistory.find(
      (item: any) =>
        item.query === queryFromParams &&
        item.filters.language === languageFromParams &&
        item.filters.minStars === minStarsFromParams &&
        item.filters.minForks === minForksFromParams
    );
  
    // If matching results are found in localStorage, use them
    if (matchingHistory) {
      setRepos(matchingHistory.results || []);
    } else if (queryFromParams) {
      // Otherwise, fetch results from the API
      handleSearch(queryFromParams);
    }
  }, [searchParams]);

  // Function to perform the search
  const handleSearch = async (
    searchQuery = query,
    sortBy: 'stars' | 'forks' | '' = '',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    if (!searchQuery) return;

    setLoading(true); // Set loading state
    setError(''); // Clear any previous errors
    setRepos([]); // Clear previous results

    try {
      // Construct the API query with filters and sorting
      let filters = `${searchQuery}+in:name,description,readme,topics`;
      if (language) filters += `+language:${language}`;
      if (minStars) filters += `+stars:>=${minStars}`;
      if (minForks) filters += `+forks:>=${minForks}`;
      const sortParam = sortBy ? `&sort=${sortBy}&order=${sortOrder}` : '';
      const apiUrl = `https://api.github.com/search/repositories?q=${filters}&per_page=10${sortParam}`;

      // Fetch data from the GitHub API
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      setRepos(data.items || []); // Update the repository list

      // Save the search details and results to localStorage
      const searchDetails = {
        query: searchQuery,
        filters: {
          language,
          minStars,
          minForks,
        },
        url: apiUrl,
        results: data.items || [],
      };

      // Avoid duplicate entries in localStorage
      const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const isDuplicate = storedHistory.some(
        (item: any) => item.url === searchDetails.url
      );

      if (!isDuplicate) {
        storedHistory.push(searchDetails);
        localStorage.setItem('searchHistory', JSON.stringify(storedHistory));
      }
    } catch (err: any) {
      setError(err.message); // Handle errors
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Function to handle sorting
  const handleSort = (sortBy: 'stars' | 'forks') => {
    // Toggle sorting order or reset it
    const newOrder = sort === sortBy && order === 'desc' ? 'asc' : sort === sortBy && order === 'asc' ? '' : 'desc';
    setSort(newOrder ? sortBy : ''); // Update sorting column
    setOrder(newOrder); // Update sorting order
    handleSearch(query, newOrder ? sortBy : '', newOrder || undefined); // Perform search with sorting
  };

  return (
    <div>
      <h1>Search GitHub Repositories</h1>
      {/* Input field for search query */}
      <input
        className="search-input"
        type="text"
        placeholder="Enter repository name, description, topics, or README"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(); // Trigger search on Enter key press
          }
        }}
      />
      {/* Input fields for filters */}
      <div style={{ margin: '10px 0' }}>
        <input
          type="text"
          placeholder="Language (e.g., JavaScript)"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="number"
          placeholder="Min Stars"
          value={minStars}
          onChange={(e) => setMinStars(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="number"
          placeholder="Min Forks"
          value={minForks}
          onChange={(e) => setMinForks(e.target.value)}
          style={{ padding: '5px' }}
        />
      </div>
      {/* Search button */}
      <button onClick={() => handleSearch()} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {/* Error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Display search results in a table */}
      {repos.length > 0 && (
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

export default Search;