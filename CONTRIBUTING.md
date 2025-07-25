# Contributing to Real Estate Dashboard

Chúng tôi rất hoan nghênh mọi đóng góp cho dự án Real Estate Dashboard! Đây là hướng dẫn để giúp bạn đóng góp hiệu quả.

## 🚀 Cách đóng góp

### 1. Fork và Clone

```bash
# Fork repository trên GitHub, sau đó clone về máy
git clone https://github.com/your-username/real-estate-app.git
cd real-estate-app
```

### 2. Tạo branch mới

```bash
# Tạo branch từ main/master
git checkout -b feature/ten-tinh-nang-moi
# hoặc
git checkout -b bugfix/sua-loi-gi-do
# hoặc
git checkout -b improvement/cai-tien-gi-do
```

### 3. Commit changes

```bash
# Add changes
git add .

# Commit với message rõ ràng
git commit -m "feat: thêm tính năng filter theo giá"
# hoặc
git commit -m "fix: sửa lỗi hiển thị trên mobile"
# hoặc
git commit -m "docs: cập nhật hướng dẫn cài đặt"
```

### 4. Push và tạo Pull Request

```bash
# Push branch lên GitHub
git push origin feature/ten-tinh-nang-moi

# Tạo Pull Request trên GitHub
```

## 📝 Quy tắc Commit Message

Chúng tôi sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Thay đổi documentation
- `style`: Thay đổi formatting, thiếu semicolon, etc
- `refactor`: Code refactoring
- `perf`: Cải thiện performance
- `test`: Thêm tests
- `chore`: Thay đổi build process, tools, libraries

### Examples
```bash
feat: thêm filter theo khoảng giá
fix: sửa lỗi responsive trên tablet
docs: cập nhật README với hướng dẫn deployment
style: format code theo prettier rules
refactor: tách component ApartmentCard từ ApartmentTable
perf: optimize database queries
test: thêm unit tests cho API endpoints
chore: cập nhật dependencies lên version mới
```

## 🔧 Development Setup

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Git

### Installation
```bash
# Cài đặt dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../scripts && npm install

# Chạy trong development mode
cd backend && npm run dev    # Terminal 1
cd frontend && npm start     # Terminal 2
```

### Testing
```bash
# Chạy tests
npm test                     # Tất cả tests
npm run test:frontend       # Frontend tests only
npm run test:backend        # Backend tests only
npm run test:scripts        # Scripts tests only

# Test coverage
npm run test:coverage
```

### Linting và Formatting
```bash
# ESLint
npm run lint                # Check linting
npm run lint:fix           # Fix linting issues

# Prettier
npm run format             # Format code
npm run format:check       # Check formatting
```

## 📋 Coding Standards

### JavaScript/React
- Sử dụng ES6+ features
- Functional components với Hooks
- Proper PropTypes hoặc TypeScript
- Meaningful component và variable names
- Comments cho complex logic

### CSS
- BEM methodology cho class naming
- Mobile-first responsive design
- CSS Variables cho theming
- Avoid !important unless absolutely necessary

### File Structure
```
src/
├── components/           # Reusable components
│   ├── common/          # Shared components
│   └── specific/        # Feature-specific components
├── pages/               # Page components
├── hooks/               # Custom hooks
├── utils/               # Utility functions
├── constants/           # Constants
├── styles/              # Global styles
└── tests/               # Test files
```

## 🐛 Bug Reports

Khi báo cáo bug, hãy bao gồm:

### Template
```markdown
**Mô tả bug**
Mô tả ngắn gọn về bug.

**Steps to reproduce**
1. Đi đến '...'
2. Click vào '....'
3. Scroll xuống '....'
4. Thấy error

**Expected behavior**
Mô tả những gì bạn mong đợi.

**Screenshots**
Nếu có thể, thêm screenshots.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]
 - Node.js version
 - npm version

**Additional context**
Thêm bất kỳ context nào khác về vấn đề.
```

## 💡 Feature Requests

### Template
```markdown
**Is your feature request related to a problem?**
Mô tả vấn đề. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
Mô tả rõ ràng về giải pháp bạn muốn.

**Describe alternatives you've considered**
Mô tả các giải pháp thay thế bạn đã cân nhắc.

**Additional context**
Thêm screenshots, mockups, hoặc context khác.
```

## 📚 Documentation

- Cập nhật README.md nếu thay đổi cách sử dụng
- Thêm JSDoc comments cho functions
- Cập nhật API documentation nếu thay đổi endpoints
- Screenshots cho UI changes

## ✅ Pull Request Checklist

Trước khi submit PR, đảm bảo:

- [ ] Code passes all tests (`npm test`)
- [ ] Code follows style guidelines (`npm run lint`)
- [ ] Self-review of code
- [ ] Comments added cho complex areas
- [ ] Documentation updated nếu cần
- [ ] No console.log statements trong production code
- [ ] Mobile responsive (nếu có UI changes)
- [ ] Browser compatibility tested
- [ ] Screenshots added cho UI changes

## 🎯 Priority Areas

Chúng tôi đặc biệt quan tâm đến các đóng góp trong:

1. **Performance Optimization**
   - Database query optimization
   - Frontend rendering performance
   - Bundle size reduction

2. **User Experience**
   - Mobile responsiveness improvements
   - Accessibility features
   - Loading states và error handling

3. **Features**
   - Advanced filtering và sorting
   - Data export functionality
   - User authentication
   - Real-time notifications

4. **Testing**
   - Unit tests coverage
   - Integration tests
   - E2E tests với Cypress

5. **Documentation**
   - API documentation
   - Deployment guides
   - Video tutorials

## 🤝 Code of Conduct

- Tôn trọng mọi người tham gia
- Sử dụng ngôn ngữ inclusive và welcoming
- Tập trung vào constructive feedback
- Không personal attacks hoặc harassment

## 📞 Support

Nếu cần hỗ trợ:
- Tạo issue trên GitHub
- Email: [your-email@example.com]
- Discord: [Discord server link]

## 🙏 Recognition

Tất cả contributors sẽ được thêm vào:
- README.md Contributors section
- CHANGELOG.md
- GitHub Contributors page

Cảm ơn bạn đã đóng góp cho Real Estate Dashboard! 🏠✨
