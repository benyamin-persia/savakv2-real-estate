const mongoose = require('mongoose');
const Type = require('../models/Type');
require('dotenv').config();

const types = [
  {
    name: 'Freelancers',
    slug: 'freelancers',
    description: 'Independent professionals offering services in various fields like design, development, writing, and consulting.',
    icon: '💼',
    color: '#3B82F6',
    category: 'professional',
    isFeatured: true,
    sortOrder: 1
  },
  {
    name: 'Artists & Creatives',
    slug: 'artists-creatives',
    description: 'Visual artists, musicians, designers, photographers, and creative professionals showcasing their work.',
    icon: '🎨',
    color: '#8B5CF6',
    category: 'creative',
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: 'Tutors & Educators',
    slug: 'tutors-educators',
    description: 'Teachers, tutors, and educational professionals offering learning services and academic support.',
    icon: '📚',
    color: '#10B981',
    category: 'educational',
    isFeatured: true,
    sortOrder: 3
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Personal trainers, nutritionists, therapists, yoga instructors, and wellness professionals.',
    icon: '💪',
    color: '#EF4444',
    category: 'health',
    isFeatured: true,
    sortOrder: 4
  },
  {
    name: 'Home Services',
    slug: 'home-services',
    description: 'Plumbers, electricians, cleaners, landscapers, and other home maintenance professionals.',
    icon: '🏠',
    color: '#F59E0B',
    category: 'service',
    isFeatured: false,
    sortOrder: 5
  },
  {
    name: 'Event Planners',
    slug: 'event-planners',
    description: 'Wedding planners, party organizers, corporate event managers, and celebration specialists.',
    icon: '🎉',
    color: '#EC4899',
    category: 'service',
    isFeatured: false,
    sortOrder: 6
  },
  {
    name: 'Tech Support',
    slug: 'tech-support',
    description: 'IT professionals, computer repair specialists, software consultants, and tech troubleshooters.',
    icon: '💻',
    color: '#6366F1',
    category: 'professional',
    isFeatured: false,
    sortOrder: 7
  },
  {
    name: 'Language Teachers',
    slug: 'language-teachers',
    description: 'Language instructors, translators, interpreters, and cultural exchange facilitators.',
    icon: '🌍',
    color: '#06B6D4',
    category: 'educational',
    isFeatured: false,
    sortOrder: 8
  },
  {
    name: 'Pet Services',
    slug: 'pet-services',
    description: 'Pet sitters, dog walkers, groomers, trainers, and animal care professionals.',
    icon: '🐕',
    color: '#84CC16',
    category: 'service',
    isFeatured: false,
    sortOrder: 9
  },
  {
    name: 'Social Groups',
    slug: 'social-groups',
    description: 'Hobby groups, sports teams, book clubs, gaming communities, and social organizers.',
    icon: '👥',
    color: '#F97316',
    category: 'social',
    isFeatured: false,
    sortOrder: 10
  },
  {
    name: 'Consultants',
    slug: 'consultants',
    description: 'Business consultants, strategy advisors, career coaches, and professional mentors.',
    icon: '📊',
    color: '#6B7280',
    category: 'professional',
    isFeatured: false,
    sortOrder: 11
  },
  {
    name: 'Crafters & Makers',
    slug: 'crafters-makers',
    description: 'Handmade artisans, DIY experts, woodworkers, knitters, and craft professionals.',
    icon: '🔨',
    color: '#A855F7',
    category: 'creative',
    isFeatured: false,
    sortOrder: 12
  }
];

const seedTypes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing types
    await Type.deleteMany({});
    console.log('🗑️  Cleared existing types');

    // Insert new types
    const createdTypes = await Type.insertMany(types);
    console.log(`✅ Created ${createdTypes.length} types:`);

    // Display created types
    createdTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type.icon} ${type.name} (${type.category})`);
    });

    console.log('\n🎉 Types seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding types:', error);
    process.exit(1);
  }
};

// Run the seed function
seedTypes(); 