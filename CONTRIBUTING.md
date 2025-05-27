# Contributing to Copenhagen Parking Finder

Thank you for your interest in contributing to the Copenhagen Parking Finder! This project aims to help drivers find private parking in Copenhagen through community collaboration.

## 🌟 Ways to Contribute

- 🐛 **Report bugs** and issues
- 💡 **Suggest new features** or improvements
- 📝 **Improve documentation**
- 🗺️ **Add parking data** and verify locations
- 💻 **Write code** for new features or bug fixes
- 🎨 **Improve UI/UX** design
- 🧪 **Write tests** to improve code quality

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase CLI
- Basic knowledge of Svelte, JavaScript, and web development

### Development Environment Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/parkeringspladser.git
   cd parkeringspladser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase locally**
   ```bash
   # Install Supabase CLI globally if not already installed
   npm install -g @supabase/cli
   
   # Initialize and start local Supabase
   supabase start
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your local Supabase credentials (displayed after `supabase start`)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Verify setup**
   Open `http://localhost:5173` in your browser

## 📋 Finding Work

### Good First Issues

Look for issues labeled [`good first issue`](https://github.com/martincollignon/parkeringspladser/labels/good%20first%20issue) - these are perfect for newcomers!

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `data` - Related to parking data collection/verification

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run tests
npm test

# Build the project
npm run build
```

### 4. Commit Your Changes

We follow conventional commit messages:

```bash
git commit -m "feat: add parking search functionality"
git commit -m "fix: resolve map marker positioning issue"
git commit -m "docs: update API documentation"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues (`Closes #123`)
- Screenshots for UI changes
- Testing instructions

## 🎨 Code Style Guidelines

### JavaScript/Svelte

- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for complex functions

### CSS

- Use CSS custom properties for theming
- Follow mobile-first responsive design
- Use semantic class names
- Prefer CSS Grid and Flexbox for layouts

### File Organization

```
src/
├── components/          # Reusable Svelte components
├── routes/             # SvelteKit routes
├── lib/                # Utility functions and stores
├── styles/             # Global styles and themes
└── assets/             # Static assets
```

## 🗺️ Data Contribution Guidelines

### Adding Parking Locations

When contributing parking data:

1. **Verify accuracy** - Double-check location, name, and operator
2. **Use reliable sources** - Official websites, on-site verification
3. **Include photos** - Clear images of entrances, signage, payment systems
4. **Add Mapillary links** - Street-level context when available
5. **Follow moderation guidelines** - Ensure content is appropriate

### Data Quality Standards

- **Location accuracy**: GPS coordinates within 10 meters
- **Current information**: Verify fees and hours are up-to-date
- **Complete details**: Include all available relevant information
- **Visual evidence**: Photos or Mapillary links when possible

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Use descriptive test names
- Test both happy path and edge cases

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms or business logic
- Keep README.md updated with new features

### User Documentation

- Update user guides for new features
- Include screenshots for UI changes
- Write clear, step-by-step instructions

## 🔍 Code Review Process

### For Contributors

- Ensure your PR is ready for review
- Respond to feedback promptly
- Make requested changes in new commits
- Keep discussions focused and constructive

### For Reviewers

- Be constructive and helpful
- Focus on code quality, not personal preferences
- Suggest improvements with examples
- Approve when ready, request changes when needed

## 🚨 Reporting Issues

### Bug Reports

Include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Screenshots or error messages

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Possible implementation approach
- Mockups or examples if applicable

## 🏷️ Issue Templates

Use our issue templates for:
- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
- [Data Issue](.github/ISSUE_TEMPLATE/data_issue.md)

## 💬 Communication

### Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas, showcase
- **Pull Request Comments**: Code-specific discussions

### Guidelines

- Be respectful and inclusive
- Stay on topic
- Search before posting
- Use clear, descriptive titles

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special mentions for outstanding contributions

## ❓ Questions?

- Check existing [GitHub Discussions](https://github.com/martincollignon/parkeringspladser/discussions)
- Create a new discussion for general questions
- Use issues for specific bugs or feature requests

---

**Thank you for contributing to Copenhagen Parking Finder! Together, we're making parking easier for everyone in Copenhagen. 🚗🅿️** 