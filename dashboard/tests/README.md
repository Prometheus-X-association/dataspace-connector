# Tests Directory

This directory contains all test files for the PDC Dashboard application, organized by test type.

## Structure

```
tests/
├── api/          # API and service layer tests
│   └── api.test.ts
└── ui/           # UI component and page tests
    ├── ConfigurationTab.test.tsx
    ├── DataExchangesTab.test.tsx
    ├── Login.test.tsx
    └── ProtectedRoute.test.tsx
```

## Test Categories

### API Tests (`tests/api/`)
Tests for service layer functionality:
- Authentication (login, logout, isAuthenticated)
- Configuration management validation
- Data exchange operations validation
- Input validation and error handling

### UI Tests (`tests/ui/`)
Tests for React components and pages:
- **Login.test.tsx**: Login form, validation, authentication flow
- **ConfigurationTab.test.tsx**: Configuration editor, JSON validation, update operations
- **DataExchangesTab.test.tsx**: Data exchange listing, pagination, modal details
- **ProtectedRoute.test.tsx**: Route authentication and redirect logic

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test

# Run tests once and exit
npm test -- --run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run only API tests
npm test -- tests/api

# Run only UI tests
npm test -- tests/ui
```

## Test Stack

- **Vitest**: Test runner
- **Chai**: Assertion library
- **Sinon**: Mocking and stubbing
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: DOM matchers

## Test Patterns

### API Tests
- Focus on public methods and validation logic
- Use localStorage mock for token management
- Test error conditions and edge cases

### UI Tests
- Use React Testing Library for component testing
- Mock API calls with Sinon stubs
- Test user interactions with fireEvent
- Use waitFor for async operations
- Verify component rendering and state changes
