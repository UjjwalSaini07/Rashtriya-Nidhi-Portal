# Contributing to Rashtriya Nidhi Portal

Thank you for your interest in contributing to the Rashtriya Nidhi Portal! This document provides guidelines and information for contributors.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Security](#security)
- [Community](#community)

## Code of Conduct
This project follows a code of conduct to ensure a welcoming environment for all contributors. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher
- Git
- Docker and Docker Compose (for full development environment)
- VS Code (recommended) with required extensions

### Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/UjjwalSaini07/Rashtriya-Nidhi-Portal
   cd rashtriya-nidhi-portal
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/---/rashtriya-nidhi-portal.git
   ```

## Development Setup

### Quick Setup with Docker
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Manual Setup
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Start development servers
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

For detailed setup instructions, see our [Development Guide](../docs/development.md).

## How to Contribute

### Types of Contributions
- **Bug Fixes**: Fix bugs and issues
- **Features**: Add new functionality
- **Documentation**: Improve documentation
- **Tests**: Add or improve tests
- **Security**: Security enhancements
- **Performance**: Performance improvements
- **UI/UX**: User interface improvements

### Finding Issues to Work On
1. Check the [Issues](https://github.com/UjjwalSaini07/Rashtriya-Nidhi-Portal/issues) page
2. Look for issues labeled `good first issue` or `help wanted`
3. Comment on the issue to indicate you're working on it
4. Wait for maintainer approval before starting work

### Reporting Bugs
Use our [Bug Report Template](ISSUE_TEMPLATE/bug-report.yml) when reporting bugs.

### Suggesting Features
Use our [Feature Request Template](ISSUE_TEMPLATE/feature-request.yml) for feature suggestions.

## Development Workflow

### Branch Naming Convention
```bash
# Feature branches
feature/user-authentication
feature/bill-creation-workflow

# Bug fix branches
bugfix/login-validation-error
bugfix/bill-status-display

# Hotfix branches
hotfix/security-patch
hotfix/database-connection-issue

# Documentation branches
docs/api-endpoints
docs/deployment-guide
```

### Commit Message Format
We follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

**Examples:**
```bash
feat(auth): add JWT token refresh functionality
fix(bill): resolve duplicate bill number validation
docs(api): update authentication endpoints documentation
test(auth): add integration tests for login flow
```

### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
2. **Make Changes**: Implement your feature with tests
3. **Run Tests**: Ensure all tests pass
4. **Update Documentation**: Update docs if needed
5. **Commit Changes**: Use conventional commit messages
6. **Push Branch**: `git push origin feature/your-feature-name`
7. **Create PR**: Use the PR template
8. **Code Review**: Address reviewer feedback
9. **Merge**: Squash merge after approval

## Coding Standards

### JavaScript/Node.js
- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for anonymous functions
- Use template literals for string interpolation
- Follow async/await pattern over Promises
- Use destructuring for objects and arrays

### React/Next.js
- Use functional components with hooks
- Follow component composition patterns
- Use TypeScript for type safety (when applicable)
- Implement proper error boundaries
- Use React Query for server state management
- Follow accessibility guidelines (WCAG 2.1)

### Code Formatting
- Use Prettier for automatic formatting
- Follow ESLint configuration
- Use consistent naming conventions
- Keep functions small and focused
- Add JSDoc comments for complex functions

### File Organization
- Group related files in directories
- Use barrel exports (index.js) for clean imports
- Separate concerns (components, hooks, utils, types)
- Follow established project structure

## Testing

### Testing Strategy
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test application performance
- **Security Tests**: Test security features

### Running Tests
```bash
# Server tests
cd server
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage

# Client tests
cd client
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:e2e           # E2E tests
```

### Test Coverage Requirements
- Maintain >80% code coverage
- Cover critical business logic
- Test error conditions and edge cases
- Include integration tests for APIs

### Writing Tests
```javascript
// Unit test example
describe('User Model', () => {
  it('should hash password on save', async () => {
    const user = new User({ password: 'test123' });
    await user.save();
    expect(user.password).not.toBe('test123');
  });
});

// Integration test example
describe('Authentication API', () => {
  it('should login successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ nicId: 'TEST001', password: 'password123' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## Documentation

### Documentation Standards
- Use Markdown for all documentation
- Keep documentation in the `docs/` folder
- Update documentation with code changes
- Include code examples and screenshots
- Use consistent formatting and structure

### API Documentation
- Document all endpoints with examples
- Include request/response formats
- Specify authentication requirements
- Document error responses
- Keep API docs up to date

### Code Documentation
- Use JSDoc for function documentation
- Document complex business logic
- Explain non-obvious code decisions
- Keep comments current with code changes

## Security

### Security Considerations
- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication and authorization
- Follow OWASP security guidelines
- Report security vulnerabilities responsibly

### Security Checklist
- [ ] Input validation implemented
- [ ] Authentication/Authorization in place
- [ ] Sensitive data encrypted
- [ ] HTTPS enabled in production
- [ ] Security headers configured
- [ ] Dependencies regularly updated
- [ ] Security scans pass

## Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussions and questions
- **Email**: For security issues (security@rnp.gov.in)

### Getting Help
- Check existing issues and documentation first
- Use clear, descriptive titles for issues
- Provide complete information and context
- Be respectful and constructive in communications

### Recognition
Contributors will be recognized through:
- GitHub contributor statistics
- Mention in release notes
- Attribution in documentation
- Community acknowledgments

## Additional Resources

### Learning Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Development Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [GitKraken](https://www.gitkraken.com/)

Thank you for contributing to the Rashtriya Nidhi Portal! Your contributions help make government fund allocation more transparent and efficient.