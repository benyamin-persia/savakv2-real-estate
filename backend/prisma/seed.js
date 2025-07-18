const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        username: 'johnsmith',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Smith',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Experienced full-stack developer passionate about creating amazing web applications.',
        location: 'New York, NY',
        phone: '+1-555-0123',
        website: 'https://johnsmith.dev',
        social: {
          twitter: '@johnsmith',
          linkedin: 'johnsmith',
          instagram: 'johnsmith'
        },
        isVerified: true,
        googleId: 'google-john',
        microsoftId: 'ms-john'
      }
    }),
    prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        email: 'sarah@example.com',
        username: 'sarahjohnson',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'Creative digital artist specializing in character design and branding.',
        location: 'Brooklyn, NY',
        phone: '+1-555-0124',
        website: 'https://sarahjohnson.art',
        social: {
          twitter: '@sarahjohnson',
          linkedin: 'sarahjohnson',
          instagram: 'sarahjohnson'
        },
        isVerified: true,
        googleId: 'google-sarah',
        microsoftId: 'ms-sarah'
      }
    }),
    prisma.user.upsert({
      where: { email: 'michael@example.com' },
      update: {},
      create: {
        email: 'michael@example.com',
        username: 'michaelchen',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Michael',
        lastName: 'Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Certified teacher with 8+ years experience tutoring mathematics and sciences.',
        location: 'Queens, NY',
        phone: '+1-555-0125',
        website: 'https://michaelchen.tutor',
        social: {
          twitter: '@michaelchen',
          linkedin: 'michaelchen',
          instagram: 'michaelchen'
        },
        isVerified: true,
        googleId: 'google-michael',
        microsoftId: 'ms-michael'
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample listings
  const sampleListings = [
    {
      title: 'Professional Web Developer',
      description: 'Experienced full-stack developer specializing in React, Node.js, and modern web technologies. Available for freelance projects and consulting.',
      category: 'Developer',
      location: 'New York, NY',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'],
      price: 150,
      contact: { email: 'john@example.com', phone: '+1-555-0123', website: 'https://johnsmith.dev' },
      features: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
      userId: users[0].id
    },
    {
      title: 'Creative Digital Artist',
      description: 'Passionate digital artist creating stunning illustrations, logos, and digital artwork. Specializing in character design and branding.',
      category: 'Artist',
      location: 'Brooklyn, NY',
      coordinates: { lat: 40.730610, lng: -73.935242 },
      images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'],
      price: 200,
      contact: { email: 'sarah@example.com', phone: '+1-555-0124', website: 'https://sarahjohnson.art' },
      features: ['Digital Art', 'Character Design', 'Logo Design', 'Branding', 'Illustration'],
      userId: users[1].id
    },
    {
      title: 'Math & Science Tutor',
      description: 'Certified teacher with 8+ years experience tutoring high school and college students in mathematics, physics, and chemistry.',
      category: 'Tutor',
      location: 'Queens, NY',
      coordinates: { lat: 40.7282, lng: -73.7949 },
      images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'],
      price: 80,
      contact: { email: 'michael@example.com', phone: '+1-555-0125', website: 'https://michaelchen.tutor' },
      features: ['Mathematics', 'Physics', 'Chemistry', 'Test Prep', 'Online Tutoring'],
      userId: users[2].id
    },
    {
      title: 'Personal Fitness Trainer',
      description: 'Certified personal trainer helping clients achieve their fitness goals through personalized workout plans and nutrition guidance.',
      category: 'Fitness Trainer',
      location: 'Manhattan, NY',
      coordinates: { lat: 40.7505, lng: -73.935242 },
      images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
      price: 120,
      contact: { email: 'emma@example.com', phone: '+1-555-0126', website: 'https://emmafitness.com' },
      features: ['Personal Training', 'Nutrition', 'Weight Loss', 'Strength Training', 'Cardio'],
      userId: users[0].id
    },
    {
      title: 'Private Chef & Caterer',
      description: 'Professional chef offering private dining experiences, meal prep services, and catering for special events.',
      category: 'Chef',
      location: 'Bronx, NY',
      coordinates: { lat: 40.8448, lng: -73.7949 },
      images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'],
      price: 300,
      contact: { email: 'david@example.com', phone: '+1-555-0127', website: 'https://davidchef.com' },
      features: ['Private Dining', 'Catering', 'Meal Prep', 'Italian Cuisine', 'Event Planning'],
      userId: users[1].id
    },
    {
      title: 'Wedding & Portrait Photographer',
      description: 'Award-winning photographer capturing life\'s precious moments. Specializing in weddings, portraits, and events.',
      category: 'Photographer',
      location: 'Staten Island, NY',
      coordinates: { lat: 40.5795, lng: -74.1502 },
      images: ['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop'],
      price: 250,
      contact: { email: 'lisa@example.com', phone: '+1-555-0128', website: 'https://lisaphotography.com' },
      features: ['Wedding Photography', 'Portraits', 'Events', 'Engagement', 'Family Photos'],
      userId: users[2].id
    },
    {
      title: 'Jazz Musician & Music Teacher',
      description: 'Professional jazz musician and music teacher offering private lessons, performances, and music production services.',
      category: 'Musician',
      location: 'Manhattan, NY',
      coordinates: { lat: 40.7505, lng: -73.935242 },
      images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'],
      price: 180,
      contact: { email: 'alex@example.com', phone: '+1-555-0129', website: 'https://alexjazz.com' },
      features: ['Jazz Piano', 'Music Theory', 'Performance', 'Recording', 'Composition'],
      userId: users[0].id
    },
    {
      title: 'UI/UX Designer',
      description: 'Creative designer specializing in user interface and user experience design for web and mobile applications.',
      category: 'Designer',
      location: 'Brooklyn, NY',
      coordinates: { lat: 40.730610, lng: -73.935242 },
      images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'],
      price: 200,
      contact: { email: 'maria@example.com', phone: '+1-555-0130', website: 'https://mariadesign.com' },
      features: ['UI Design', 'UX Design', 'Mobile Apps', 'Web Design', 'Prototyping'],
      userId: users[1].id
    },
    {
      title: 'Business Strategy Consultant',
      description: 'Experienced business consultant helping startups and small businesses develop growth strategies and optimize operations.',
      category: 'Consultant',
      location: 'Queens, NY',
      coordinates: { lat: 40.7282, lng: -73.7949 },
      images: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'],
      price: 500,
      contact: { email: 'robert@example.com', phone: '+1-555-0131', website: 'https://robertconsulting.com' },
      features: ['Business Strategy', 'Startup Consulting', 'Operations', 'Growth', 'Analytics'],
      userId: users[2].id
    },
    {
      title: 'Custom Furniture Maker',
      description: 'Skilled craftsman creating custom furniture pieces using traditional woodworking techniques and modern design.',
      category: 'Craftsman',
      location: 'Bronx, NY',
      coordinates: { lat: 40.8448, lng: -73.7949 },
      images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
      price: 400,
      contact: { email: 'thomas@example.com', phone: '+1-555-0132', website: 'https://thomasfurniture.com' },
      features: ['Custom Furniture', 'Woodworking', 'Restoration', 'Design', 'Installation'],
      userId: users[0].id
    }
  ];

  const listings = await Promise.all(
    sampleListings.map(listing => 
      prisma.listing.create({
        data: listing
      })
    )
  );

  console.log(`✅ Created ${listings.length} listings`);

  // Create sample person types
  const personTypes = await Promise.all([
    prisma.personType.upsert({
      where: { name: 'Developer' },
      update: {},
      create: {
        name: 'Developer',
        description: 'Software developers and programmers',
        icon: '💻',
        color: '#3B82F6'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Artist' },
      update: {},
      create: {
        name: 'Artist',
        description: 'Creative artists and designers',
        icon: '🎨',
        color: '#EF4444'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Tutor' },
      update: {},
      create: {
        name: 'Tutor',
        description: 'Educational tutors and teachers',
        icon: '📚',
        color: '#10B981'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Fitness Trainer' },
      update: {},
      create: {
        name: 'Fitness Trainer',
        description: 'Personal trainers and fitness professionals',
        icon: '💪',
        color: '#F59E0B'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Chef' },
      update: {},
      create: {
        name: 'Chef',
        description: 'Professional chefs and culinary experts',
        icon: '👨‍🍳',
        color: '#8B5CF6'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Photographer' },
      update: {},
      create: {
        name: 'Photographer',
        description: 'Professional photographers',
        icon: '📸',
        color: '#06B6D4'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Musician' },
      update: {},
      create: {
        name: 'Musician',
        description: 'Musicians and music teachers',
        icon: '🎵',
        color: '#EC4899'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Designer' },
      update: {},
      create: {
        name: 'Designer',
        description: 'UI/UX and graphic designers',
        icon: '🎨',
        color: '#6366F1'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Consultant' },
      update: {},
      create: {
        name: 'Consultant',
        description: 'Business and strategy consultants',
        icon: '💼',
        color: '#059669'
      }
    }),
    prisma.personType.upsert({
      where: { name: 'Craftsman' },
      update: {},
      create: {
        name: 'Craftsman',
        description: 'Skilled craftsmen and artisans',
        icon: '🔨',
        color: '#DC2626'
      }
    })
  ]);

  console.log(`✅ Created ${personTypes.length} person types`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 