import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CloseIcon } from './icons';

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
  max-width: 600px;
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
  min-height: 100px;
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
  
  input[type="checkbox"] {
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

const HelpText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

interface RouteOption {
  _id: string;
  name: string;
  path: string;
}

interface GeoRuleFormData {
  routeId: string;
  action: 'block' | 'allow' | 'rate-limit';
  countries: string[];
  type: 'blacklist' | 'whitelist';
  active: boolean;
}

interface GeoRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GeoRuleFormData) => Promise<void>;
  initialData?: Partial<GeoRuleFormData>;
  mode: 'create' | 'edit';
  routes: RouteOption[];
}

const GeoRuleModal: React.FC<GeoRuleModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode, routes }) => {
  const [formData, setFormData] = useState<GeoRuleFormData>({
    routeId: '',
    action: 'block',
    countries: [],
    type: 'blacklist',
    active: true,
  });
  
  const [countriesInput, setCountriesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          routeId: initialData.routeId || '',
          action: initialData.action || 'block',
          countries: initialData.countries || [],
          type: initialData.type || 'blacklist',
          active: initialData.active !== undefined ? initialData.active : true,
        });
        setCountriesInput(initialData.countries?.join(', ') || '');
      } else {
        setFormData({
          routeId: '',
          action: 'block',
          countries: [],
          type: 'blacklist',
          active: true,
        });
        setCountriesInput('');
        setError('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.routeId) {
      setError('Please select a route');
      setLoading(false);
      return;
    }

    const countries = countriesInput
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length > 0);

    if (countries.length === 0) {
      setError('Please add at least one country code');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({ ...formData, countries });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save geo rule');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{mode === 'create' ? 'Create Geo Rule' : 'Edit Geo Rule'}</ModalTitle>
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

            <FormGroup>
              <Label>Action *</Label>
              <Select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
              >
                <option value="block">Block</option>
                <option value="allow">Allow</option>
                <option value="rate-limit">Rate Limit</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Rule Type *</Label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'blacklist' | 'whitelist' })}
              >
                <option value="blacklist">Blacklist</option>
                <option value="whitelist">Whitelist</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Country Codes *</Label>
              <TextArea
                value={countriesInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCountriesInput(e.target.value)}
                placeholder="US, GB, CN, RU"
              />
              <HelpText>Enter ISO 3166-1 alpha-2 country codes (comma-separated)</HelpText>
            </FormGroup>

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
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Rule' : 'Update Rule'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default GeoRuleModal;
