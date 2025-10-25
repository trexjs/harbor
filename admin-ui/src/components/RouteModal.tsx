import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CloseIcon, PlusIcon, DeleteIcon } from './icons';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
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
  display: flex;
  align-items: center;
  justify-content: center;
  
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
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
  
  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const TargetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TargetItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: end;
`;

const AddTargetButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
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
  background: #EF444420;
  color: #EF4444;
  border: 1px solid #EF4444;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #EF444440;
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
  
  ${({ variant, theme }) => variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    border: none;
    
    &:hover {
      background: ${theme.colors.primary}dd;
    }
  ` : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.borderLight};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: #DC2626;
  font-size: ${({ theme }) => theme.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

interface Target {
  url: string;
  weight: number;
}

interface RouteFormData {
  name: string;
  path: string;
  method: string[];
  targets: Target[];
  active: boolean;
  stripPath: boolean;
  preserveHost: boolean;
  requireAuth: boolean;
  timeout: number;
  loadBalancer: {
    algorithm: string;
  };
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RouteFormData) => Promise<void>;
  initialData?: Partial<RouteFormData>;
  mode: 'create' | 'edit';
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
const ALGORITHMS = ['round-robin', 'least-connections', 'ip-hash', 'weighted-round-robin'];

const getDefaultFormData = (): RouteFormData => ({
    name: '',
    path: '',
    method: ['GET'],
    targets: [{ url: '', weight: 50 }],
    active: true,
    stripPath: false,
    preserveHost: false,
    requireAuth: false,
    timeout: 30000,
    loadBalancer: {
      algorithm: 'round-robin',
    },
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 900000,
    },
  });

const RouteModal: React.FC<RouteModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState<RouteFormData>(getDefaultFormData());
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...getDefaultFormData(),
        ...initialData,
      } as RouteFormData);
    }
  }, [initialData]);

  const handleMethodChange = (method: string) => {
    setFormData(prev => ({
      ...prev,
      method: prev.method.includes(method)
        ? prev.method.filter(m => m !== method)
        : [...prev.method, method],
    }));
  };

  const handleTargetChange = (index: number, field: 'url' | 'weight', value: string | number) => {
    const newTargets = [...formData.targets];
    newTargets[index] = { ...newTargets[index], [field]: value };
    setFormData({ ...formData, targets: newTargets });
  };

  const addTarget = () => {
    setFormData({
      ...formData,
      targets: [...formData.targets, { url: '', weight: 50 }],
    });
  };

  const removeTarget = (index: number) => {
    if (formData.targets.length > 1) {
      setFormData({
        ...formData,
        targets: formData.targets.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save route');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{mode === 'create' ? 'Create New Route' : 'Edit Route'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FormGroup>
              <Label>Route Name *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-api-route"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Path *</Label>
              <Input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                placeholder="/api/v1/users"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>HTTP Methods *</Label>
              <CheckboxGroup>
                {METHODS.map(method => (
                  <CheckboxLabel key={method}>
                    <input
                      type="checkbox"
                      checked={formData.method.includes(method)}
                      onChange={() => handleMethodChange(method)}
                    />
                    {method}
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </FormGroup>

            <FormGroup>
              <Label>Backend Targets *</Label>
              <TargetsList>
                {formData.targets.map((target, index) => (
                  <TargetItem key={index}>
                    <div>
                      <Input
                        type="url"
                        value={target.url}
                        onChange={(e) => handleTargetChange(index, 'url', e.target.value)}
                        placeholder="http://backend-service:8080"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={target.weight}
                        onChange={(e) => handleTargetChange(index, 'weight', parseInt(e.target.value))}
                        placeholder="Weight"
                        min="1"
                        max="100"
                      />
                    </div>
                    {formData.targets.length > 1 && (
                      <RemoveButton type="button" onClick={() => removeTarget(index)}>
                        <DeleteIcon />
                      </RemoveButton>
                    )}
                  </TargetItem>
                ))}
              </TargetsList>
              <AddTargetButton type="button" onClick={addTarget}>
                <PlusIcon />
                Add Target
              </AddTargetButton>
            </FormGroup>

            <FormGroup>
              <Label>Load Balancer Algorithm</Label>
              <Select
                value={formData.loadBalancer.algorithm}
                onChange={(e) => setFormData({
                  ...formData,
                  loadBalancer: { ...formData.loadBalancer, algorithm: e.target.value },
                })}
              >
                {ALGORITHMS.map(algo => (
                  <option key={algo} value={algo}>{algo}</option>
                ))}
              </Select>
            </FormGroup>

            <Row>
              <FormGroup>
                <Label>Timeout (ms)</Label>
                <Input
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                  min="1000"
                />
              </FormGroup>

              <FormGroup>
                <Label>Rate Limit (requests)</Label>
                <Input
                  type="number"
                  value={formData.rateLimit.maxRequests}
                  onChange={(e) => setFormData({
                    ...formData,
                    rateLimit: { ...formData.rateLimit, maxRequests: parseInt(e.target.value) },
                  })}
                  min="1"
                />
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
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.stripPath}
                  onChange={(e) => setFormData({ ...formData, stripPath: e.target.checked })}
                />
                Strip Path
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.preserveHost}
                  onChange={(e) => setFormData({ ...formData, preserveHost: e.target.checked })}
                />
                Preserve Host Header
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.requireAuth}
                  onChange={(e) => setFormData({ ...formData, requireAuth: e.target.checked })}
                />
                Require Authentication
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.rateLimit.enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    rateLimit: { ...formData.rateLimit, enabled: e.target.checked },
                  })}
                />
                Enable Rate Limiting
              </CheckboxLabel>
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Route' : 'Update Route'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RouteModal;
