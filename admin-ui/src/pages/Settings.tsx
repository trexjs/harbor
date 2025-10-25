import React from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Placeholder = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Settings: React.FC = () => {
  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Settings</PageTitle>
      </PageHeader>
      <Placeholder>
        Settings will be available soon. Configure global portal options here.
      </Placeholder>
    </SettingsContainer>
  );
};

export default Settings;
