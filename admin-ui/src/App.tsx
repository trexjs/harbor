import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/Routes';
import Consumers from './pages/Consumers';
import ApiKeys from './pages/ApiKeys';
import IpRules from './pages/IpRules';
import GeoRules from './pages/GeoRules';
import BotRules from './pages/BotRules';
import Transformations from './pages/Transformations';
import TerminationRules from './pages/TerminationRules';
import Logs from './pages/Logs';
import Login from './pages/Login';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import { apiClient } from './services/api';
import { useApp } from './context/AppContext';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const { hasProjects, setHasProjects, projectsInitialized, setProjectsInitialized } = useApp();

  // Listen for storage changes to update auth state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on mount and when component updates
    const interval = setInterval(() => {
      const hasToken = !!localStorage.getItem('authToken');
      if (hasToken !== isAuthenticated) {
        setIsAuthenticated(hasToken);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const initializeProjects = async () => {
      if (!isAuthenticated || projectsInitialized) {
        return;
      }

      try {
        const response = await apiClient.get('/projects');
        const data = response.data?.data || [];
        setHasProjects(data.length > 0);
      } catch (error) {
        console.error('Failed to initialize projects:', error);
      } finally {
        setProjectsInitialized(true);
      }
    };

    initializeProjects();
  }, [isAuthenticated, projectsInitialized, setHasProjects, setProjectsInitialized]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <Layout>
                  <Routes>
                    {hasProjects ? (
                      <>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/routes" element={<RoutesPage />} />
                        <Route path="/consumers" element={<Consumers />} />
                        <Route path="/api-keys" element={<ApiKeys />} />
                        <Route path="/ip-rules" element={<IpRules />} />
                        <Route path="/geo-rules" element={<GeoRules />} />
                        <Route path="/bot-rules" element={<BotRules />} />
                        <Route path="/transformations" element={<Transformations />} />
                        <Route path="/termination-rules" element={<TerminationRules />} />
                        <Route path="/logs" element={<Logs />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </>
                    ) : (
                      <>
                        <Route path="/" element={<Navigate to="/projects" replace />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/projects" replace />} />
                      </>
                    )}
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;