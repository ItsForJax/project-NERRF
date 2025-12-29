import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { Github } from 'lucide-react';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              NERRF STACK
            </span>
            <span className="sm:hidden">NERRF</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/upload')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Upload
            </Link>
            <Link
              to="/search"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/search')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Search
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/ItsForJax/project-NERRF"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="hidden lg:inline">GitHub</span>
          </a>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t px-4 py-2 flex gap-1">
        <Link
          to="/"
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
            isActive('/') && location.pathname === '/'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          Home
        </Link>
        <Link
          to="/upload"
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
            isActive('/upload')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          Upload
        </Link>
        <Link
          to="/search"
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
            isActive('/search')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          Search
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
