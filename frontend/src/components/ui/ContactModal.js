import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaSignInAlt, FaUserPlus, FaPhone, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
`;

const Description = styled.p`
  color: #64748b;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ContactInfo = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: #64748b;

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    color: #3b82f6;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;

  &.primary {
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  }

  &.secondary {
    background: transparent;
    color: #3b82f6;
    border: 2px solid #3b82f6;
    
    &:hover {
      background: #3b82f6;
      color: white;
    }
  }
`;

const ContactModal = ({ isOpen, onClose, listing, contactMethod }) => {
  if (!isOpen) return null;

  const getContactMethodText = () => {
    switch (contactMethod) {
      case 'phone':
        return 'call this person';
      case 'email':
        return 'send a message to this person';
      default:
        return 'contact this person';
    }
  };

  const getContactMethodIcon = () => {
    switch (contactMethod) {
      case 'phone':
        return <FaPhone />;
      case 'email':
        return <FaEnvelope />;
      default:
        return <FaEnvelope />;
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>

        <Title>Login Required</Title>
        
        <Description>
          To {getContactMethodText()}, you need to create an account or sign in first.
        </Description>

        <ContactInfo>
          <ContactItem>
            {getContactMethodIcon()}
            <span>
              <strong>{listing?.creator?.name || listing?.title}</strong> - {listing?.type}
            </span>
          </ContactItem>
          <ContactItem>
            <FaEnvelope />
            <span>Location: {listing?.location?.address || 'Location not specified'}</span>
          </ContactItem>
        </ContactInfo>

        <ActionButtons>
          <Button to="/login" className="secondary">
            <FaSignInAlt />
            Sign In
          </Button>
          <Button to="/signup" className="primary">
            <FaUserPlus />
            Create Account
          </Button>
        </ActionButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ContactModal; 