import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FilterIcon, RefreshIcon, CloseIcon } from '../components/icons';
import { apiClient } from '../services/api';
import SearchBar from '../components/SearchBar';

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

const StyledSearchBar = styled(SearchBar)`
  flex: 1;
  min-width: 200px;
  margin-bottom: 0;
`;

const FilterInput = styled.input`
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

const FilterCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const ApplyButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primary}dd;
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

const FilterIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  
  svg {
    width: 20px;
    height: 20px;
    display: block;
  }
`;

const LogsTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const SummaryCard = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.surface};
  flex-wrap: wrap;
`;

const SummaryMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 120px;

  span:first-child {
    font-size: ${({ theme }) => theme.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  span:last-child {
    font-size: ${({ theme }) => theme.fontSize.lg};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
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

const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DetailPanel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 90%;
  max-width: 640px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DetailBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  h4 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  pre {
    margin: 0;
    padding: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.colors.borderLight};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-family: ${({ theme }) => theme.fontFamily.mono};
    font-size: ${({ theme }) => theme.fontSize.xs};
    white-space: pre-wrap;
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
  route?: string;
  consumer?: string;
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [correlationIdFilter, setCorrelationIdFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [botFilter, setBotFilter] = useState(false);
  const [terminatedFilter, setTerminatedFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(100);
  const [summary, setSummary] = useState<{ totalRequests: number; averageResponseTime: number; errorRate: number; }>({ totalRequests: 0, averageResponseTime: 0, errorRate: 0 });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailLogs, setDetailLogs] = useState<Log[]>([]);
  const [selectedCorrelationId, setSelectedCorrelationId] = useState('');

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    if (correlationIdFilter.trim()) params.append('correlationId', correlationIdFilter.trim());
    if (ipFilter.trim()) params.append('ip', ipFilter.trim());
    if (statusFilter !== 'all') params.append('statusCode', statusFilter);
    if (methodFilter !== 'all') params.append('method', methodFilter);
    if (botFilter) params.append('botDetected', 'true');
    if (terminatedFilter) params.append('terminated', 'true');
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return params.toString();
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const query = buildQueryParams();
      const response = await apiClient.get(`/logs?${query}`);
      setLogs(response.data.data || []);
      await fetchSummary();
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await apiClient.get(`/logs/stats/summary?${params.toString()}`);
      const data = response.data?.data || {};
      setSummary({
        totalRequests: data.totalRequests ?? 0,
        averageResponseTime: data.averageResponseTime ?? 0,
        errorRate: data.errorRate ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch log summary:', error);
    }
  };

  const handleRefresh = () => {
    applyFilters();
  };

  const openDetail = async (correlationId: string) => {
    setSelectedCorrelationId(correlationId);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await apiClient.get(`/logs/${correlationId}`);
      setDetailLogs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch log details:', error);
      setDetailLogs([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailLogs([]);
    setSelectedCorrelationId('');
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

      <SummaryCard>
        <SummaryMetric>
          <span>Total Requests</span>
          <span>{summary.totalRequests}</span>
        </SummaryMetric>
        <SummaryMetric>
          <span>Average Response Time (ms)</span>
          <span>{summary.averageResponseTime.toFixed(2)}</span>
        </SummaryMetric>
        <SummaryMetric>
          <span>Error Rate (%)</span>
          <span>{(summary.errorRate * 100).toFixed(2)}</span>
        </SummaryMetric>
      </SummaryCard>

      <FiltersBar>
        <StyledSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search logs..."
        />
        
        <FilterInput
          placeholder="Correlation ID"
          value={correlationIdFilter}
          onChange={(e) => setCorrelationIdFilter(e.target.value)}
        />

        <FilterInput
          placeholder="IP Address"
          value={ipFilter}
          onChange={(e) => setIpFilter(e.target.value)}
        />

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

        <FilterInput
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <FilterInput
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <FilterInput
          type="number"
          min={1}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value) || 1)}
          placeholder="Limit"
          style={{ width: 90 }}
        />

        <FilterCheckbox>
          <input
            type="checkbox"
            checked={botFilter}
            onChange={(e) => setBotFilter(e.target.checked)}
          />
          Bot Detected
        </FilterCheckbox>

        <FilterCheckbox>
          <input
            type="checkbox"
            checked={terminatedFilter}
            onChange={(e) => setTerminatedFilter(e.target.checked)}
          />
          Terminated
        </FilterCheckbox>

        <ApplyButton type="button" onClick={applyFilters}>
          Apply Filters
        </ApplyButton>
        
        <FilterIconWrapper>
          <FilterIcon />
        </FilterIconWrapper>
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

        {filteredLogs.length === 0 ? (
          <EmptyState>
            {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
              ? 'No logs found. Try adjusting your search or filters.'
              : 'No logs captured yet. Traffic will appear here once requests are processed.'}
          </EmptyState>
        ) : (
          filteredLogs.map((log) => (
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
              <ApplyButton type="button" onClick={() => openDetail(log.correlationId)}>
                Details
              </ApplyButton>
            </TableRow>
          ))
        )}
      </LogsTable>

      {detailOpen && (
        <DetailOverlay onClick={closeDetail}>
          <DetailPanel onClick={(e) => e.stopPropagation()}>
            <DetailHeader>
              <h3 style={{ margin: 0 }}>Correlation: {selectedCorrelationId}</h3>
              <button
                onClick={closeDetail}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'inherit',
                }}
                aria-label="Close details"
              >
                <CloseIcon />
              </button>
            </DetailHeader>
            <DetailBody>
              {detailLoading ? (
                <div>Loading details...</div>
              ) : detailLogs.length === 0 ? (
                <div>No additional log entries found for this correlation ID.</div>
              ) : (
                detailLogs.map((entry) => (
                  <DetailSection key={entry._id}>
                    <h4>{new Date(entry.timestamp).toLocaleString()}</h4>
                    <div><strong>Method:</strong> {entry.method}</div>
                    <div><strong>Path:</strong> {entry.path}</div>
                    <div><strong>Status:</strong> {entry.statusCode}</div>
                    <div><strong>Response Time:</strong> {entry.responseTime}ms</div>
                    <div><strong>IP:</strong> {entry.ip}</div>
                    <div><strong>Flags:</strong> {[entry.botDetected && 'Bot', entry.terminated && 'Terminated', entry.ipBlocked && 'IP Blocked', entry.geoBlocked && 'Geo Blocked'].filter(Boolean).join(', ') || 'None'}</div>
                  </DetailSection>
                ))
              )}
            </DetailBody>
          </DetailPanel>
        </DetailOverlay>
      )}
    </LogsContainer>
  );
};

export default Logs;
