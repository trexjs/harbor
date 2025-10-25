import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons';
import { apiClient } from '../services/api';
import SearchBar from '../components/SearchBar';
import TransformationModal from '../components/TransformationModal';

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

const TransformationsTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.borderLight};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr auto;
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

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

interface Transformation {
  _id: string;
  routeId: {
    _id: string;
    name: string;
    path: string;
  } | string;
  type: 'request' | 'response';
  actions: Array<{
    type: string;
    name?: string;
    value?: string;
    operation?: string;
    target?: string;
    jsonPath?: string;
    regex?: string;
    replacement?: string;
  }>;
  priority: number;
  active: boolean;
  createdAt: string;
}

interface RouteOption {
  _id: string;
  name: string;
  path: string;
}

const Transformations: React.FC = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransformation, setEditingTransformation] = useState<Transformation | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchTransformations(), fetchRoutes()]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchTransformations = async () => {
    try {
      const response = await apiClient.get('/transformations');
      setTransformations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch transformations:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await apiClient.get('/routes');
      const data = response.data?.data || [];
      const options: RouteOption[] = data.map((route: any) => ({
        _id: route._id,
        name: route.name,
        path: route.path,
      }));
      setRoutes(options);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const filteredTransformations = transformations.filter((transformation) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return true;
    }

    const matchesRoute = (() => {
      if (typeof transformation.routeId === 'string') {
        const route = routes.find((route) => route._id === transformation.routeId);
        return route ? `${route.name} ${route.path}`.toLowerCase().includes(term) : false;
      }

      const route = transformation.routeId;
      return `${route?.name ?? ''} ${route?.path ?? ''}`.toLowerCase().includes(term);
    })();

    const matchesMeta = (
      transformation.type.toLowerCase().includes(term) ||
      transformation.priority.toString().includes(term) ||
      (transformation.active ? 'active' : 'inactive').includes(term)
    );

    const matchesActions = transformation.actions.some((action) => {
      const fields = [action.type, action.name, action.operation, action.target, action.value, action.jsonPath, action.regex];
      return fields.some((field) => field?.toLowerCase().includes(term));
    });

    return matchesRoute || matchesMeta || matchesActions;
  });

  const handleCreate = () => {
    setEditingTransformation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transformation: Transformation) => {
    setEditingTransformation(transformation);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingTransformation) {
        await apiClient.put(`/transformations/${editingTransformation._id}`, data);
      } else {
        await apiClient.post('/transformations', data);
      }
      await fetchTransformations();
      setIsModalOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

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
        <AddButton onClick={handleCreate}>
          <PlusIcon />
          Add Transformation
        </AddButton>
      </PageHeader>

      <TransformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingTransformation ? {
          routeId: typeof editingTransformation.routeId === 'string' ? editingTransformation.routeId : editingTransformation.routeId._id,
          type: editingTransformation.type,
          priority: editingTransformation.priority,
          active: editingTransformation.active,
          actions: editingTransformation.actions.map(action => ({
            operation: (action.operation as any) || (action.type as any) || 'add-header',
            target: action.target,
            value: action.value,
            jsonPath: action.jsonPath,
            regex: action.regex,
            replacement: action.replacement,
          })),
        } : undefined}
        routes={routes}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search transformations..."
      />

      <TransformationsTable>
        <TableHeader>
          <div>Route</div>
          <div>Type</div>
          <div>Actions</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </TableHeader>

        {filteredTransformations.length === 0 ? (
          <EmptyState>
            {searchTerm
              ? 'No transformations found matching your search.'
              : 'No transformations yet. Click "Add Transformation" to create one.'}
          </EmptyState>
        ) : (
          filteredTransformations.map((transformation) => (
            <TableRow key={transformation._id}>
              <div>
                {typeof transformation.routeId === 'string'
                  ? routes.find(route => route._id === transformation.routeId)?.name || '—'
                  : transformation.routeId?.name || '—'}
              </div>
              <TypeBadge type={transformation.type}>
                {transformation.type}
              </TypeBadge>
              <div>{transformation.actions.length} action(s)</div>
              <div>{transformation.priority}</div>
              <div>{transformation.active ? 'Active' : 'Inactive'}</div>
              <div>{new Date(transformation.createdAt).toLocaleDateString()}</div>
              <ActionButtons>
                <ActionButton title="Edit" onClick={() => handleEdit(transformation)}>
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
          ))
        )}
      </TransformationsTable>
    </TransformationsContainer>
  );
};

export default Transformations;
