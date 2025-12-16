require('dotenv').config();
const User = require('./models/User');
const Sweet = require('./models/Sweet');
const { connectDB, closeDB } = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Sweet.deleteMany({});

    console.log('👤 Creating admin user...');
    await User.create({
      username: 'admin',
      email: 'admin@sweetshop.com',
      password: 'password123',
      role: 'admin'
    });

    // Create a demo customer as well for testing
    await User.create({
      username: 'customer',
      email: 'demo@sweetshop.com',
      password: 'password123',
      role: 'customer'
    });

    console.log('🍬 Creating sweets...');
    const categories = [
      'Chocolates',
      'Gummies',
      'Hard Candies',
      'Baked Goods',
      'Traditionals',
      'Sours'
    ];
    const adjectives = [
      'Delicious',
      'Sweet',
      'Sour',
      'Spicy',
      'Crunchy',
      'Chewy',
      'Creamy',
      'Dark',
      'White',
      'Rainbow'
    ];
    const types = [
      'Bar',
      'Truffle',
      'Bear',
      'Pop',
      'Drop',
      'Cake',
      'Cookie',
      'Delight',
      'Surprise',
      'Bite'
    ];

    const sweets = [];
    for (let i = 0; i < 50; i += 1) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category =
        categories[Math.floor(Math.random() * categories.length)];

      sweets.push({
        name: `${adj} ${type} ${i + 1}`,
        category,
        price: parseFloat((Math.random() * 20 + 1).toFixed(2)), // Random price between 1 and 21
        quantity: Math.floor(Math.random() * 100) + 1, // Random quantity between 1 and 100
        description: `A ${adj.toLowerCase()} ${type.toLowerCase()} that will satisfy your cravings.`
      });
    }

    await Sweet.insertMany(sweets);

    console.log('✅ Database seeded successfully!');
    console.log('   - 1 Admin user (admin@sweetshop.com / password123)');
    console.log('   - 1 Demo customer (demo@sweetshop.com / password123)');
    console.log('   - 50 Sweets created');

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
