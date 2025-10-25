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
  
  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const IpList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IpItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
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

const AddButton = styled.button`
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

interface IpRuleFormData {
  type: 'blacklist' | 'whitelist';
  ips: string[];
  reason: string;
  active: boolean;
}

interface IpRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IpRuleFormData) => Promise<void>;
  initialData?: Partial<IpRuleFormData>;
  mode: 'create' | 'edit';
}

const IpRuleModal: React.FC<IpRuleModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState<IpRuleFormData>({
    type: 'blacklist',
    ips: [''],
    reason: '',
    active: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'blacklist',
        ips: initialData.ips || [''],
        reason: initialData.reason || '',
        active: initialData.active !== undefined ? initialData.active : true,
      });
    }
  }, [initialData]);

  const handleIpChange = (index: number, value: string) => {
    const newIps = [...formData.ips];
    newIps[index] = value;
    setFormData({ ...formData, ips: newIps });
  };

  const addIp = () => {
    setFormData({ ...formData, ips: [...formData.ips, ''] });
  };

  const removeIp = (index: number) => {
    if (formData.ips.length > 1) {
      setFormData({ ...formData, ips: formData.ips.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Filter out empty IPs
    const filteredIps = formData.ips.filter(ip => ip.trim() !== '');
    
    if (filteredIps.length === 0) {
      setError('Please add at least one IP address');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({ ...formData, ips: filteredIps });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save IP rule');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{mode === 'create' ? 'Create IP Rule' : 'Edit IP Rule'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FormGroup>
              <Label>Rule Type *</Label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'blacklist' | 'whitelist' })}
              >
                <option value="blacklist">Blacklist (Block)</option>
                <option value="whitelist">Whitelist (Allow)</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>IP Addresses *</Label>
              <IpList>
                {formData.ips.map((ip, index) => (
                  <IpItem key={index}>
                    <Input
                      type="text"
                      value={ip}
                      onChange={(e) => handleIpChange(index, e.target.value)}
                      placeholder="192.168.1.1 or 10.0.0.0/24"
                    />
                    {formData.ips.length > 1 && (
                      <RemoveButton type="button" onClick={() => removeIp(index)}>
                        <DeleteIcon />
                      </RemoveButton>
                    )}
                  </IpItem>
                ))}
              </IpList>
              <div style={{ marginTop: '8px' }}>
                <AddButton type="button" onClick={addIp}>
                  <PlusIcon />
                  Add IP
                </AddButton>
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Reason</Label>
              <TextArea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Suspicious activity, spam, etc."
              />
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

export default IpRuleModal;
