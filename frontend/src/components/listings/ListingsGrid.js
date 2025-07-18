import React from 'react';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaUser, FaStar, FaPhone, FaEnvelope } from 'react-icons/fa';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
`;

const ListingCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-color: #3b82f6;
  }
`;

const ListingHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.color || '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 1rem;
`;

const ListingInfo = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
`;

const Type = styled.span`
  background: ${props => props.color || '#3b82f6'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const Description = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0.75rem 0;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 0.85rem;
  margin: 0.75rem 0;

  svg {
    margin-right: 0.5rem;
    color: #ef4444;
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  margin: 0.75rem 0;

  svg {
    color: #fbbf24;
    margin-right: 0.25rem;
  }

  span {
    color: #64748b;
    font-size: 0.85rem;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const ContactButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: white;

  &.primary {
    background: #3b82f6;
    &:hover {
      background: #2563eb;
    }
  }

  &.secondary {
    background: #10b981;
    &:hover {
      background: #059669;
    }
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;

  h3 {
    margin-bottom: 1rem;
    color: #1e293b;
  }

  p {
    margin-bottom: 2rem;
  }
`;

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";

const getTypeColor = (type) => {
  const colors = {
    'Freelancer': '#3b82f6',
    'Artist': '#8b5cf6',
    'Tutor': '#10b981',
    'Fitness Trainer': '#f59e0b',
    'Chef': '#ef4444',
    'Photographer': '#06b6d4',
    'Musician': '#ec4899',
    'Designer': '#84cc16',
    'Consultant': '#6366f1',
    'Craftsman': '#f97316',
    'Therapist': '#14b8a6',
    'Event Planner': '#a855f7'
  };
  return colors[type] || '#6b7280';
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ListingsGrid = ({ listings = [], onListingClick, onContactClick }) => {
  if (!listings.length) {
    return (
      <EmptyState>
        <h3>No listings found</h3>
        <p>There are currently no people listed in your area. Check back later!</p>
      </EmptyState>
    );
  }

  return (
    <GridContainer>
      {listings.map((listing) => (
        <ListingCard 
          key={listing._id} 
          onClick={() => onListingClick && onListingClick(listing)}
        >
          <ListingHeader>
            <img
              src={listing.images && listing.images.length > 0 ? listing.images[0] : DEFAULT_IMAGE}
              alt={listing.creator?.name || listing.title}
              style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '12px', marginRight: 16, border: '1.5px solid #e5e7eb', background: '#f3f4f6' }}
            />
            <ListingInfo>
              <Name>{listing.creator?.name || listing.title}</Name>
              <Type color={getTypeColor(listing.type)}>
                <img
                  src={`/simorgh_badges/${listing.type?.toLowerCase()}.svg`}
                  alt={`${listing.type} badge`}
                  style={{ width: 20, height: 20, marginRight: 6, borderRadius: '50%', background: '#fff', border: '1.5px solid #e5e7eb', boxSizing: 'border-box', display: 'inline-block', verticalAlign: 'middle' }}
                  onError={e => { e.target.onerror = null; e.target.src = '/simorgh_badges/regular.svg'; }}
                />
                {listing.type}
              </Type>
            </ListingInfo>
          </ListingHeader>

          <Description>{listing.description}</Description>

          {listing.location?.address && (
            <Location>
              <FaMapMarkerAlt />
              <span>{listing.location.address}</span>
            </Location>
          )}

          {listing.rating && (
            <Rating>
              <FaStar />
              <span>{listing.rating} ({listing.reviewCount || 0} reviews)</span>
            </Rating>
          )}

          <ContactInfo>
            <ContactButton 
              className="primary"
              onClick={(e) => {
                e.stopPropagation();
                onContactClick && onContactClick(listing, 'phone');
              }}
            >
              <FaPhone />
              Contact
            </ContactButton>
            <ContactButton 
              className="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onContactClick && onContactClick(listing, 'email');
              }}
            >
              <FaEnvelope />
              Message
            </ContactButton>
          </ContactInfo>
        </ListingCard>
      ))}
    </GridContainer>
  );
};

export default ListingsGrid; 