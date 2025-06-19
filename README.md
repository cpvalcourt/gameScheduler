# Game Scheduler Application

A full-stack application for managing team sports games, series, and player attendance.

## Project Structure

```
game-scheduler/
├── backend/           # Node.js/Express API
├── frontend/         # React web application
└── mobile/          # React Native mobile application
```

## Features

- User authentication and authorization
- Team/Group management with admin roles
- Game scheduling with recurring series support
- Player attendance tracking
- Email and SMS notifications
- Calendar view for games
- Support for tournaments, leagues, and casual games
- Cross-platform (Web, iOS, Android)

## Tech Stack

- **Frontend**: React
- **Mobile**: React Native
- **Backend**: Node.js/Express
- **Database**: MySQL
- **Authentication**: JWT
- **Notifications**: Email & SMS integration

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=game_scheduler
   JWT_SECRET=your_jwt_secret
   ```

4. Run database migrations:

   ```bash
   npm run migrate
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Mobile Setup

1. Navigate to the mobile directory:

   ```bash
   cd mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. For iOS:

   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

4. For Android:
   ```bash
   npm run android
   ```

## Testing

This project includes comprehensive test suites for backend, frontend, and integration testing.

### Backend Tests

The backend uses **Jest** for unit and integration testing.

#### Prerequisites

- Make sure the backend server is running
- Ensure MySQL database is accessible

#### Running Backend Tests

Navigate to the backend directory:

```bash
cd backend
```

**Run all tests:**

```bash
npm test
```

**Run tests with coverage:**

```bash
npm run test:coverage
```

**Run tests in watch mode:**

```bash
npm run test:watch
```

#### Backend Test Categories

- **Unit Tests**: Individual functions and methods
- **Integration Tests**: API endpoints and database operations
- **Middleware Tests**: Authentication, validation, and error handling
- **Model Tests**: Database operations and data validation

#### Shell Script Tests

The backend also includes shell script tests for specific functionality:

```bash
# Test authentication endpoints
./test-auth.sh

# Test email verification
./test-email-verification.sh

# Test team management
./test-teams.sh

# Test game scheduling
./test-game-scheduling.sh
```

### Frontend Tests

The frontend uses **Vitest** for fast, modern testing.

#### Prerequisites

- Make sure the backend server is running (for integration tests)
- Ensure all frontend dependencies are installed

#### Running Frontend Tests

Navigate to the frontend directory:

```bash
cd frontend
```

**Run all tests:**

```bash
npm test
```

**Run tests with coverage:**

```bash
npm run test:coverage
```

**Run tests in watch mode:**

```bash
npm run test:watch
```

#### Frontend Test Categories

- **Component Tests**: React component rendering and interactions
- **Service Tests**: API service functions and data handling
- **Integration Tests**: End-to-end user flows
- **Context Tests**: React context providers and state management

### Integration Tests

Integration tests verify that the frontend and backend work together correctly.

#### Running Integration Tests

**Backend Integration Tests:**

```bash
cd backend
npm test -- --testPathPattern=integration
```

**Frontend Integration Tests:**

```bash
cd frontend
npm test -- --run integration
```

### Test Coverage

To generate comprehensive test coverage reports:

**Backend Coverage:**

```bash
cd backend
npm run test:coverage
```

**Frontend Coverage:**

```bash
cd frontend
npm run test:coverage
```

Coverage reports will be generated in the respective `coverage/` directories.

### Running All Tests

To run all tests across the entire project:

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```

2. **In a new terminal, run backend tests:**

   ```bash
   cd backend
   npm test
   ```

3. **In another terminal, run frontend tests:**
   ```bash
   cd frontend
   npm test
   ```

### Test Environment Setup

#### Database Setup for Tests

The backend tests use a separate test database. Ensure your `.env` file includes:

```
TEST_DB_NAME=game_scheduler_test
```

#### Environment Variables for Testing

Create a `.env.test` file in the backend directory for test-specific configurations:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=game_scheduler_test
JWT_SECRET=test_jwt_secret
```

### Troubleshooting Tests

#### Common Issues

1. **Database Connection Errors:**

   - Ensure MySQL is running
   - Check database credentials in `.env` file
   - Verify test database exists

2. **Port Conflicts:**

   - Backend tests use port 3002
   - Frontend tests use port 5173
   - Ensure these ports are available

3. **Missing Dependencies:**

   - Run `npm install` in both backend and frontend directories
   - Clear node_modules and reinstall if needed

4. **Test Timeouts:**
   - Increase timeout in test configuration if needed
   - Check for slow database queries

#### Debugging Tests

**Backend Debug Mode:**

```bash
cd backend
npm test -- --verbose --detectOpenHandles
```

**Frontend Debug Mode:**

```bash
cd frontend
npm test -- --reporter=verbose
```

## Development

- Backend API runs on port 3000
- Frontend development server runs on port 3001
- Mobile app can be run on iOS simulator or Android emulator

## License

MIT
