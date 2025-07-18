import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import CombinedHeaderNav from './CombinedHeaderNav';
import NotificationPanel from '../ui/NotificationPanel';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
`;

const Main = styled.main`
  flex: 1;
  padding-top: 80px; // Account for fixed header
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Layout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { notifications } = useSocket();

  return (
    <LayoutContainer>
      <CombinedHeaderNav />
      <Main>
        <Content>
          {children}
        </Content>
      </Main>
      {isAuthenticated && notifications.length > 0 && (
        <NotificationPanel notifications={notifications} />
      )}
    </LayoutContainer>
  );
};

export default Layout; 