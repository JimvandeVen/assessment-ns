import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Search from './pages/Search';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Search</Link> | <Link to="/history">History</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;