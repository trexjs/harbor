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
  max-width: 720px;
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

const PatternsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PatternRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-end;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

const AddPatternButton = styled.button`
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

interface PatternForm {
  type: 'user-agent' | 'request-pattern' | 'behavior';
  pattern: string;
  action: 'allow' | 'block' | 'challenge';
}

interface BotRuleFormData {
  routeId: string;
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  patterns: PatternForm[];
  whitelist: string;
  rateLimitThreshold: number;
  active: boolean;
}

interface BotRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    routeId: string;
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    patterns: PatternForm[];
    whitelist?: string[];
    rateLimitThreshold: number;
    active: boolean;
  }) => Promise<void>;
  initialData?: Partial<BotRuleFormData>;
  routes: RouteOption[];
}

const defaultPattern: PatternForm = {
  type: 'user-agent',
  pattern: '',
  action: 'block',
};

const defaultForm: BotRuleFormData = {
  routeId: '',
  enabled: true,
  sensitivity: 'medium',
  patterns: [defaultPattern],
  whitelist: '',
  rateLimitThreshold: 100,
  active: true,
};

const BotRuleModal: React.FC<BotRuleModalProps> = ({ isOpen, onClose, onSubmit, initialData, routes }) => {
  const [formData, setFormData] = useState<BotRuleFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          routeId: initialData.routeId || '',
          enabled: initialData.enabled ?? true,
          sensitivity: initialData.sensitivity || 'medium',
          patterns: initialData.patterns && initialData.patterns.length > 0 ? initialData.patterns.map(pattern => ({
            type: pattern.type,
            pattern: pattern.pattern,
            action: pattern.action,
          })) : [defaultPattern],
          whitelist: initialData.whitelist || '',
          rateLimitThreshold: initialData.rateLimitThreshold ?? 100,
          active: initialData.active ?? true,
        });
      } else {
        setFormData(defaultForm);
        setError('');
      }
    }
  }, [isOpen, initialData]);

  const handlePatternChange = (index: number, key: keyof PatternForm, value: string) => {
    const updated = [...formData.patterns];
    updated[index] = { ...updated[index], [key]: value } as PatternForm;
    setFormData({ ...formData, patterns: updated });
  };

  const addPattern = () => {
    setFormData({ ...formData, patterns: [...formData.patterns, defaultPattern] });
  };

  const removePattern = (index: number) => {
    if (formData.patterns.length === 1) return;
    setFormData({ ...formData, patterns: formData.patterns.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.routeId) {
      setError('Please select a route');
      return;
    }

    if (formData.patterns.some(pattern => !pattern.pattern.trim())) {
      setError('Each pattern must include a pattern value');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      routeId: formData.routeId,
      enabled: formData.enabled,
      sensitivity: formData.sensitivity,
      patterns: formData.patterns.map(pattern => ({
        type: pattern.type,
        pattern: pattern.pattern.trim(),
        action: pattern.action,
      })),
      whitelist: formData.whitelist
        ? formData.whitelist
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
        : undefined,
      rateLimitThreshold: formData.rateLimitThreshold,
      active: formData.active,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save bot rule');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{initialData ? 'Edit Bot Rule' : 'Create Bot Rule'}</ModalTitle>
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
                onChange={e => setFormData({ ...formData, routeId: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select route
                </option>
                {routes.map(route => (
                  <option key={route._id} value={route._id}>
                    {route.name} ({route.path})
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                />
                Enabled
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <Label>Sensitivity *</Label>
              <Select
                value={formData.sensitivity}
                onChange={e => setFormData({ ...formData, sensitivity: e.target.value as BotRuleFormData['sensitivity'] })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Detection Patterns *</Label>
              <PatternsContainer>
                {formData.patterns.map((pattern, index) => (
                  <PatternRow key={index}>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={pattern.type}
                        onChange={e => handlePatternChange(index, 'type', e.target.value)}
                      >
                        <option value="user-agent">User Agent</option>
                        <option value="request-pattern">Request Pattern</option>
                        <option value="behavior">Behavior</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Pattern *</Label>
                      <Input
                        value={pattern.pattern}
                        onChange={e => handlePatternChange(index, 'pattern', e.target.value)}
                        placeholder="e.g. bot|crawler"
                      />
                    </div>
                    <div>
                      <Label>Action</Label>
                      <Select
                        value={pattern.action}
                        onChange={e => handlePatternChange(index, 'action', e.target.value)}
                      >
                        <option value="block">Block</option>
                        <option value="challenge">Challenge</option>
                        <option value="allow">Allow</option>
                      </Select>
                    </div>
                    <RemoveButton type="button" onClick={() => removePattern(index)}>
                      <DeleteIcon />
                    </RemoveButton>
                  </PatternRow>
                ))}
                <AddPatternButton type="button" onClick={addPattern}>
                  <PlusIcon /> Add Pattern
                </AddPatternButton>
              </PatternsContainer>
            </FormGroup>

            <FormGroup>
              <Label>Whitelist (comma separated names)</Label>
              <TextArea
                value={formData.whitelist}
                onChange={e => setFormData({ ...formData, whitelist: e.target.value })}
                placeholder="Googlebot, Bingbot"
              />
              <HelpText>Requests matching these known bot names will be allowed.</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Rate Limit Threshold</Label>
              <Input
                type="number"
                min={1}
                value={formData.rateLimitThreshold}
                onChange={e => setFormData({ ...formData, rateLimitThreshold: Number(e.target.value) })}
              />
              <HelpText>Maximum requests per minute before flagging as a bot.</HelpText>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                />
                Active
              </CheckboxLabel>
            </FormGroup>
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

export default BotRuleModal;
