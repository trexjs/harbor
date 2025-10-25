import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { CloseIcon } from './icons';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 90%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  min-height: 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ResourcesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const GroupRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSize.sm};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSize.sm};
  min-height: 44px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const MultiSelect = styled(Select)`
  min-height: 140px;
  max-height: 220px;
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  margin: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const HelpText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  border: none;

  ${({ variant, theme }) => variant === 'primary'
    ? `
      background: ${theme.colors.primary};
      color: white;

      &:hover {
        background: ${theme.colors.primary}dd;
      }
    `
    : `
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      border: 1px solid ${theme.colors.border};

      &:hover {
        background: ${theme.colors.borderLight};
      }
    `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid #FECACA;
  background: #FEF2F2;
  color: #DC2626;
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

interface BaseOption {
  _id: string;
  name: string;
}

interface RouteOption extends BaseOption {
  path: string;
}

interface ConsumerOption extends BaseOption {
  email?: string;
}

interface ApiKeyOption extends BaseOption {
  keyPrefix?: string;
}

interface IpRuleOption extends BaseOption {
  action?: string;
}

interface GeoRuleOption {
  _id: string;
  action: string;
  type: string;
  countries: string[];
}

interface BotRuleOption extends BaseOption {
  riskLevel?: string;
}

interface TransformationOption {
  _id: string;
  type: string;
  priority: number;
}

interface TerminationRuleOption extends BaseOption {
  type?: string;
}

export interface ProjectResources {
  routes: RouteOption[];
  consumers: ConsumerOption[];
  apiKeys: ApiKeyOption[];
  ipRules: IpRuleOption[];
  geoRules: GeoRuleOption[];
  botRules: BotRuleOption[];
  transformations: TransformationOption[];
  terminationRules: TerminationRuleOption[];
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  routes: string[];
  consumers: string[];
  apiKeys: string[];
  ipRules: string[];
  geoRules: string[];
  botRules: string[];
  transformations: string[];
  terminationRules: string[];
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: Partial<ProjectFormData>;
  mode: 'create' | 'edit';
  resources: ProjectResources;
}

const defaultFormData: ProjectFormData = {
  name: '',
  description: '',
  status: 'active',
  routes: [],
  consumers: [],
  apiKeys: [],
  ipRules: [],
  geoRules: [],
  botRules: [],
  transformations: [],
  terminationRules: [],
};

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  resources,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...defaultFormData,
          ...initialData,
          status: initialData.status === 'inactive' ? 'inactive' : 'active',
          routes: initialData.routes || [],
          consumers: initialData.consumers || [],
          apiKeys: initialData.apiKeys || [],
          ipRules: initialData.ipRules || [],
          geoRules: initialData.geoRules || [],
          botRules: initialData.botRules || [],
          transformations: initialData.transformations || [],
          terminationRules: initialData.terminationRules || [],
        });
      } else {
        setFormData(defaultFormData);
      }
      setError('');
      setLoading(false);
    }
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof ProjectFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiChange = (field: keyof ProjectFormData) => (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const values = Array.from(event.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to save project';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resourceSummary = useMemo(() => ({
    routes: resources.routes.length,
    consumers: resources.consumers.length,
    apiKeys: resources.apiKeys.length,
    ipRules: resources.ipRules.length,
    geoRules: resources.geoRules.length,
    botRules: resources.botRules.length,
    transformations: resources.transformations.length,
    terminationRules: resources.terminationRules.length,
  }), [resources]);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(event) => event.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{mode === 'create' ? 'Create Project' : 'Edit Project'}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <ModalForm onSubmit={handleSubmit}>
          <ModalBody>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <GroupRow>
              <FormGroup>
                <Label htmlFor="project-name">Project Name *</Label>
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="My API Gateway Project"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="project-status">Status</Label>
                <Select
                  id="project-status"
                  value={formData.status}
                  onChange={handleInputChange('status')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormGroup>
            </GroupRow>

            <FormGroup>
              <Label htmlFor="project-description">Description</Label>
              <TextArea
                id="project-description"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Describe the purpose or scope of this project"
              />
            </FormGroup>

            <div>
              <SectionTitle>Resources</SectionTitle>
              <HelpText>
                Select the resources that belong to this project. Hold Ctrl (Windows) or Cmd (macOS) to choose multiple entries.
              </HelpText>
            </div>

            <ResourcesWrapper>
              <GroupRow>
                <FormGroup>
                  <Label>Routes ({resourceSummary.routes})</Label>
                  <MultiSelect
                    multiple
                    value={formData.routes}
                    onChange={handleMultiChange('routes')}
                  >
                    {resources.routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.name} ({route.path})
                      </option>
                    ))}
                  </MultiSelect>
                </FormGroup>

                <FormGroup>
                  <Label>Consumers ({resourceSummary.consumers})</Label>
                  <MultiSelect
                    multiple
                    value={formData.consumers}
                    onChange={handleMultiChange('consumers')}
                  >
                    {resources.consumers.map((consumer) => (
                      <option key={consumer._id} value={consumer._id}>
                        {consumer.name}{consumer.email ? ` (${consumer.email})` : ''}
                      </option>
                    ))}
                  </MultiSelect>
                </FormGroup>
              </GroupRow>

              <GroupRow>
                <FormGroup>
                  <Label>API Keys ({resourceSummary.apiKeys})</Label>
                  <MultiSelect
                    multiple
                    value={formData.apiKeys}
                    onChange={handleMultiChange('apiKeys')}
                  >
                    {resources.apiKeys.map((apiKey) => (
                      <option key={apiKey._id} value={apiKey._id}>
                        {apiKey.name || apiKey.keyPrefix || 'Untitled' }
                      </option>
                    ))}
                  </MultiSelect>
                </FormGroup>

                <FormGroup>
                  <Label>IP Rules ({resourceSummary.ipRules})</Label>
                  <MultiSelect
                    multiple
                    value={formData.ipRules}
                    onChange={handleMultiChange('ipRules')}
                  >
                    {resources.ipRules.map((rule) => (
                      <option key={rule._id} value={rule._id}>
                        {rule.name || rule._id} {rule.action ? `(${rule.action})` : ''}
                      </option>
                    ))}
                  </MultiSelect>
                </FormGroup>
              </GroupRow>

              <GroupRow>
                <FormGroup>
                  <Label>Geo Rules ({resourceSummary.geoRules})</Label>
                  <MultiSelect
                    multiple
                    value={formData.geoRules}
                    onChange={handleMultiChange('geoRules')}
                  >
                    {resources.geoRules.map((rule) => (
                      <option key={rule._id} value={rule._id}>
                        {rule.type} · {rule.action} ({rule.countries.join(', ')})
                      </option>
                    ))}
                  </MultiSelect>
                </FormGroup>

                <FormGroup>
                  <Label>Bot Rules ({resourceSummary.botRules})</Label>
                  <MultiSelect
                    multiple
                    value={formData.botRules}
                    onChange={handleMultiChange('botRules')}
                  >
                    {resources.botRules.map((rule) => (
                      <option key={rule._id} value={rule._id}>
                        {rule.name}{rule.riskLevel ? ` (${rule.riskLevel})` : ''}
                      </option>
                    ))}
                  </MultiSelect>
                </FormGroup>
              </GroupRow>

              <GroupRow>
                <FormGroup>
                  <Label>Transformations ({resourceSummary.transformations})</Label>
                  <MultiSelect
                    multiple
                    value={formData.transformations}
                    onChange={handleMultiChange('transformations')}
                  >
                    {resources.transformations.map((rule) => (
                      <option key={rule._id} value={rule._id}>
                        {rule.type} · Priority {rule.priority}
                      </option>
                    ))}
                  </MultiSelect>
                </FormGroup>

                <FormGroup>
                  <Label>Termination Rules ({resourceSummary.terminationRules})</Label>
                  <MultiSelect
                    multiple
                    value={formData.terminationRules}
                    onChange={handleMultiChange('terminationRules')}
                  >
                    {resources.terminationRules.map((rule) => (
                      <option key={rule._id} value={rule._id}>
                        {rule.name}{rule.type ? ` (${rule.type})` : ''}
                      </option>
                    ))}
                  </MultiSelect>
                </FormGroup>
              </GroupRow>
            </ResourcesWrapper>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Update Project'}
            </Button>
          </ModalFooter>
        </ModalForm>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProjectModal;
