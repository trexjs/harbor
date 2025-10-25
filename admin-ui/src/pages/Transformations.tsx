import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../components/icons';
import { apiClient } from '../services/api';

const TransformationsContainer = styled.div`
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

const TransformationsTable = styled.div`
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
  background: ${({ type }) => type === 'request' ? '#3B82F620' : '#10B98120'};
  color: ${({ type }) => type === 'request' ? '#3B82F6' : '#10B981'};
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

interface Transformation {
  _id: string;
  type: 'request' | 'response';
  actions: Array<{
    type: string;
    name?: string;
    value?: string;
  }>;
  priority: number;
  active: boolean;
  createdAt: string;
}

const Transformations: React.FC = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        const response = await apiClient.get('/transformations');
        setTransformations(response.data);
      } catch (error) {
        console.error('Failed to fetch transformations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransformations();
  }, []);

  const filteredTransformations = transformations.filter(transformation =>
    transformation.actions.some(action => 
      action.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (action.name && action.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const handleDelete = async (transformationId: string) => {
    if (window.confirm('Are you sure you want to delete this transformation?')) {
      try {
        await apiClient.delete(`/transformations/${transformationId}`);
        setTransformations(transformations.filter(transformation => transformation._id !== transformationId));
      } catch (error) {
        console.error('Failed to delete transformation:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading transformations...</div>;
  }

  return (
    <TransformationsContainer>
      <PageHeader>
        <PageTitle>Transformations</PageTitle>
        <AddButton>
          <PlusIcon />
          Add Transformation
        </AddButton>
      </PageHeader>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search transformations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchBar>

      <TransformationsTable>
        <TableHeader>
          <div>Type</div>
          <div>Actions</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </TableHeader>

        {filteredTransformations.map((transformation) => (
          <TableRow key={transformation._id}>
            <TypeBadge type={transformation.type}>
              {transformation.type}
            </TypeBadge>
            <div>{transformation.actions.length} action(s)</div>
            <div>{transformation.priority}</div>
            <div>{transformation.active ? 'Active' : 'Inactive'}</div>
            <div>{new Date(transformation.createdAt).toLocaleDateString()}</div>
            <ActionButtons>
              <ActionButton title="Edit">
                <EditIcon />
              </ActionButton>
              <DeleteButton 
                title="Delete"
                onClick={() => handleDelete(transformation._id)}
              >
                <DeleteIcon />
              </DeleteButton>
            </ActionButtons>
          </TableRow>
        ))}
      </TransformationsTable>
    </TransformationsContainer>
  );
};

export default Transformations;
