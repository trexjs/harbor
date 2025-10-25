import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, DeleteIcon, RefreshIcon } from '../components/icons';
import { apiClient } from '../services/api';
import SearchBar from '../components/SearchBar';
import ApiKeyModal from '../components/ApiKeyModal';

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

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

interface ApiKey {
  _id: string;
  keyPrefix: string;
  name?: string;
  consumer: {
    consumerId: string;
    name?: string;
    email?: string;
  };
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface ConsumerOption {
  _id: string;
  name: string;
  email?: string;
}

const ApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumers, setConsumers] = useState<ConsumerOption[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchApiKeys(), fetchConsumers()]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await apiClient.get('/api-keys');
      setApiKeys(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const fetchConsumers = async () => {
    try {
      const response = await apiClient.get('/consumers');
      const options: ConsumerOption[] = (response.data.data || []).map((consumer: any) => ({
        _id: consumer._id,
        name: consumer.name,
        email: consumer.email,
      }));
      setConsumers(options);
    } catch (error) {
      console.error('Failed to fetch consumers:', error);
    }
  };

  const filteredApiKeys = apiKeys.filter(apiKey =>
    (apiKey.name && apiKey.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    apiKey.keyPrefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (apiKey.consumer.name && apiKey.consumer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (apiKey.consumer.email && apiKey.consumer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleGenerate = async (payload: {
    consumerId: string;
    name?: string;
    rateLimit?: {
      requests: number;
      window: string;
    };
    expiresAt?: string | null;
  }) => {
    try {
      const response = await apiClient.post('/api-keys', payload);
      await fetchApiKeys();
      return response.data?.data?.key;
    } catch (error: any) {
      throw error;
    }
  };

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
        <AddButton onClick={handleCreate}>
          <PlusIcon />
          Generate API Key
        </AddButton>
      </PageHeader>

      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerate}
        consumers={consumers}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search API keys..."
      />

      <ApiKeysTable>
        <TableHeader>
          <div>API Key</div>
          <div>Consumer</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </TableHeader>

        {filteredApiKeys.length === 0 ? (
          <EmptyState>
            {searchTerm
              ? 'No API keys found matching your search.'
              : 'No API keys yet. Click "Generate API Key" to create one.'}
          </EmptyState>
        ) : (
          filteredApiKeys.map((apiKey) => (
            <TableRow key={apiKey._id}>
              <ApiKeyValue>
                {apiKey.name ? `${apiKey.name} · ` : ''}
                {apiKey.keyPrefix ? `${apiKey.keyPrefix}••••` : 'Key hidden'}
              </ApiKeyValue>
              <div>
                {apiKey.consumer.name || 'Unknown'}
                {apiKey.consumer.email ? ` (${apiKey.consumer.email})` : ''}
              </div>
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
          ))
        )}
      </ApiKeysTable>
    </ApiKeysContainer>
  );
};

export default ApiKeys;
