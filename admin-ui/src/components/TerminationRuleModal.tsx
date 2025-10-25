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
  max-width: 780px;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  min-height: 80px;
  resize: vertical;

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

const ConditionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ConditionRow = styled.div`
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

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const AddButton = styled.button`
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

interface ConditionForm {
  field: 'ip' | 'user-agent' | 'header' | 'path' | 'method' | 'query-param' | 'request-size' | 'country';
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'in' | 'not-in' | 'matches' | 'greater-than' | 'less-than';
  value: string;
  headerName?: string;
}

interface TerminationRuleFormData {
  routeId: string;
  priority: number;
  conditions: ConditionForm[];
  action: 'terminate' | 'redirect' | 'transform';
  responseCode: number;
  responseBody: string;
  redirectUrl: string;
  logReason: boolean;
  active: boolean;
}

interface TerminationRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    routeId: string;
    priority: number;
    conditions: ConditionForm[];
    action: 'terminate' | 'redirect' | 'transform';
    responseCode: number;
    responseBody?: string;
    redirectUrl?: string;
    logReason: boolean;
    active: boolean;
  }) => Promise<void>;
  initialData?: Partial<TerminationRuleFormData>;
  routes: RouteOption[];
}

const defaultCondition: ConditionForm = {
  field: 'ip',
  operator: 'equals',
  value: '',
};

const defaultForm: TerminationRuleFormData = {
  routeId: '',
  priority: 100,
  conditions: [defaultCondition],
  action: 'terminate',
  responseCode: 403,
  responseBody: '',
  redirectUrl: '',
  logReason: true,
  active: true,
};

const TerminationRuleModal: React.FC<TerminationRuleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  routes,
}) => {
  const [formData, setFormData] = useState<TerminationRuleFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          routeId: initialData.routeId || '',
          priority: initialData.priority ?? 100,
          conditions:
            initialData.conditions && initialData.conditions.length > 0
              ? initialData.conditions.map((condition) => ({
                  field: condition.field as ConditionForm['field'],
                  operator: condition.operator as ConditionForm['operator'],
                  value: typeof condition.value === 'string' ? condition.value : String(condition.value ?? ''),
                  headerName: condition.headerName,
                }))
              : [defaultCondition],
          action: initialData.action || 'terminate',
          responseCode: initialData.responseCode ?? 403,
          responseBody: initialData.responseBody || '',
          redirectUrl: initialData.redirectUrl || '',
          logReason: initialData.logReason ?? true,
          active: initialData.active ?? true,
        });
      } else {
        setFormData(defaultForm);
        setError('');
      }
    }
  }, [isOpen, initialData]);

  const handleConditionChange = (index: number, key: keyof ConditionForm, value: string) => {
    const updated = [...formData.conditions];
    updated[index] = { ...updated[index], [key]: value } as ConditionForm;
    setFormData({ ...formData, conditions: updated });
  };

  const addCondition = () => {
    setFormData({ ...formData, conditions: [...formData.conditions, defaultCondition] });
  };

  const removeCondition = (index: number) => {
    if (formData.conditions.length === 1) return;
    setFormData({ ...formData, conditions: formData.conditions.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.routeId) {
      setError('Please select a route');
      return;
    }

    if (formData.conditions.some((condition) => !condition.value.trim())) {
      setError('Each condition requires a value');
      return;
    }

    if (formData.action === 'redirect' && !formData.redirectUrl.trim()) {
      setError('Redirect URL is required when action is redirect');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      routeId: formData.routeId,
      priority: formData.priority,
      conditions: formData.conditions.map((condition) => ({
        field: condition.field,
        operator: condition.operator,
        value: condition.value,
        headerName: condition.field === 'header' ? condition.headerName?.trim() || undefined : undefined,
      })),
      action: formData.action,
      responseCode: formData.responseCode,
      responseBody: formData.responseBody?.trim() || undefined,
      redirectUrl: formData.redirectUrl?.trim() || undefined,
      logReason: formData.logReason,
      active: formData.active,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save termination rule');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{initialData ? 'Edit Termination Rule' : 'Create Termination Rule'}</ModalTitle>
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
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                />
                <HelpText>Lower priority numbers execute first.</HelpText>
              </FormGroup>
              <FormGroup>
                <Label>Action *</Label>
                <Select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value as TerminationRuleFormData['action'] })}
                >
                  <option value="terminate">Terminate</option>
                  <option value="redirect">Redirect</option>
                  <option value="transform">Transform</option>
                </Select>
              </FormGroup>
            </Row>

            <FormGroup>
              <Label>Conditions *</Label>
              <ConditionsList>
                {formData.conditions.map((condition, index) => (
                  <ConditionRow key={index}>
                    <div>
                      <Label>Field</Label>
                      <Select
                        value={condition.field}
                        onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                      >
                        <option value="ip">IP</option>
                        <option value="user-agent">User Agent</option>
                        <option value="header">Header</option>
                        <option value="path">Path</option>
                        <option value="method">Method</option>
                        <option value="query-param">Query Param</option>
                        <option value="request-size">Request Size</option>
                        <option value="country">Country</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Operator</Label>
                      <Select
                        value={condition.operator}
                        onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                      >
                        <option value="equals">Equals</option>
                        <option value="not-equals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="not-contains">Not Contains</option>
                        <option value="in">In</option>
                        <option value="not-in">Not In</option>
                        <option value="matches">Matches</option>
                        <option value="greater-than">Greater Than</option>
                        <option value="less-than">Less Than</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Value *</Label>
                      <Input
                        value={condition.value}
                        onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                        placeholder="Value"
                      />
                    </div>
                    <div>
                      <Label>Header Name (for header field)</Label>
                      <Input
                        value={condition.headerName || ''}
                        onChange={(e) => handleConditionChange(index, 'headerName', e.target.value)}
                        placeholder="X-Forwarded-For"
                        disabled={condition.field !== 'header'}
                      />
                    </div>
                    <RemoveButton type="button" onClick={() => removeCondition(index)}>
                      <DeleteIcon />
                    </RemoveButton>
                  </ConditionRow>
                ))}
                <AddButton type="button" onClick={addCondition}>
                  <PlusIcon /> Add Condition
                </AddButton>
              </ConditionsList>
            </FormGroup>

            <Row>
              <FormGroup>
                <Label>Response Code</Label>
                <Input
                  type="number"
                  value={formData.responseCode}
                  onChange={(e) => setFormData({ ...formData, responseCode: Number(e.target.value) })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Redirect URL</Label>
                <Input
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                  placeholder="https://example.com/block"
                  disabled={formData.action !== 'redirect'}
                />
                <HelpText>Required when action is redirect.</HelpText>
              </FormGroup>
            </Row>

            <FormGroup>
              <Label>Response Body</Label>
              <TextArea
                value={formData.responseBody}
                onChange={(e) => setFormData({ ...formData, responseBody: e.target.value })}
                placeholder="JSON or text response body"
              />
            </FormGroup>

            <Row>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.logReason}
                  onChange={(e) => setFormData({ ...formData, logReason: e.target.checked })}
                />
                Log reason when triggered
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                Active
              </CheckboxLabel>
            </Row>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update Rule' : 'Create Rule'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TerminationRuleModal;
