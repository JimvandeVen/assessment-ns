import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Search() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [minStars, setMinStars] = useState('');
  const [minForks, setMinForks] = useState('');
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
    const queryFromParams = searchParams.get('query');
    const languageFromParams = searchParams.get('language');
    const minStarsFromParams = searchParams.get('minStars');
    const minForksFromParams = searchParams.get('minForks');
  
    if (queryFromParams) setQuery(queryFromParams);
    if (languageFromParams) setLanguage(languageFromParams);
    if (minStarsFromParams) setMinStars(minStarsFromParams);
    if (minForksFromParams) setMinForks(minForksFromParams);
  
    // Load results from localStorage if available
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const matchingHistory = storedHistory.find(
      (item: any) =>
        item.query === queryFromParams &&
        item.filters.language === languageFromParams &&
        item.filters.minStars === minStarsFromParams &&
        item.filters.minForks === minForksFromParams
    );
  
    if (matchingHistory) {
      setRepos(matchingHistory.results || []);
    } else if (queryFromParams) {
      handleSearch(queryFromParams);
    }
  }, [searchParams]);

  const handleSearch = async (
    searchQuery = query,
    sortBy: 'stars' | 'forks' | '' = '',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    if (!searchQuery) return;

    setLoading(true);
    setError('');
    setRepos([]);

    try {
      let filters = `${searchQuery}+in:name,description,readme,topics`;
      if (language) filters += `+language:${language}`;
      if (minStars) filters += `+stars:>=${minStars}`;
      if (minForks) filters += `+forks:>=${minForks}`;
      const sortParam = sortBy ? `&sort=${sortBy}&order=${sortOrder}` : '';
      const apiUrl = `https://api.github.com/search/repositories?q=${filters}&per_page=10${sortParam}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      setRepos(data.items || []);

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

      const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const isDuplicate = storedHistory.some(
        (item: any) => item.url === searchDetails.url
      );

      if (!isDuplicate) {
        storedHistory.push(searchDetails);
        localStorage.setItem('searchHistory', JSON.stringify(storedHistory));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (sortBy: 'stars' | 'forks') => {
    const newOrder = sort === sortBy && order === 'desc' ? 'asc' : sort === sortBy && order === 'asc' ? '' : 'desc';
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
            handleSearch();
          }
        }}
      />
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
      <button onClick={() => handleSearch()} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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