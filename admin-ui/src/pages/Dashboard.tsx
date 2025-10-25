import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardIcon, RoutesIcon, UsersIcon, ShieldIcon } from '../components/icons';
import { apiClient } from '../services/api';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ color }) => color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color }) => color};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatChange = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ color }) => color};
  font-weight: 500;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const PlaceholderChart = styled.div`
  height: 200px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

interface DashboardStats {
  totalRoutes: number;
  totalConsumers: number;
  totalApiKeys: number;
  blockedRequests: number;
  routesChange: number;
  consumersChange: number;
  apiKeysChange: number;
  blockedChange: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRoutes: 0,
    totalConsumers: 0,
    totalApiKeys: 0,
    blockedRequests: 0,
    routesChange: 0,
    consumersChange: 0,
    apiKeysChange: 0,
    blockedChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch data from multiple endpoints
        const [routes, consumers, apiKeys, logs] = await Promise.all([
          apiClient.get('/routes'),
          apiClient.get('/consumers'),
          apiClient.get('/api-keys'),
          apiClient.get('/logs?limit=1000'),
        ]);

        const blockedCount = logs.data.filter((log: any) => 
          log.ipBlocked || log.geoBlocked || log.terminated
        ).length;

        setStats({
          totalRoutes: routes.data.length,
          totalConsumers: consumers.data.length,
          totalApiKeys: apiKeys.data.length,
          blockedRequests: blockedCount,
          routesChange: 5, // Mock data
          consumersChange: 12,
          apiKeysChange: 8,
          blockedChange: -3,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#3B82F6">
              <RoutesIcon />
            </StatIcon>
            <StatTitle>Total Routes</StatTitle>
          </StatHeader>
          <StatValue>{stats.totalRoutes}</StatValue>
          <StatChange color={stats.routesChange >= 0 ? '#10B981' : '#EF4444'}>
            {stats.routesChange >= 0 ? '+' : ''}{stats.routesChange}% from last month
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#10B981">
              <UsersIcon />
            </StatIcon>
            <StatTitle>Total Consumers</StatTitle>
          </StatHeader>
          <StatValue>{stats.totalConsumers}</StatValue>
          <StatChange color={stats.consumersChange >= 0 ? '#10B981' : '#EF4444'}>
            {stats.consumersChange >= 0 ? '+' : ''}{stats.consumersChange}% from last month
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#F59E0B">
              <DashboardIcon />
            </StatIcon>
            <StatTitle>API Keys</StatTitle>
          </StatHeader>
          <StatValue>{stats.totalApiKeys}</StatValue>
          <StatChange color={stats.apiKeysChange >= 0 ? '#10B981' : '#EF4444'}>
            {stats.apiKeysChange >= 0 ? '+' : ''}{stats.apiKeysChange}% from last month
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#EF4444">
              <ShieldIcon />
            </StatIcon>
            <StatTitle>Blocked Requests</StatTitle>
          </StatHeader>
          <StatValue>{stats.blockedRequests}</StatValue>
          <StatChange color={stats.blockedChange >= 0 ? '#10B981' : '#EF4444'}>
            {stats.blockedChange >= 0 ? '+' : ''}{stats.blockedChange}% from last month
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartCard>
          <ChartTitle>Request Volume</ChartTitle>
          <PlaceholderChart>
            Request volume chart (placeholder)
          </PlaceholderChart>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Response Times</ChartTitle>
          <PlaceholderChart>
            Response times chart (placeholder)
          </PlaceholderChart>
        </ChartCard>
      </ChartsSection>
    </DashboardContainer>
  );
};

export default Dashboard;
