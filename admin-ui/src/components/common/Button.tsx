import styled from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = styled.button<ButtonProps>`
  padding: ${({ size }) => {
    switch (size) {
      case 'sm':
        return '0.5rem 1rem';
      case 'lg':
        return '0.875rem 1.75rem';
      default:
        return '0.625rem 1.25rem';
    }
  }};
  
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return theme.colors.secondary;
      case 'danger':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  }};
  
  color: white;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
