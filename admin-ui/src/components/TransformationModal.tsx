import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CloseIcon, PlusIcon, DeleteIcon } from './icons';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  width: 95%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
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
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-end;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RemoveButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  background: #ef444420;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #ef444440;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AddActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;

  input[type='checkbox'] {
    cursor: pointer;
  }
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  ${({ variant = 'primary', theme }) =>
    variant === 'primary'
      ? `
    background: ${theme.colors.primary};
    color: white;
    border: none;

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
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: #dc2626;
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const HelpText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface RouteOption {
  _id: string;
  name: string;
  path: string;
}

interface ActionForm {
  operation:
    | 'add-header'
    | 'remove-header'
    | 'modify-header'
    | 'add-body-field'
    | 'remove-body-field'
    | 'transform-body'
    | 'rewrite-path'
    | 'add-query-param'
    | 'remove-query-param';
  target?: string;
  value?: string;
  jsonPath?: string;
  regex?: string;
  replacement?: string;
}

interface TransformationFormData {
  routeId: string;
  type: 'request' | 'response';
  priority: number;
  active: boolean;
  actions: ActionForm[];
}

interface TransformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    routeId: string;
    type: 'request' | 'response';
    priority: number;
    active: boolean;
    actions: ActionForm[];
  }) => Promise<void>;
  initialData?: Partial<TransformationFormData>;
  routes: RouteOption[];
}

const defaultAction: ActionForm = {
  operation: 'add-header',
  target: '',
  value: '',
};

const defaultForm: TransformationFormData = {
  routeId: '',
  type: 'request',
  priority: 100,
  active: true,
  actions: [defaultAction],
};

const TransformationModal: React.FC<TransformationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  routes,
}) => {
  const [formData, setFormData] = useState<TransformationFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          routeId: initialData.routeId || '',
          type: initialData.type || 'request',
          priority: initialData.priority ?? 100,
          active: initialData.active ?? true,
          actions:
            initialData.actions && initialData.actions.length > 0
              ? initialData.actions.map((action) => ({
                  operation: (action.operation as ActionForm['operation']) || 'add-header',
                  target: action.target ?? '',
                  value: action.value ? String(action.value) : '',
                  jsonPath: action.jsonPath ?? '',
                  regex: action.regex ?? '',
                  replacement: action.replacement ?? '',
                }))
              : [defaultAction],
        });
      } else {
        setFormData(defaultForm);
        setError('');
      }
    }
  }, [isOpen, initialData]);

  const handleActionChange = (index: number, key: keyof ActionForm, value: string) => {
    const updated = [...formData.actions];
    updated[index] = { ...updated[index], [key]: value };
    setFormData({ ...formData, actions: updated });
  };

  const addAction = () => {
    setFormData({ ...formData, actions: [...formData.actions, defaultAction] });
  };

  const removeAction = (index: number) => {
    if (formData.actions.length === 1) return;
    setFormData({ ...formData, actions: formData.actions.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.routeId) {
      setError('Please select a route');
      return;
    }

    if (formData.actions.some((action) => !action.operation || !action.operation.trim())) {
      setError('Each action requires an operation');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      routeId: formData.routeId,
      type: formData.type,
      priority: formData.priority,
      active: formData.active,
      actions: formData.actions.map((action) => ({
        operation: action.operation,
        target: action.target?.trim() || undefined,
        value: action.value?.trim() || undefined,
        jsonPath: action.jsonPath?.trim() || undefined,
        regex: action.regex?.trim() || undefined,
        replacement: action.replacement?.trim() || undefined,
      })),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save transformation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{initialData ? 'Edit Transformation' : 'Create Transformation'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FormGroup>
              <Label>Route *</Label>
              <Select
                value={formData.routeId}
                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select route
                </option>
                {routes.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.name} ({route.path})
                  </option>
                ))}
              </Select>
            </FormGroup>

            <Row>
              <FormGroup>
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TransformationFormData['type'] })}
                >
                  <option value="request">Request</option>
                  <option value="response">Response</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                />
                <HelpText>Lower priority numbers execute first.</HelpText>
              </FormGroup>
            </Row>

            <FormGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                Active
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <Label>Actions *</Label>
              <ActionsList>
                {formData.actions.map((action, index) => (
                  <ActionRow key={index}>
                    <div>
                      <Label>Operation</Label>
                      <Select
                        value={action.operation}
                        onChange={(e) => handleActionChange(index, 'operation', e.target.value)}
                      >
                        <option value="add-header">Add Header</option>
                        <option value="remove-header">Remove Header</option>
                        <option value="modify-header">Modify Header</option>
                        <option value="add-body-field">Add Body Field</option>
                        <option value="remove-body-field">Remove Body Field</option>
                        <option value="transform-body">Transform Body</option>
                        <option value="rewrite-path">Rewrite Path</option>
                        <option value="add-query-param">Add Query Param</option>
                        <option value="remove-query-param">Remove Query Param</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Target</Label>
                      <Input
                        value={action.target || ''}
                        onChange={(e) => handleActionChange(index, 'target', e.target.value)}
                        placeholder="Header name, JSON path, etc."
                      />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={action.value || ''}
                        onChange={(e) => handleActionChange(index, 'value', e.target.value)}
                        placeholder="Value or expression"
                      />
                    </div>
                    <div>
                      <Label>Regex / Replacement</Label>
                      <Input
                        value={action.regex || ''}
                        onChange={(e) => handleActionChange(index, 'regex', e.target.value)}
                        placeholder="Regex (optional)"
                        style={{ marginBottom: 4 }}
                      />
                      <Input
                        value={action.replacement || ''}
                        onChange={(e) => handleActionChange(index, 'replacement', e.target.value)}
                        placeholder="Replacement (optional)"
                      />
                    </div>
                    <RemoveButton type="button" onClick={() => removeAction(index)}>
                      <DeleteIcon />
                    </RemoveButton>
                  </ActionRow>
                ))}
                <AddActionButton type="button" onClick={addAction}>
                  <PlusIcon /> Add Action
                </AddActionButton>
              </ActionsList>
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update Transformation' : 'Create Transformation'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TransformationModal;
