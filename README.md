# Copenhagen Parking Finder 🚗🅿️

A mobile-optimized web application helping drivers find private, fee-based parking in Copenhagen when public street parking is scarce.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)

## 🎯 Project Overview

Copenhagen faces significant parking challenges, with drivers often spending considerable time searching for available spots. While public street parking may appear fully occupied, numerous private parking garages offer alternatives. This project bridges that information gap by providing a comprehensive, community-driven map of private parking facilities.

### Key Features

- 🗺️ **Interactive Map**: Mobile-optimized map showing private parking locations
- 📍 **Detailed Information**: Parking details including fees, hours, and operator info
- 📸 **Visual Context**: Integration with Mapillary for street-level imagery
- 👥 **Community Driven**: User submissions with moderation system
- 🧭 **Navigation**: Direct links to external navigation apps
- 📱 **Mobile First**: Optimized for mobile devices

## 🚀 Live Demo

[Coming Soon - Will be deployed to Vercel]

## 🛠️ Tech Stack

- **Frontend**: Svelte + SvelteKit + TypeScript
- **Maps**: MapLibre GL JS + Protomaps (modern vector tiles)
- **Backend**: Supabase (zero backend code needed)
- **Deployment**: Vercel (zero-config deployment)
- **Data Sources**: OpenStreetMap + Mapillary + User Contributions

## 🏗️ Project Structure

```
copenhagen-parking-finder/
├── src/                    # Svelte frontend source
│   ├── components/         # Reusable Svelte components
│   ├── routes/            # SvelteKit routes
│   ├── lib/               # Utility functions and stores
│   └── styles/            # Global styles and themes
├── supabase/              # Database schema and functions
├── scripts/               # Data processing scripts
└── static/                # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase CLI (for local development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/martincollignon/parkeringspladser.git
   cd parkeringspladser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g @supabase/cli
   
   # Start local Supabase instance
   supabase start
   ```

4. **Environment setup**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🤝 Contributing

We welcome contributions from the community! This project follows the principles of open-source collaboration.

### Quick Start for Contributors

1. Check out our [Contributing Guidelines](CONTRIBUTING.md)
2. Look for issues labeled [`good first issue`](https://github.com/martincollignon/parkeringspladser/labels/good%20first%20issue)
3. Join our discussions in [GitHub Discussions](https://github.com/martincollignon/parkeringspladser/discussions)

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📊 Current Status

### Phase 1: Foundation & Quick Wins ✅
- [x] Repository Setup
- [x] Tech Stack Decisions (MapLibre + Protomaps)
- [ ] Supabase Setup
- [ ] Frontend Scaffold
- [ ] Basic Map Display

### Phase 2: Data Integration (In Progress)
- [ ] OSM Data Pipeline
- [ ] Data Display
- [ ] Manual Data Enhancement

## 🗺️ Data Sources

- **OpenStreetMap**: Primary source for parking locations and basic attributes
- **Mapillary**: Street-level imagery and visual context
- **User Contributions**: Community-submitted parking information and photos

## 📱 Mobile Optimization

This application is designed mobile-first, ensuring excellent performance and usability on smartphones where users typically search for parking while on the go.

## 🌍 Focus Area

Currently focused on **Copenhagen, Denmark**, with potential for expansion to other Danish cities based on community interest and contribution.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenStreetMap contributors for parking data
- Mapillary community for street-level imagery
- Copenhagen parking operators for inspiration
- Design inspiration from [London Underground Live](https://www.londonunderground.live/)

## 📞 Support

- 🐛 [Report bugs](https://github.com/martincollignon/parkeringspladser/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/martincollignon/parkeringspladser/issues/new?template=feature_request.md)
- 💬 [Join discussions](https://github.com/martincollignon/parkeringspladser/discussions)

---

**Ready to help Copenhagen drivers find parking? Let's build something amazing together! 🚗🅿️**
