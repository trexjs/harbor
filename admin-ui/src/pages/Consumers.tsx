import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons';
import { apiClient } from '../services/api';
import SearchBar from '../components/SearchBar';
import ConsumerModal from '../components/ConsumerModal';

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
  name: string;
  email: string;
  customId?: string;
  tags?: string[];
  createdAt: string;
}

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Consumers: React.FC = () => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConsumer, setEditingConsumer] = useState<Consumer | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    const fetchConsumers = async () => {
      try {
        const response = await apiClient.get('/consumers');
        // API returns { data: consumers, pagination: {...} }
        setConsumers(response.data.data || []);
      } catch (error: any) {
        console.error('Failed to fetch consumers:', error);
        setError(error.response?.data?.message || 'Failed to load consumers');
      } finally {
        setLoading(false);
      }
    };

    fetchConsumers();
  }, []);

  const filteredConsumers = consumers.filter(consumer =>
    consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consumer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (consumer.customId && consumer.customId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchConsumers = async () => {
    try {
      const response = await apiClient.get('/consumers');
      setConsumers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch consumers:', error);
    }
  };

  const handleCreate = () => {
    setEditingConsumer(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (consumer: Consumer) => {
    setEditingConsumer(consumer);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const getModalData = () => {
    if (!editingConsumer) return undefined;
    return {
      name: editingConsumer.name,
      email: editingConsumer.email,
      customId: editingConsumer.customId,
      tags: editingConsumer.tags?.join(', ') || '',
    };
  };

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        customId: data.customId || undefined,
        tags: data.tags
          ? data.tags
              .split(',')
              .map((tag: string) => tag.trim())
              .filter((tag: string) => tag.length > 0)
          : [],
      };
      if (modalMode === 'create') {
        await apiClient.post('/consumers', payload);
      } else if (editingConsumer) {
        await apiClient.put(`/consumers/${editingConsumer._id}`, payload);
      }
      await fetchConsumers();
      setIsModalOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDelete = async (consumerId: string) => {
    if (window.confirm('Are you sure you want to delete this consumer?')) {
      try {
        await apiClient.delete(`/consumers/${consumerId}`);
        setConsumers(consumers.filter(consumer => consumer._id !== consumerId));
      } catch (error) {
        console.error('Failed to delete consumer:', error);
        alert('Failed to delete consumer');
      }
    }
  };

  if (loading) {
    return <div>Loading consumers...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <ConsumersContainer>
      <PageHeader>
        <PageTitle>Consumers</PageTitle>
        <AddButton onClick={handleCreate}>
          <PlusIcon />
          Add Consumer
        </AddButton>
      </PageHeader>

      <ConsumerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={getModalData()}
        mode={modalMode}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search consumers..."
      />

      <ConsumersTable>
        <TableHeader>
          <div>Name</div>
          <div>Email</div>
          <div>Custom ID</div>
          <div>Tags</div>
          <div>Created</div>
          <div>Actions</div>
        </TableHeader>

        {filteredConsumers.length === 0 ? (
          <EmptyState>
            {searchTerm ? 'No consumers found matching your search.' : 'No consumers yet. Click "Add Consumer" to create one.'}
          </EmptyState>
        ) : (
          filteredConsumers.map((consumer) => (
            <TableRow key={consumer._id}>
              <ConsumerName>{consumer.name}</ConsumerName>
              <div>{consumer.email}</div>
              <div>{consumer.customId || '-'}</div>
              <div>{consumer.tags?.join(', ') || '-'}</div>
              <div>{new Date(consumer.createdAt).toLocaleDateString()}</div>
              <ActionButtons>
                <ActionButton title="Edit" onClick={() => handleEdit(consumer)}>
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
          ))
        )}
      </ConsumersTable>
    </ConsumersContainer>
  );
};

export default Consumers;
