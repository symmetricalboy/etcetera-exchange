# 🎁 etcetera.exchange

*A whimsical universe where everyday objects become extraordinary treasures*

## ✨ What is etcetera.exchange?

etcetera.exchange is a delightful Bluesky bot that distributes magical and mundane objects to users once every 24 hours. From "a paperclip that remembers important dates" to "the last hiccup in the universe, preserved in a soap bubble," every object tells a story and sparks imagination.

### 🌟 Features

- **Daily Object Claims**: Every 24 hours (reset at midnight UTC), mention the bot to receive a random object
- **Rarity System**: Objects range from Common (40%) to Unique (0.1%) with increasing whimsy
- **Gift System**: Share your treasures with friends by mentioning the bot
- **Collection Tracking**: View your complete collection at [etcetera.exchange](https://etcetera.exchange)
- **AI-Generated Content**: 10,000+ objects created by Gemini AI with Imagen-generated images

## 🤖 How to Use

### On Bluesky

1. **Follow the bot**: [@etcetera.exchange](https://bsky.app/profile/etcetera.exchange)
2. **Claim daily object**: Mention `@etcetera.exchange` in any post
3. **Gift objects**: Mention the bot with a friend's handle to send them something from your collection

Example posts:
```
Hey @etcetera.exchange, give me my daily object! ✨

@etcetera.exchange can you send my magical teacup to @alice.bsky.social? 🫖
```

### On the Web

Visit [etcetera.exchange](https://etcetera.exchange) to:
- View your complete object collection
- Browse the object catalog
- Send gifts through the web interface
- Check leaderboards and community stats

## 🏗️ Project Structure

This is a monorepo containing several packages:

```
etcetera-exchange/
├── packages/
│   ├── bot/          # Bluesky bot that handles mentions and distributions
│   ├── web/          # Next.js web application 
│   ├── database/     # PostgreSQL schema and utilities
│   ├── scripts/      # Object generation scripts using Gemini/Imagen
│   └── shared/       # Shared types and utilities
└── ...
```

### 📦 Tech Stack

- **Bot**: Node.js, AT Protocol, Gemini API
- **Web**: Next.js 14, React, Tailwind CSS, NextAuth.js
- **Database**: PostgreSQL with comprehensive schema
- **AI**: Google Gemini API for object generation and NLP
- **Images**: Google Imagen for object illustrations
- **Deployment**: Railway with automatic scaling
- **Authentication**: Bluesky OAuth integration

## 🛠️ Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Gemini API key
- Bluesky account with app password

### Setup

1. **Clone and install**:
```bash
git clone https://github.com/your-repo/etcetera-exchange.git
cd etcetera-exchange
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env
# Fill in your API keys and database credentials
```

3. **Database setup**:
```bash
npm run db:migrate
```

4. **Generate objects** (optional for testing):
```bash
npm run generate:objects  # Generates 100 test objects
```

5. **Start development**:
```bash
npm run dev  # Starts all services
```

### Package-specific commands

```bash
# Database operations
cd packages/database
npm run migrate        # Run database migrations
npm run seed          # Seed with test data

# Object generation
cd packages/scripts  
npm run generate:objects    # Generate 100 objects
npm run generate:batch      # Generate full 10k+ catalog
npm run test:generation     # Test generation system

# Bot development
cd packages/bot
npm run dev           # Run bot with auto-restart
npm run test          # Test bot functionality

# Web development  
cd packages/web
npm run dev           # Next.js development server
npm run build         # Production build
```

## 🎨 Object Rarity System

| Rarity | Chance | Example |
|---------|---------|----------|
| 📦 Common | 40% | "A paperclip that remembers important dates" |
| 🎁 Uncommon | 25% | "A rubber duck that quacks in different languages" |
| ✨ Rare | 20% | "A compass that points to the nearest bookstore" |
| 🔮 Epic | 10% | "A mirror that shows you in any outfit" |
| ⭐ Legendary | 4% | "A blanket that gives perfect dreams" |
| 🌟 Mythic | 0.9% | "A pocket watch that pauses time (except for cats)" |
| 💫 Unique | 0.1% | "The last hiccup in the universe, in a soap bubble" |

## 🚀 Deployment

We use Railway for deployment with automatic PostgreSQL setup:

1. **Quick deploy**: 
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

2. **Manual deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

### Environment Variables

Required for production:

```bash
# Database
DATABASE_URL=postgresql://...

# Gemini API  
GEMINI_API_KEY=your_api_key

# Bluesky Bot
BLUESKY_IDENTIFIER=botaccount@bsky.social
BLUESKY_PASSWORD=app_password

# Web App
NEXTAUTH_SECRET=random_secret
NEXTAUTH_URL=https://etcetera.exchange
BLUESKY_CLIENT_ID=oauth_client_id
BLUESKY_CLIENT_SECRET=oauth_client_secret
```

## 📊 Database Schema

The system uses PostgreSQL with tables for:

- **objects**: Master catalog of all possible objects with rarity, descriptions, images
- **users**: Bluesky users who interact with the bot
- **user_inventory**: What objects each user owns
- **daily_claims**: Tracking daily gift claims (reset every 24h UTC)  
- **gift_transactions**: Log of all gifts between users
- **bot_interactions**: Complete log of bot mentions and responses

See [packages/database/schema.sql](./packages/database/schema.sql) for full schema.

## 🤝 Contributing

We welcome contributions! Here are some areas where help is appreciated:

- 🎨 **Object Ideas**: Suggest new whimsical objects
- 🐛 **Bug Reports**: Found something broken?
- ✨ **Feature Requests**: Ideas for new functionality
- 🧪 **Testing**: Help test across different scenarios
- 📚 **Documentation**: Improve guides and examples

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (including bot interactions)
5. Submit a pull request

### Code Style

- TypeScript for type safety
- ESLint + Prettier for formatting
- Conventional commits for clear history
- Comprehensive error handling
- User-friendly error messages

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bluesky Team**: For the fantastic decentralized social platform
- **Google AI**: For Gemini and Imagen APIs that power our creativity
- **Railway**: For seamless deployment and hosting
- **Community**: Everyone who participates in the whimsical object exchange!

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-repo/etcetera-exchange/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/your-repo/etcetera-exchange/discussions)  
- 🦋 **Bot Issues**: Mention [@etcetera.exchange](https://bsky.app/profile/etcetera.exchange) on Bluesky
- 🌐 **Website**: [etcetera.exchange](https://etcetera.exchange)

---

*Made with ✨ and a lot of whimsy*

> "In a world where you can be anything, be someone who distributes magical paperclips to strangers on the internet." - The etcetera.exchange Philosophy