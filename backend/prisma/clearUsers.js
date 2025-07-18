const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearUsers() {
  try {
    console.log('🗑️  Clearing existing users...');
    
    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    
    console.log(`✅ Deleted ${deletedUsers.count} users`);
    
    // Also clear related data
    await prisma.comment.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.listing.deleteMany({});
    
    console.log('✅ Cleared all related data (comments, messages, listings)');
    
  } catch (error) {
    console.error('❌ Error clearing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers(); 