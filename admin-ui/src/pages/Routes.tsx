import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '../components/icons';
import { apiClient } from '../services/api';
import SearchBar from '../components/SearchBar';
import RouteModal from '../components/RouteModal';

const RoutesContainer = styled.div`
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

const RoutesTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.borderLight};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
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

const RouteName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const RoutePath = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
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

const ToggleButton = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ active }) => active ? '#10B98120' : '#EF444420'};
  color: ${({ active }) => active ? '#10B981' : '#EF4444'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface Route {
  _id: string;
  name: string;
  path: string;
  method: string[];
  targets: Array<{
    url: string;
    weight: number;
  }>;
  active: boolean;
  stripPath?: boolean;
  preserveHost?: boolean;
  requireAuth?: boolean;
  timeout?: number;
  loadBalancer?: {
    algorithm: string;
  };
  rateLimit?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  createdAt: string;
}

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await apiClient.get('/routes');
        setRoutes(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchRoutes = async () => {
    try {
      const response = await apiClient.get('/routes');
      setRoutes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const handleCreate = () => {
    setEditingRoute(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = async (routeId: string) => {
    try {
      const response = await apiClient.get(`/routes/${routeId}`);
      setEditingRoute(response.data.data);
      setModalMode('edit');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch route:', error);
      alert('Failed to load route details');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await apiClient.post('/routes', data);
      } else if (editingRoute) {
        await apiClient.put(`/routes/${editingRoute._id}`, data);
      }
      await fetchRoutes();
      setIsModalOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDelete = async (routeId: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await apiClient.delete(`/routes/${routeId}`);
        setRoutes(routes.filter(route => route._id !== routeId));
      } catch (error) {
        console.error('Failed to delete route:', error);
        alert('Failed to delete route');
      }
    }
  };

  const handleToggleStatus = async (routeId: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/routes/${routeId}/status`, { active: !currentStatus });
      setRoutes(routes.map(route => 
        route._id === routeId ? { ...route, active: !currentStatus } : route
      ));
    } catch (error) {
      console.error('Failed to toggle route status:', error);
      alert('Failed to update route status');
    }
  };

  if (loading) {
    return <div>Loading routes...</div>;
  }

  return (
    <RoutesContainer>
      <PageHeader>
        <PageTitle>Routes</PageTitle>
        <AddButton onClick={handleCreate}>
          <PlusIcon />
          Add Route
        </AddButton>
      </PageHeader>

      <RouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingRoute || undefined}
        mode={modalMode}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search routes..."
      />

      <RoutesTable>
        <TableHeader>
          <div>Name</div>
          <div>Path</div>
          <div>Method</div>
          <div>Targets</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>

        {filteredRoutes.length === 0 ? (
          <EmptyState>
            {searchTerm ? 'No routes found matching your search.' : 'No routes yet. Click "Add Route" to create one.'}
          </EmptyState>
        ) : (
          filteredRoutes.map((route) => (
          <TableRow key={route._id}>
            <RouteName>{route.name}</RouteName>
            <RoutePath>{route.path}</RoutePath>
            <div>{route.method.join(', ')}</div>
            <div>{route.targets.length} target(s)</div>
            <StatusBadge active={route.active}>
              {route.active ? 'Active' : 'Inactive'}
            </StatusBadge>
            <ActionButtons>
              <ToggleButton
                active={route.active}
                title={route.active ? 'Deactivate' : 'Activate'}
                onClick={() => handleToggleStatus(route._id, route.active)}
              >
                {route.active ? <CheckIcon /> : <CloseIcon />}
              </ToggleButton>
              <ActionButton title="Edit" onClick={() => handleEdit(route._id)}>
                <EditIcon />
              </ActionButton>
              <DeleteButton 
                title="Delete"
                onClick={() => handleDelete(route._id)}
              >
                <DeleteIcon />
              </DeleteButton>
            </ActionButtons>
          </TableRow>
          ))
        )}
      </RoutesTable>
    </RoutesContainer>
  );
};

export default Routes;
