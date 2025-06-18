# KarmicDD Backend Testing Framework (Phase 1)

This directory contains the comprehensive testing framework for the KarmicDD Backend, implementing Phase 1 of the testing strategy as outlined in the project requirements.

## 🎯 Phase 1 Overview

Phase 1 focuses on establishing a robust testing infrastructure that serves as the foundation for comprehensive unit, integration, and end-to-end testing in subsequent phases.

## 📁 Directory Structure

```
src/tests/
├── setup/                          # Test configuration and setup
│   ├── setupTests.ts              # Global test setup and mocks
│   ├── setupTestDB.ts             # Database setup utilities  
│   └── jest.d.ts                  # Jest type definitions
├── utils/                          # Test utilities and helpers
│   ├── testHelpers.ts             # Core test utilities
│   ├── customMatchers.ts          # Custom Jest matchers
│   └── testDatabaseSeeder.ts      # Database seeding utilities
├── unit/                          # Unit tests (Phase 2)
│   ├── services/                  # Service layer tests
│   ├── controllers/               # Controller layer tests
│   └── utils/                     # Utility function tests
├── integration/                   # Integration tests (Phase 3)
├── infrastructure.test.ts         # Infrastructure verification test
└── PHASE_1_COMPLETE.md           # Phase 1 documentation
```

## 🛠️ Available Test Utilities

### TestDataFactory
Factory functions for creating consistent test data:

```typescript
// Create test users
const startup = await TestDataFactory.createTestStartup(prisma);
const investor = await TestDataFactory.createTestInvestor(prisma);

// Generate JWT tokens
const token = TestDataFactory.generateMockJWT(userId, email, role);

// Create mock requests
const request = TestDataFactory.createMockAuthenticatedRequest(user);
```

### Custom Jest Matchers
Domain-specific assertion helpers:

```typescript
expect(user).toBeValidUser();
expect(token).toBeValidJWT();
expect(email).toBeValidEmail();
expect(role).toBeValidUserRole();
expect(response).toBeSuccessfulAPIResponse();
```

### MockServices
Pre-configured mocks for external services:

```typescript
// Email service mocks
MockServices.mockEmailService.sendEmail.mockResolvedValue({ success: true });

// AI service mocks  
MockServices.mockGeminiAPI.generateContent.mockResolvedValue(mockResponse);

// OAuth provider mocks
MockServices.mockOAuthProviders.google.authenticate.mockResolvedValue(userData);
```

### TestDatabaseSeeder
Comprehensive database seeding utilities:

```typescript
const seeder = new TestDatabaseSeeder(prisma);

// Seed all test data
await seeder.seedAll();

// Seed specific data types
await seeder.seedTestUsers();
await seeder.seedTestStartupProfiles();
await seeder.seedTestRecommendations();

// Cleanup
await seeder.cleanup();
```

## ⚙️ Configuration

### Jest Configuration
- **TypeScript Support**: Full ts-jest integration
- **Test Environment**: Node.js environment for backend testing
- **Coverage**: Configured for 80% minimum coverage threshold
- **Setup Files**: Automatic loading of test utilities and mocks

### Environment Configuration
Test-specific environment variables in `.env.test`:
- Separate test databases (PostgreSQL & MongoDB)
- Mock API keys for external services
- Disabled logging for cleaner test output
- JWT secrets for authentication testing

## 🚀 Quick Start

### 1. Verify Setup
```bash
npm run verify:phase1
```

### 2. Run Infrastructure Test
```bash
npm run test:infrastructure
```

### 3. Run All Tests
```bash
npm test
```

### 4. Run Tests with Coverage
```bash
npm run test:coverage
```

### 5. Watch Mode for Development
```bash
npm run test:watch
```

## 📝 Writing Tests

### Basic Test Structure
```typescript
import { TestDataFactory, TestAssertions, MockServices } from '../utils/testHelpers';
import TestDatabaseSeeder from '../utils/testDatabaseSeeder';

describe('Service Name', () => {
  let seeder: TestDatabaseSeeder;

  beforeAll(async () => {
    seeder = new TestDatabaseSeeder(prisma);
    await seeder.seedAll();
  });

  afterAll(async () => {
    await seeder.cleanup();
  });

  beforeEach(() => {
    MockServices.resetAllMocks();
  });

  it('should test functionality', async () => {
    const user = await TestDataFactory.createTestUser(prisma);
    const result = await serviceMethod(user.user_id);
    
    expect(result).toBeValidUser();
    TestAssertions.expectValidAPIResponse(result);
  });
});
```

### Using Custom Matchers
```typescript
// User validation
expect(user).toBeValidUser();
expect(user.email).toBeValidEmail();
expect(user.role).toBeValidUserRole();

// API response validation
expect(response).toBeSuccessfulAPIResponse();
expect(errorResponse).toBeErrorAPIResponse(400, 'Validation failed');

// Business logic validation
expect(recommendation).toBeValidRecommendation();
expect(matchingScore).toBeValidMatchingScore();
```

## 🧪 Test Categories

### Unit Tests (Phase 2)
- **Service Layer**: Business logic testing
- **Controller Layer**: API endpoint testing  
- **Utility Functions**: Helper function testing

### Integration Tests (Phase 3)
- **API Endpoints**: End-to-end API testing
- **Database Operations**: Cross-database testing
- **External Services**: Third-party integration testing

### End-to-End Tests (Phase 4)
- **User Journeys**: Complete workflow testing
- **Authentication Flows**: OAuth and JWT testing
- **File Processing**: Document upload and analysis testing

## 🎨 Best Practices

### Test Organization
- One test file per service/controller
- Descriptive test names following BDD format
- Logical grouping with `describe` blocks
- Proper setup and teardown

### Test Data Management
- Use factory functions for consistent data creation
- Clean up test data between tests
- Use realistic test data that matches production patterns
- Isolate tests from each other

### Mocking Strategy
- Mock external services and APIs
- Use real database connections with test data
- Reset mocks between tests
- Verify mock interactions when relevant

### Assertion Strategy
- Use custom matchers for domain-specific validations
- Test both success and error scenarios
- Validate data structure and business rules
- Check edge cases and boundary conditions

## 📊 Coverage Goals

- **Overall Coverage**: 80% minimum
- **Functions**: 80% minimum  
- **Lines**: 80% minimum
- **Branches**: 80% minimum
- **Statements**: 80% minimum

## 🔧 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure test databases are running
2. **Environment Variables**: Check `.env.test` configuration
3. **TypeScript Compilation**: Run `npx tsc --noEmit` to check for errors
4. **Mock Reset**: Ensure `MockServices.resetAllMocks()` is called in `beforeEach`

### Debug Commands
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- infrastructure.test.ts

# Debug failing tests
npm test -- --detectOpenHandles
```

## 🎯 Next Phases

- **Phase 2**: Implement service and controller unit tests
- **Phase 3**: Add comprehensive integration tests
- **Phase 4**: Implement end-to-end testing with Playwright
- **Phase 5**: Add performance and security testing

## ✅ Phase 1 Completion Checklist

- [x] Jest configuration with TypeScript
- [x] Test environment setup (.env.test)
- [x] Custom Jest matchers for domain validation
- [x] Test data factory functions
- [x] Mock service configurations
- [x] Database seeding utilities
- [x] Test assertion helpers
- [x] File operation test utilities
- [x] Infrastructure verification test
- [x] Documentation and examples

Phase 1 is complete and provides a solid foundation for implementing comprehensive testing in subsequent phases.
