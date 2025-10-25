import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SearchIcon, FilterIcon, RefreshIcon } from '../components/icons';
import { apiClient } from '../services/api';

const LogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primary}dd;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FiltersBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  background: ${({ theme }) => theme.colors.surface};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  background: ${({ theme }) => theme.colors.surface};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const LogsTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.borderLight};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const StatusBadge = styled.span<{ status: number }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
  background: ${({ status }) => {
    if (status >= 200 && status < 300) return '#10B98120';
    if (status >= 300 && status < 400) return '#F59E0B20';
    if (status >= 400 && status < 500) return '#EF444420';
    if (status >= 500) return '#DC262620';
    return '#6B728020';
  }};
  color: ${({ status }) => {
    if (status >= 200 && status < 300) return '#10B981';
    if (status >= 300 && status < 400) return '#F59E0B';
    if (status >= 400 && status < 500) return '#EF4444';
    if (status >= 500) return '#DC2626';
    return '#6B7280';
  }};
`;

const LogPath = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const LogIP = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface Log {
  _id: string;
  correlationId: string;
  method: string;
  path: string;
  ip: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  botDetected: boolean;
  terminated: boolean;
  ipBlocked: boolean;
  geoBlocked: boolean;
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get('/logs?limit=100');
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.correlationId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === '2xx' && log.statusCode >= 200 && log.statusCode < 300) ||
      (statusFilter === '3xx' && log.statusCode >= 300 && log.statusCode < 400) ||
      (statusFilter === '4xx' && log.statusCode >= 400 && log.statusCode < 500) ||
      (statusFilter === '5xx' && log.statusCode >= 500);
    
    const matchesMethod = methodFilter === 'all' || log.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/logs?limit=100');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading logs...</div>;
  }

  return (
    <LogsContainer>
      <PageHeader>
        <PageTitle>Request Logs</PageTitle>
        <RefreshButton onClick={handleRefresh}>
          <RefreshIcon />
          Refresh
        </RefreshButton>
      </PageHeader>

      <FiltersBar>
        <SearchInput
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
        
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="2xx">2xx Success</option>
          <option value="3xx">3xx Redirect</option>
          <option value="4xx">4xx Client Error</option>
          <option value="5xx">5xx Server Error</option>
        </FilterSelect>
        
        <FilterSelect
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="all">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </FilterSelect>
        
        <FilterIcon />
      </FiltersBar>

      <LogsTable>
        <TableHeader>
          <div>Time</div>
          <div>Method</div>
          <div>Path</div>
          <div>IP</div>
          <div>Status</div>
          <div>Response Time</div>
          <div>Flags</div>
        </TableHeader>

        {filteredLogs.map((log) => (
          <TableRow key={log._id}>
            <div>{new Date(log.timestamp).toLocaleString()}</div>
            <div>{log.method}</div>
            <LogPath>{log.path}</LogPath>
            <LogIP>{log.ip}</LogIP>
            <StatusBadge status={log.statusCode}>
              {log.statusCode}
            </StatusBadge>
            <div>{log.responseTime}ms</div>
            <div>
              {log.botDetected && '🤖 '}
              {log.terminated && '🛑 '}
              {log.ipBlocked && '🚫 '}
              {log.geoBlocked && '🌍 '}
            </div>
          </TableRow>
        ))}
      </LogsTable>
    </LogsContainer>
  );
};

export default Logs;
