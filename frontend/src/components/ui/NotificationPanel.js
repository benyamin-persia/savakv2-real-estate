import React from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const NotificationPanel = ({ notifications }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <Panel>
      {notifications.map((notification) => (
        <div key={notification.id}>
          {/* Notification content will be implemented here */}
        </div>
      ))}
    </Panel>
  );
};

export default NotificationPanel; 