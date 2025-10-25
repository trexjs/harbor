import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../components/icons';
import { apiClient } from '../services/api';

const ConsumersContainer = styled.div`
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

const ConsumersTable = styled.div`
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

const ConsumerName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
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

interface Consumer {
  _id: string;
  username: string;
  customId?: string;
  tags?: string[];
  createdAt: string;
}

const Consumers: React.FC = () => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConsumers = async () => {
      try {
        const response = await apiClient.get('/consumers');
        setConsumers(response.data);
      } catch (error) {
        console.error('Failed to fetch consumers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsumers();
  }, []);

  const filteredConsumers = consumers.filter(consumer =>
    consumer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (consumer.customId && consumer.customId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (consumerId: string) => {
    if (window.confirm('Are you sure you want to delete this consumer?')) {
      try {
        await apiClient.delete(`/consumers/${consumerId}`);
        setConsumers(consumers.filter(consumer => consumer._id !== consumerId));
      } catch (error) {
        console.error('Failed to delete consumer:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading consumers...</div>;
  }

  return (
    <ConsumersContainer>
      <PageHeader>
        <PageTitle>Consumers</PageTitle>
        <AddButton>
          <PlusIcon />
          Add Consumer
        </AddButton>
      </PageHeader>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search consumers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchBar>

      <ConsumersTable>
        <TableHeader>
          <div>Username</div>
          <div>Custom ID</div>
          <div>Tags</div>
          <div>Created</div>
          <div>Actions</div>
        </TableHeader>

        {filteredConsumers.map((consumer) => (
          <TableRow key={consumer._id}>
            <ConsumerName>{consumer.username}</ConsumerName>
            <div>{consumer.customId || '-'}</div>
            <div>{consumer.tags?.join(', ') || '-'}</div>
            <div>{new Date(consumer.createdAt).toLocaleDateString()}</div>
            <ActionButtons>
              <ActionButton title="Edit">
                <EditIcon />
              </ActionButton>
              <DeleteButton 
                title="Delete"
                onClick={() => handleDelete(consumer._id)}
              >
                <DeleteIcon />
              </DeleteButton>
            </ActionButtons>
          </TableRow>
        ))}
      </ConsumersTable>
    </ConsumersContainer>
  );
};

export default Consumers;
