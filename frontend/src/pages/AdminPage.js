import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiUsers, FiBarChart, FiSettings, FiShield, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e293b;
  margin: 0;
`;

const AdminIcon = styled(FiShield)`
  font-size: 2rem;
  color: #3b82f6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? '#3b82f6' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#2563eb' : '#f1f5f9'};
  }
`;

const UsersTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

// Update TableHeader and TableRow for new columns and responsive truncation
const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 2fr 1fr 1.2fr;
  gap: 1rem;
  padding: 1.1rem 1.5rem 1.1rem 1.5rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  color: #374151;
  text-align: left;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 2fr 1fr 1.2fr;
  gap: 1rem;
  padding: 1.1rem 1.5rem 1.1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  background: #fff;
  transition: background 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
`;

const Truncate = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  cursor: pointer;
`;

const UserType = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  &.admin {
    background: #fef3c7;
    color: #92400e;
  }
  
  &.advanced {
    background: #dbeafe;
    color: #1e40af;
  }
  
  &.regular {
    background: #dcfce7;
    color: #166534;
  }
  
  &.shadow {
    background: #f3e8ff;
    color: #7c3aed;
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.edit {
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  }
  
  &.delete {
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  }
  
  &.verify {
    background: #10b981;
    color: white;
    
    &:hover {
      background: #059669;
    }
  }

  &.authorization {
    background: #8b5cf6;
    color: white;
    
    &:hover {
      background: #7c3aed;
    }
  }
`;

const AuthorizationModal = styled.div`
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
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const AuthLevelCard = styled.div`
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e2e8f0'};
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? '#eff6ff' : 'white'};
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const AuthLevelTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1.1rem;
`;

const AuthLevelDescription = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.4;
`;

const AuthLevelPermissions = styled.div`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &.primary {
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  }
  
  &.secondary {
    background: #6b7280;
    color: white;
    
    &:hover {
      background: #4b5563;
    }
  }
`;

const SearchBar = styled.input`
  width: 220px;
  min-width: 0;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.08);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background: #f8fafc;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0 0 0;
`;
const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
const NavLink = styled.a`
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover { color: #3b82f6; background: #f1f5f9; }
`;
const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
`;
const ProfileDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  min-width: 200px;
  z-index: 1001;
  overflow: hidden;
  margin-top: 8px;
`;
const ProfileName = styled.span`
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
  margin-left: 12px;
`;
const ProfileButton = styled.button`
  width: 100%;
  background: none;
  border: none;
  color: #ef4444;
  font-weight: 600;
  padding: 12px 0;
  cursor: pointer;
  text-align: left;
  &:hover { background: #fef2f2; }
`;

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [currentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAuthLevel, setSelectedAuthLevel] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Edit User Modal state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editType, setEditType] = useState('regular');

  useEffect(() => {
    if (editUser) {
      setEditName(editUser.name || '');
      setEditEmail(editUser.email || '');
      setEditUsername(editUser.username || '');
      setEditType(editUser.userType || 'regular');
    }
  }, [editUser]);

  const authorizationLevels = {
    regular: {
      title: 'Regular User',
      description: 'Standard user with basic permissions',
      permissions: ['Create listings (5 per day)', 'View listings', 'Basic profile management'],
      maxPosts: 5
    },
    advanced: {
      title: 'Advanced User',
      description: 'Enhanced user with extended permissions',
      permissions: ['Create unlimited listings', 'Priority support', 'Advanced features'],
      maxPosts: 999999
    },
    admin: {
      title: 'Administrator',
      description: 'Full system access and management capabilities',
      permissions: ['All user permissions', 'User management', 'System administration', 'Analytics access'],
      maxPosts: 999999
    },
    shadow: {
      title: 'Shadow User',
      description: 'Restricted user with limited access',
      permissions: ['View listings only', 'No creation permissions'],
      maxPosts: 0
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, searchTerm, userTypeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('[AdminPage] Fetching data for tab:', activeTab);
      
      if (activeTab === 'users') {
        const params = {
          page: currentPage,
          limit: 20,
          search: searchTerm,
          userType: userTypeFilter
        };
        
        console.log('[AdminPage] Fetching users with params:', params);
        const response = await axios.get('/api/admin/users', { params });
        console.log('[AdminPage] Users response:', response.data);
        setUsers(response.data.data);
      } else if (activeTab === 'stats') {
        console.log('[AdminPage] Fetching stats');
        const response = await axios.get('/api/admin/stats');
        console.log('[AdminPage] Stats response:', response.data);
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeChange = async (userId, newType) => {
    try {
      await axios.put(`/api/admin/users/${userId}/type`, { userType: newType });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating user type:', error);
    }
  };

  const handleVerifyToggle = async (userId, isVerified) => {
    try {
      await axios.put(`/api/admin/users/${userId}/verify`, { isVerified: !isVerified });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleAuthorizationChange = (user) => {
    setSelectedUser(user);
    setSelectedAuthLevel(user.userType);
    setShowAuthModal(true);
  };

  const confirmAuthorizationChange = async () => {
    if (!selectedUser || !selectedAuthLevel) return;
    
    try {
      console.log('[AdminPage] Updating user authorization:', {
        userId: selectedUser._id,
        currentType: selectedUser.userType,
        newType: selectedAuthLevel
      });
      
      const response = await axios.put(`/api/admin/users/${selectedUser._id}/type`, { 
        userType: selectedAuthLevel 
      });
      
      console.log('[AdminPage] Authorization update response:', response.data);
      
      setShowAuthModal(false);
      setSelectedUser(null);
      setSelectedAuthLevel('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('[AdminPage] Error updating user authorization:', error);
      console.error('[AdminPage] Error response:', error.response?.data);
      alert('Failed to update user authorization level. Please try again.');
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setSelectedUser(null);
    setSelectedAuthLevel('');
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
  };

  const createTestUser = async () => {
    try {
      const response = await axios.post('/api/admin/users/test');
      console.log('[AdminPage] Test user created:', response.data);
      fetchData(); // Refresh data
      alert('Test user created successfully!');
    } catch (error) {
      console.error('[AdminPage] Error creating test user:', error);
      alert('Failed to create test user.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !userTypeFilter || user.userType === userTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  if (loading) {
    return (
      <Container>
        <div>Loading admin data...</div>
      </Container>
    );
  }

  return (
    <>
      <TopBar>
        <Nav>
          <NavLink href="/">Home</NavLink>
        </Nav>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <UserAvatar onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            {user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U'}
          </UserAvatar>
          <ProfileName onClick={() => setShowProfileDropdown(!showProfileDropdown)}>{user?.name || 'User'}</ProfileName>
          {showProfileDropdown && (
            <ProfileDropdown>
              <ProfileButton onClick={logout}>Logout</ProfileButton>
            </ProfileDropdown>
          )}
        </div>
      </TopBar>
    <Container>
      <Header>
        <AdminIcon />
        <Title>Admin Portal</Title>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatTitle>Total Users</StatTitle>
          <StatValue>{stats.totalUsers || 0}</StatValue>
          <StatChange $positive>+12% from last month</StatChange>
        </StatCard>
        <StatCard>
          <StatTitle>Verified Users</StatTitle>
          <StatValue>{stats.totalVerified || 0}</StatValue>
          <StatChange $positive>+8% from last month</StatChange>
        </StatCard>
        <StatCard>
          <StatTitle>Active Users</StatTitle>
          <StatValue>{stats.totalActive || 0}</StatValue>
          <StatChange $positive>+15% from last month</StatChange>
        </StatCard>
        <StatCard>
          <StatTitle>Admin Users</StatTitle>
          <StatValue>{stats.stats?.find(s => s._id === 'admin')?.count || 0}</StatValue>
          <StatChange $positive>+2 this month</StatChange>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <Tab 
          $active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          <FiUsers style={{ marginRight: '0.5rem' }} />
          User Management
        </Tab>
        <Tab 
          $active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')}
        >
          <FiBarChart style={{ marginRight: '0.5rem' }} />
          Statistics
        </Tab>
        <Tab 
          $active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings style={{ marginRight: '0.5rem' }} />
          System Settings
        </Tab>
      </TabsContainer>

      {activeTab === 'users' && (
        <div>
          <ControlsContainer>
            <SearchBar
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterSelect
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="advanced">Advanced</option>
              <option value="admin">Admin</option>
              <option value="shadow">Shadow</option>
            </FilterSelect>
            <Button 
              className="primary" 
              onClick={createTestUser}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Create Test User
            </Button>
          </ControlsContainer>

          <UsersTable>
            <TableHeader>
              <div>Username</div>
              <div>Email</div>
              <div>Type</div>
              <div>Actions</div>
            </TableHeader>
            {filteredUsers.map(user => (
              <TableRow key={user._id}>
                <Truncate title={user.username}>{user.username}</Truncate>
                <Truncate title={user.email}>{user.email}</Truncate>
                <div>
                  <UserType className={user.userType}>
                    <img
                      src={`${process.env.PUBLIC_URL}/simorgh_badges/${user.userType}.svg`}
                      alt={`${user.userType} badge`}
                      style={{ width: 24, height: 24, marginRight: 6, verticalAlign: 'middle', borderRadius: '50%', background: '#fff', border: '2px solid #e5e7eb', boxSizing: 'border-box', display: 'inline-block' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {user.userType}
                  </UserType>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <ActionButton
                    className="edit"
                    onClick={() => handleEditUser(user)}
                    title="Edit User"
                  >
                    <FiSettings />
                  </ActionButton>
                  <ActionButton
                    className="authorization"
                    onClick={() => handleAuthorizationChange(user)}
                    title="Manage Authorization Level"
                  >
                    <FiShield />
                  </ActionButton>
                  <ActionButton
                    className="verify"
                    onClick={() => handleVerifyToggle(user._id, user.isVerified)}
                    title={user.isVerified ? 'Unverify' : 'Verify'}
                  >
                    {user.isVerified ? <FiUserX /> : <FiUserCheck />}
                  </ActionButton>
                  <ActionButton
                    className="delete"
                    onClick={() => handleDeleteUser(user._id)}
                    title="Delete User"
                  >
                    <FiTrash2 />
                  </ActionButton>
                </div>
              </TableRow>
            ))}
          </UsersTable>
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <h2>Detailed Statistics</h2>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <h2>System Settings</h2>
          <p>System settings will be implemented here.</p>
        </div>
      )}

      {/* Authorization Level Modal */}
      {showAuthModal && (
        <AuthorizationModal onClick={closeAuthModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Manage Authorization Level</h2>
            <p style={{ marginBottom: '1rem', color: '#64748b' }}>
              Change authorization level for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
            </p>
            
            <div>
              {Object.entries(authorizationLevels).map(([level, details]) => (
                <AuthLevelCard
                  key={level}
                  selected={selectedAuthLevel === level}
                  onClick={() => setSelectedAuthLevel(level)}
                >
                  <AuthLevelTitle>{details.title}</AuthLevelTitle>
                  <AuthLevelDescription>{details.description}</AuthLevelDescription>
                  <AuthLevelPermissions>
                    <strong>Permissions:</strong>
                    <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1rem' }}>
                      {details.permissions.map((permission, index) => (
                        <li key={index}>{permission}</li>
                      ))}
                    </ul>
                  </AuthLevelPermissions>
                </AuthLevelCard>
              ))}
            </div>

            <ButtonGroup>
              <Button className="primary" onClick={confirmAuthorizationChange}>
                Update Authorization Level
              </Button>
              <Button className="secondary" onClick={closeAuthModal}>
                Cancel
              </Button>
            </ButtonGroup>
          </ModalContent>
        </AuthorizationModal>
      )}

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <AuthorizationModal onClick={closeEditModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Edit User</h2>
            <form>
              <div style={{ marginBottom: '1rem' }}>
                <label>Name:</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Email:</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Username:</label>
                <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>User Type:</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                  <option value="regular">Regular</option>
                  <option value="advanced">Advanced</option>
                  <option value="admin">Admin</option>
                  <option value="shadow">Shadow</option>
                </select>
              </div>
              <ButtonGroup>
                <Button className="primary" type="button" onClick={closeEditModal}>Cancel</Button>
                <Button className="primary" type="button" onClick={async () => {
                  try {
                    const response = await axios.put(`/api/admin/users/${editUser._id}`, {
                      name: editName,
                      email: editEmail,
                      username: editUsername,
                      userType: editType
                    });
                    console.log('User updated:', response.data);
                    closeEditModal();
                    fetchData();
                  } catch (error) {
                    console.error('Error updating user:', error);
                    alert('Failed to update user.');
                  }
                }}>Save Changes</Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </AuthorizationModal>
      )}
    </Container>
    </>
  );
};

export default AdminPage; 