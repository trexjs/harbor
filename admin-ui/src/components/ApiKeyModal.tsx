import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CloseIcon } from './icons';

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

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
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

interface ConsumerOption {
  _id: string;
  name: string;
  email?: string;
}

interface ApiKeyFormData {
  consumerId: string;
  name: string;
  rateLimitRequests: number;
  rateLimitWindow: string;
  expiresAt: string;
}

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    consumerId: string;
    name?: string;
    rateLimit?: {
      requests: number;
      window: string;
    };
    expiresAt?: string | null;
  }) => Promise<string | void>;
  consumers: ConsumerOption[];
}

const defaultForm: ApiKeyFormData = {
  consumerId: '',
  name: '',
  rateLimitRequests: 100,
  rateLimitWindow: '15m',
  expiresAt: '',
};

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSubmit, consumers }) => {
  const [formData, setFormData] = useState<ApiKeyFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFormData(defaultForm);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.consumerId) {
      setError('Please select a consumer');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      consumerId: formData.consumerId,
      name: formData.name.trim() || undefined,
      rateLimit: {
        requests: formData.rateLimitRequests,
        window: formData.rateLimitWindow,
      },
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    };

    try {
      const generatedKey = await onSubmit(payload);
      if (generatedKey) {
        window.alert(`API Key generated successfully!\n\nSave this key now, it will only be shown once:\n\n${generatedKey}`);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Generate API Key</ModalTitle>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FormGroup>
              <Label>Consumer *</Label>
              <Select
                value={formData.consumerId}
                onChange={(e) => setFormData({ ...formData, consumerId: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select consumer
                </option>
                {consumers.map((consumer) => (
                  <option key={consumer._id} value={consumer._id}>
                    {consumer.name} {consumer.email ? `(${consumer.email})` : ''}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Key Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Production key"
              />
              <HelpText>Optional label to identify this key later</HelpText>
            </FormGroup>

            <Row>
              <FormGroup>
                <Label>Rate Limit (requests)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.rateLimitRequests}
                  onChange={(e) => setFormData({ ...formData, rateLimitRequests: Number(e.target.value) })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Rate Limit Window</Label>
                <Input
                  value={formData.rateLimitWindow}
                  onChange={(e) => setFormData({ ...formData, rateLimitWindow: e.target.value })}
                  placeholder="15m"
                />
                <HelpText>Examples: 15m, 1h, 1d</HelpText>
              </FormGroup>
            </Row>

            <FormGroup>
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
              <HelpText>Leave empty to create a key without expiration</HelpText>
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Key'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ApiKeyModal;
