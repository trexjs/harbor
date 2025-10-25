import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, DeleteIcon, SearchIcon, RefreshIcon } from '../components/icons';
import { apiClient } from '../services/api';

const ApiKeysContainer = styled.div`
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

const ApiKeysTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.borderLight};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
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

const ApiKeyValue = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
  background: ${({ active }) => active ? '#10B98120' : '#EF444420'};
  color: ${({ active }) => active ? '#10B981' : '#EF4444'};
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

interface ApiKey {
  _id: string;
  key: string;
  consumer: {
    _id: string;
    username: string;
  };
  active: boolean;
  createdAt: string;
}

const ApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await apiClient.get('/api-keys');
        setApiKeys(response.data);
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  const filteredApiKeys = apiKeys.filter(apiKey =>
    apiKey.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apiKey.consumer.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (apiKeyId: string) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        await apiClient.delete(`/api-keys/${apiKeyId}`);
        setApiKeys(apiKeys.filter(apiKey => apiKey._id !== apiKeyId));
      } catch (error) {
        console.error('Failed to delete API key:', error);
      }
    }
  };

  const handleRevoke = async (apiKeyId: string) => {
    if (window.confirm('Are you sure you want to revoke this API key?')) {
      try {
        await apiClient.put(`/api-keys/${apiKeyId}/revoke`);
        setApiKeys(apiKeys.map(apiKey => 
          apiKey._id === apiKeyId ? { ...apiKey, active: false } : apiKey
        ));
      } catch (error) {
        console.error('Failed to revoke API key:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading API keys...</div>;
  }

  return (
    <ApiKeysContainer>
      <PageHeader>
        <PageTitle>API Keys</PageTitle>
        <AddButton>
          <PlusIcon />
          Generate API Key
        </AddButton>
      </PageHeader>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search API keys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchBar>

      <ApiKeysTable>
        <TableHeader>
          <div>API Key</div>
          <div>Consumer</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </TableHeader>

        {filteredApiKeys.map((apiKey) => (
          <TableRow key={apiKey._id}>
            <ApiKeyValue>{apiKey.key}</ApiKeyValue>
            <div>{apiKey.consumer.username}</div>
            <StatusBadge active={apiKey.active}>
              {apiKey.active ? 'Active' : 'Revoked'}
            </StatusBadge>
            <div>{new Date(apiKey.createdAt).toLocaleDateString()}</div>
            <ActionButtons>
              <ActionButton 
                title="Revoke"
                onClick={() => handleRevoke(apiKey._id)}
              >
                <RefreshIcon />
              </ActionButton>
              <DeleteButton 
                title="Delete"
                onClick={() => handleDelete(apiKey._id)}
              >
                <DeleteIcon />
              </DeleteButton>
            </ActionButtons>
          </TableRow>
        ))}
      </ApiKeysTable>
    </ApiKeysContainer>
  );
};

export default ApiKeys;
