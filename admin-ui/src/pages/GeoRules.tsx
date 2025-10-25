import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../components/icons';
import { apiClient } from '../services/api';

const GeoRulesContainer = styled.div`
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

const AddButton = styled.button`
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

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SearchInput = styled.input`
  flex: 1;
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

const GeoRulesTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.borderLight};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
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

const ActionBadge = styled.span<{ action: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
  background: ${({ action }) => {
    switch (action) {
      case 'block': return '#EF444420';
      case 'allow': return '#10B98120';
      case 'rate-limit': return '#F59E0B20';
      default: return '#6B728020';
    }
  }};
  color: ${({ action }) => {
    switch (action) {
      case 'block': return '#EF4444';
      case 'allow': return '#10B981';
      case 'rate-limit': return '#F59E0B';
      default: return '#6B7280';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    background: #EF444420;
    color: #EF4444;
    border-color: #EF4444;
  }
`;

interface GeoRule {
  _id: string;
  action: 'block' | 'allow' | 'rate-limit';
  countries: string[];
  type: 'blacklist' | 'whitelist';
  active: boolean;
  createdAt: string;
}

const GeoRules: React.FC = () => {
  const [geoRules, setGeoRules] = useState<GeoRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGeoRules = async () => {
      try {
        const response = await apiClient.get('/geo-rules');
        setGeoRules(response.data);
      } catch (error) {
        console.error('Failed to fetch geo rules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeoRules();
  }, []);

  const filteredGeoRules = geoRules.filter(rule =>
    rule.countries.some(country => country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this geo rule?')) {
      try {
        await apiClient.delete(`/geo-rules/${ruleId}`);
        setGeoRules(geoRules.filter(rule => rule._id !== ruleId));
      } catch (error) {
        console.error('Failed to delete geo rule:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading geo rules...</div>;
  }

  return (
    <GeoRulesContainer>
      <PageHeader>
        <PageTitle>Geo Rules</PageTitle>
        <AddButton>
          <PlusIcon />
          Add Geo Rule
        </AddButton>
      </PageHeader>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search geo rules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchBar>

      <GeoRulesTable>
        <TableHeader>
          <div>Action</div>
          <div>Countries</div>
          <div>Type</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </TableHeader>

        {filteredGeoRules.map((rule) => (
          <TableRow key={rule._id}>
            <ActionBadge action={rule.action}>
              {rule.action}
            </ActionBadge>
            <div>{rule.countries.join(', ')}</div>
            <div>{rule.type}</div>
            <div>{rule.active ? 'Active' : 'Inactive'}</div>
            <div>{new Date(rule.createdAt).toLocaleDateString()}</div>
            <ActionButtons>
              <ActionButton title="Edit">
                <EditIcon />
              </ActionButton>
              <DeleteButton 
                title="Delete"
                onClick={() => handleDelete(rule._id)}
              >
                <DeleteIcon />
              </DeleteButton>
            </ActionButtons>
          </TableRow>
        ))}
      </GeoRulesTable>
    </GeoRulesContainer>
  );
};

export default GeoRules;
