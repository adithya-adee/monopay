import { useState } from 'react';
import Navbar from './components/Navbar';
import PinLogin from './components/PinLogin';
import Dashboard from './components/Dashboard';
import TransactionsPage from './components/TransactionsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState('home');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && <Navbar page={page} setPage={setPage} />}
      <main style={{ flex: 1 }}>
        {!isAuthenticated ? (
          <PinLogin onLogin={() => setIsAuthenticated(true)} />
        ) : page === 'transactions' ? (
          <TransactionsPage />
        ) : (
          <Dashboard setPage={setPage} />
        )}
      </main>
    </div>
  );
}

export default App;
