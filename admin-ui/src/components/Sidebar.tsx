import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  DashboardIcon, 
  RoutesIcon, 
  UsersIcon, 
  KeyIcon, 
  ShieldIcon, 
  GlobeIcon, 
  BotIcon, 
  TransformIcon, 
  StopIcon, 
  LogsIcon,
  ProjectsIcon,
  SettingsIcon,
} from './icons';
import { useApp } from '../context/AppContext';

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 1000;
`;

const Logo = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const LogoText = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const Nav = styled.nav`
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.normal};
  border-left: 3px solid transparent;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.text};
  }

  &.active {
    background: ${({ theme }) => theme.colors.primary}10;
    color: ${({ theme }) => theme.colors.primary};
    border-left-color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    margin-right: ${({ theme }) => theme.spacing.md};
    width: 20px;
    height: 20px;
  }
`;

const Sidebar: React.FC = () => {
  const { hasProjects } = useApp();
  return (
    <SidebarContainer>
      <Logo>
        <LogoText>API Gateway</LogoText>
      </Logo>
      
      <Nav>
        {hasProjects ? (
          <>
            <NavSection>
              <SectionTitle>Overview</SectionTitle>
              <NavItem to="/">
                <DashboardIcon />
                Dashboard
              </NavItem>
            </NavSection>

            <NavSection>
              <SectionTitle>Management</SectionTitle>
              <NavItem to="/projects">
                <ProjectsIcon />
                Projects
              </NavItem>
              <NavItem to="/routes">
                <RoutesIcon />
                Routes
              </NavItem>
              <NavItem to="/consumers">
                <UsersIcon />
                Consumers
              </NavItem>
              <NavItem to="/api-keys">
                <KeyIcon />
                API Keys
              </NavItem>
            </NavSection>

            <NavSection>
              <SectionTitle>Security</SectionTitle>
              <NavItem to="/ip-rules">
                <ShieldIcon />
                IP Rules
              </NavItem>
              <NavItem to="/geo-rules">
                <GlobeIcon />
                Geo Rules
              </NavItem>
              <NavItem to="/bot-rules">
                <BotIcon />
                Bot Rules
              </NavItem>
            </NavSection>

            <NavSection>
              <SectionTitle>Transformation</SectionTitle>
              <NavItem to="/transformations">
                <TransformIcon />
                Transformations
              </NavItem>
              <NavItem to="/termination-rules">
                <StopIcon />
                Termination Rules
              </NavItem>
            </NavSection>

            <NavSection>
              <SectionTitle>Monitoring</SectionTitle>
              <NavItem to="/logs">
                <LogsIcon />
                Logs
              </NavItem>
            </NavSection>

            <NavSection>
              <SectionTitle>Administration</SectionTitle>
              <NavItem to="/settings">
                <SettingsIcon />
                Settings
              </NavItem>
            </NavSection>
          </>
        ) : (
          <NavSection>
            <SectionTitle>Getting Started</SectionTitle>
            <NavItem to="/projects">
              <ProjectsIcon />
              Projects
            </NavItem>
            <NavItem to="/settings">
              <SettingsIcon />
              Settings
            </NavItem>
          </NavSection>
        )}
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;
