import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../components/icons';
import { apiClient } from '../services/api';

const IpRulesContainer = styled.div`
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

const IpRulesTable = styled.div`
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

const TypeBadge = styled.span<{ type: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
  background: ${({ type }) => type === 'blacklist' ? '#EF444420' : '#10B98120'};
  color: ${({ type }) => type === 'blacklist' ? '#EF4444' : '#10B981'};
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

interface IpRule {
  _id: string;
  type: 'blacklist' | 'whitelist';
  ips: string[];
  reason: string;
  active: boolean;
  createdAt: string;
}

const IpRules: React.FC = () => {
  const [ipRules, setIpRules] = useState<IpRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchIpRules = async () => {
      try {
        const response = await apiClient.get('/ip-rules');
        setIpRules(response.data);
      } catch (error) {
        console.error('Failed to fetch IP rules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIpRules();
  }, []);

  const filteredIpRules = ipRules.filter(rule =>
    rule.ips.some(ip => ip.toLowerCase().includes(searchTerm.toLowerCase())) ||
    rule.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this IP rule?')) {
      try {
        await apiClient.delete(`/ip-rules/${ruleId}`);
        setIpRules(ipRules.filter(rule => rule._id !== ruleId));
      } catch (error) {
        console.error('Failed to delete IP rule:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading IP rules...</div>;
  }

  return (
    <IpRulesContainer>
      <PageHeader>
        <PageTitle>IP Rules</PageTitle>
        <AddButton>
          <PlusIcon />
          Add IP Rule
        </AddButton>
      </PageHeader>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search IP rules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchBar>

      <IpRulesTable>
        <TableHeader>
          <div>Type</div>
          <div>IPs</div>
          <div>Reason</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </TableHeader>

        {filteredIpRules.map((rule) => (
          <TableRow key={rule._id}>
            <TypeBadge type={rule.type}>
              {rule.type}
            </TypeBadge>
            <div>{rule.ips.join(', ')}</div>
            <div>{rule.reason}</div>
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
      </IpRulesTable>
    </IpRulesContainer>
  );
};

export default IpRules;
