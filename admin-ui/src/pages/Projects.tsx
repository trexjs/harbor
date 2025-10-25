import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons';
import { apiClient } from '../services/api';
import SearchBar from '../components/SearchBar';
import ProjectModal, { ProjectFormData, ProjectResources } from '../components/ProjectModal';
import { useApp } from '../context/AppContext';

const ProjectsContainer = styled.div`
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

const ProjectsTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 2fr 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.borderLight};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 2fr 1fr 1fr auto;
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

const StatusBadge = styled.span<{ status: 'active' | 'inactive' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
  background: ${({ status }) => status === 'active' ? '#10B98120' : '#EF444420'};
  color: ${({ status }) => status === 'active' ? '#10B981' : '#EF4444'};
`;

const ResourceTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ResourceTag = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.xs};
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

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  routes: Array<{ _id: string; name: string; path: string }>;
  consumers: Array<{ _id: string; name: string }>;  
  apiKeys: Array<{ _id: string; name?: string; keyPrefix?: string }>;
  ipRules: Array<{ _id: string; name?: string; action?: string }>;
  geoRules: Array<{ _id: string; type: string; action: string; countries: string[] }>;
  botRules: Array<{ _id: string; name: string; riskLevel?: string }>;
  transformations: Array<{ _id: string; type: string; priority: number }>;
  terminationRules: Array<{ _id: string; name: string; type?: string }>;
  createdAt: string;
  updatedAt: string;
}

type ResourceKeys = 'routes' | 'consumers' | 'apiKeys' | 'ipRules' | 'geoRules' | 'botRules' | 'transformations' | 'terminationRules';

const resourceSummaryLabels: Array<{ key: ResourceKeys; label: string }> = [
  { key: 'routes', label: 'Routes' },
  { key: 'consumers', label: 'Consumers' },
  { key: 'apiKeys', label: 'API Keys' },
  { key: 'ipRules', label: 'IP Rules' },
  { key: 'geoRules', label: 'Geo Rules' },
  { key: 'botRules', label: 'Bot Rules' },
  { key: 'transformations', label: 'Transformations' },
  { key: 'terminationRules', label: 'Termination Rules' },
];

const Projects: React.FC = () => {
  const { setHasProjects, setProjectsInitialized } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [resources, setResources] = useState<ProjectResources | null>(null);
  const [resourceLoading, setResourceLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchProjects();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      const data = response.data.data || [];
      setProjects(data);
      setHasProjects(data.length > 0);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setProjectsInitialized(true);
    }
  };

  const loadResources = async () => {
    setResourceLoading(true);
    try {
      const response = await apiClient.get('/projects/resources');
      setResources(response.data.data);
    } catch (error) {
      console.error('Failed to load project resources:', error);
    } finally {
      setResourceLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return projects;
    }

    return projects.filter((project) => {
      const matchesName = project.name.toLowerCase().includes(term);
      const matchesDescription = project.description?.toLowerCase().includes(term) ?? false;
      const matchesStatus = project.status.toLowerCase().includes(term);

      const matchesResources = resourceSummaryLabels.some(({ key }) => {
        const items = project[key] as unknown[];
        if (!Array.isArray(items) || items.length === 0) {
          return false;
        }

        return items.some((item) => {
          if (!item) return false;
          if (typeof item === 'string') {
            const stringItem = item as string;
            return stringItem.toLowerCase().includes(term);
          }
          if (typeof item === 'object') {
            return Object.values(item as Record<string, unknown>)
              .filter((value): value is string => typeof value === 'string')
              .some((value) => value.toLowerCase().includes(term));
          }
          return false;
        });
      });

      return matchesName || matchesDescription || matchesStatus || matchesResources;
    });
  }, [projects, searchTerm]);

  const handleCreate = async () => {
    setEditingProject(null);
    setModalMode('create');
    setIsModalOpen(true);

    if (!resources && !resourceLoading) {
      await loadResources();
    }
  };

  const handleEdit = async (project: Project) => {
    setEditingProject(project);
    setModalMode('edit');
    setIsModalOpen(true);

    if (!resources && !resourceLoading) {
      await loadResources();
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await apiClient.delete(`/projects/${projectId}`);
      setProjects((prev) => {
        const updated = prev.filter((project) => project._id !== projectId);
        setHasProjects(updated.length > 0);
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleSubmit = async (data: ProjectFormData) => {
    if (modalMode === 'create') {
      const response = await apiClient.post('/projects', data);
      setProjects((prev) => {
        const updated = [response.data.data, ...prev];
        setHasProjects(updated.length > 0);
        return updated;
      });
    } else if (editingProject) {
      const response = await apiClient.put(`/projects/${editingProject._id}`, data);
      setProjects((prev) => prev.map((project) => (
        project._id === editingProject._id ? response.data.data : project
      )));
      setHasProjects(true);
    }
  };

  const initialModalData: ProjectFormData | undefined = useMemo(() => {
    if (!editingProject) {
      return undefined;
    }

    return {
      name: editingProject.name,
      description: editingProject.description || '',
      status: editingProject.status,
      routes: editingProject.routes.map((route) => route._id),
      consumers: editingProject.consumers.map((consumer) => consumer._id),
      apiKeys: editingProject.apiKeys.map((apiKey) => apiKey._id),
      ipRules: editingProject.ipRules.map((rule) => rule._id),
      geoRules: editingProject.geoRules.map((rule) => rule._id),
      botRules: editingProject.botRules.map((rule) => rule._id),
      transformations: editingProject.transformations.map((rule) => rule._id),
      terminationRules: editingProject.terminationRules.map((rule) => rule._id),
    };
  }, [editingProject]);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <ProjectsContainer>
      <PageHeader>
        <PageTitle>Projects</PageTitle>
        <AddButton onClick={handleCreate}>
          <PlusIcon />
          Create Project
        </AddButton>
      </PageHeader>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialModalData}
        mode={modalMode}
        resources={resources || {
          routes: [],
          consumers: [],
          apiKeys: [],
          ipRules: [],
          geoRules: [],
          botRules: [],
          transformations: [],
          terminationRules: [],
        }}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search projects..."
      />

      <ProjectsTable>
        <TableHeader>
          <div>Name</div>
          <div>Status</div>
          <div>Description</div>
          <div>Routes</div>
          <div>Last Updated</div>
          <div>Actions</div>
        </TableHeader>

        {filteredProjects.length === 0 ? (
          <EmptyState>
            {searchTerm
              ? 'No projects found matching your search.'
              : 'No projects yet. Click "Create Project" to add one.'}
          </EmptyState>
        ) : (
          filteredProjects.map((project) => (
            <TableRow key={project._id}>
              <div>
                <strong>{project.name}</strong>
                {project.description ? (
                  <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
                    {project.description}
                  </div>
                ) : null}
              </div>
              <StatusBadge status={project.status}>
                {project.status === 'active' ? 'Active' : 'Inactive'}
              </StatusBadge>
              <ResourceTags>
                {resourceSummaryLabels.map(({ key, label }) => {
                  const list = project[key];
                  if (!Array.isArray(list) || list.length === 0) {
                    return null;
                  }

                  return (
                    <ResourceTag key={`${project._id}-${key}`}>
                      {label}: {list.length}
                    </ResourceTag>
                  );
                })}
              </ResourceTags>
              <div>
                {project.routes.slice(0, 2).map((route) => (
                  <div key={route._id}>{route.name} ({route.path})</div>
                ))}
                {project.routes.length > 2 && (
                  <div>+{project.routes.length - 2} more</div>
                )}
              </div>
              <div>{new Date(project.updatedAt || project.createdAt).toLocaleString()}</div>
              <ActionButtons>
                <ActionButton title="Edit" onClick={() => handleEdit(project)}>
                  <EditIcon />
                </ActionButton>
                <DeleteButton title="Delete" onClick={() => handleDelete(project._id)}>
                  <DeleteIcon />
                </DeleteButton>
              </ActionButtons>
            </TableRow>
          ))
        )}
      </ProjectsTable>
    </ProjectsContainer>
  );
};

export default Projects;
