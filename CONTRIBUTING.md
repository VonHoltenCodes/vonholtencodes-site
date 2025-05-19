# Contributing to VonHoltenCodes

Thank you for your interest in contributing to VonHoltenCodes! While this is primarily a personal project, I welcome suggestions, bug reports, and improvements.

## 🤝 Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10]
 - Browser: [e.g. Chrome 90]
 - Version: [e.g. 2.0]

**Additional context**
Add any other context about the problem here.
```

## 💡 Suggesting Features

Feature suggestions are welcome! Please provide:

- A clear and descriptive title
- A detailed description of the proposed feature
- Explain why this feature would be useful
- List any alternatives you've considered

## 📝 Pull Request Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/VonHoltenCodes/vonholtencodes-site.git
   cd vonholtencodes-site
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Test your changes thoroughly

3. **Commit Guidelines**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Commit message format:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

## 🏗️ Development Setup

1. **Local Environment**
   ```bash
   # Clone the repo
   git clone https://github.com/VonHoltenCodes/vonholtencodes-site.git
   cd vonholtencodes-site
   
   # Run setup
   ./setup.sh
   ```

2. **Install Dependencies**
   ```bash
   # If using npm for JavaScript dependencies
   npm install
   
   # If using Composer for PHP dependencies
   composer install
   ```

3. **Start Development Server**
   ```bash
   # Using PHP built-in server
   php -S localhost:8000
   
   # Or configure Apache/Nginx
   ```

## 🎨 Style Guidelines

### PHP Code Style
- Follow PSR-12 coding standard
- Use meaningful variable names
- Add PHPDoc comments for functions

```php
/**
 * Calculate user age from birthdate
 * 
 * @param string $birthdate Date in Y-m-d format
 * @return int Age in years
 */
function calculateAge(string $birthdate): int {
    // Implementation
}
```

### JavaScript Style
- Use ES6+ features
- Follow ESLint configuration
- Use camelCase for variables and functions

```javascript
// Good
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  return today.getFullYear() - birth.getFullYear();
};

// Bad
function calc_age(birth_date) {
  var today = new Date();
  var birth = new Date(birth_date);
  return today.getFullYear() - birth.getFullYear();
}
```

### CSS Guidelines
- Use BEM methodology for class names
- Keep selectors specific but not overly nested
- Use CSS variables for theming

```css
/* Good */
.header__navigation {
  display: flex;
  align-items: center;
}

.header__navigation-item {
  margin: 0 1rem;
}

/* Bad */
.header div ul li a {
  margin: 0 1rem;
}
```

## 🧪 Testing

Please ensure:
- All existing tests pass
- New features include tests
- Code coverage remains high

```bash
# Run PHP tests
phpunit

# Run JavaScript tests
npm test

# Check code style
npm run lint
```

## 📋 Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Commit messages follow guidelines

## 🔒 Security

If you discover a security vulnerability, please email the maintainer directly instead of creating a public issue.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Thanks for taking the time to contribute! Every contribution helps make VonHoltenCodes better.