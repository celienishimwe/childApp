<<<<<<< HEAD
# Celei - Education Management App

A React Native mobile application for education management with Firebase integration, featuring attendance tracking, user registration, and feedback systems.

## Features

### 🎯 Core Features
- **Splash Screen**: Beautiful animated welcome screen
- **User Type Selection**: Choose between Parent and Student roles
- **Registration System**: Complete registration forms for both user types
- **Thank You Screen**: Confirmation screen after successful registration
- **Dashboard**: Role-specific dashboards with quick actions
- **Attendance Tracking**: Comprehensive attendance management system
- **Feedback System**: User feedback collection with ratings

### 👥 User Types
- **Parent**: Monitor children's progress, view attendance, communicate with teachers
- **Student**: Access academic information, track attendance, view grades

### 🎨 UI/UX Features
- Modern gradient design with beautiful animations
- Responsive layout for different screen sizes
- Intuitive navigation with smooth transitions
- Professional color scheme and typography

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Firebase** for backend services
  - Firestore for data storage
  - Authentication (ready for implementation)
- **React Navigation** for screen navigation
- **Expo Linear Gradient** for beautiful UI effects
- **Expo Vector Icons** for consistent iconography

## Firebase Collections

The app uses the following Firestore collections:

### Parents
```typescript
{
  created_at: Date,
  email: string,
  name: string,
  phone: string
}
```

### Students
```typescript
{
  age: number,
  createdAt: Date,
  department_id: string,
  department_name: string,
  faculty_name: string,
  grade: string,
  has_voice_data: boolean,
  lastName: string,
  parent_id: string,
  parent_name: string,
  school_id: string,
  school_name: string,
  status: string,
  updatedAt: Date
}
```

### Schools
```typescript
{
  address: string,
  contact: string,
  name: string,
  students_count: number,
  type: string
}
```

### Departments
```typescript
{
  faculty_id: string,
  name: string
}
```

### Feedback
```typescript
{
  userId: string,
  userType: 'parent' | 'student',
  message: string,
  rating: number,
  createdAt: Date
}
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- EAS CLI (for building APK)

### 1. Clone and Install Dependencies
```bash
cd CeleiApp
npm install
```

### 2. Firebase Configuration
The Firebase configuration is already set up in `src/config/firebase.ts` with the provided credentials.

### 3. Run the App

#### Development Mode
```bash
npm start
# or
expo start
```

#### Run on Android Device/Emulator
```bash
npm run android
```

#### Run on iOS Simulator
```bash
npm run ios
```

## Building APK

### 1. Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure Build
The `eas.json` file is already configured for APK builds.

### 4. Build APK
```bash
# Build for preview (APK)
eas build --platform android --profile preview

# Build for production (APK)
eas build --platform android --profile production
```

### 5. Download APK
After the build completes, you can download the APK from the provided link or use:
```bash
eas build:list
```

## Project Structure

```
CeleiApp/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── screens/
│   │   ├── SplashScreen.tsx     # Welcome screen
│   │   ├── UserTypeSelection.tsx # Role selection
│   │   ├── Registration.tsx     # User registration
│   │   ├── ThankYou.tsx         # Success screen
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Attendance.tsx       # Attendance tracking
│   │   └── Feedback.tsx         # Feedback system
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── App.tsx                      # Main app component
├── app.json                     # Expo configuration
├── eas.json                     # EAS build configuration
└── package.json                 # Dependencies
```

## App Flow

1. **Splash Screen** → Shows for 3 seconds with animations
2. **User Type Selection** → Choose Parent or Student role
3. **Registration** → Complete registration form
4. **Thank You** → Success confirmation screen
5. **Dashboard** → Role-specific main interface
6. **Attendance** → View and track attendance records
7. **Feedback** → Submit feedback and ratings

## Features in Detail

### Attendance System
- View attendance statistics
- Track daily attendance records
- Color-coded status indicators (Present, Absent, Late)
- Attendance percentage calculation
- Detailed attendance history

### Feedback System
- 5-star rating system
- Text feedback submission
- User type identification
- Firebase integration for data storage

### Dashboard Features
- Role-specific quick actions
- Statistics overview
- Navigation to all features
- Logout functionality

## Customization

### Colors
The app uses a consistent color scheme defined in the gradient components:
- Primary: `#667eea`
- Secondary: `#764ba2`
- Success: `#4CAF50`
- Warning: `#FF9800`
- Error: `#F44336`

### Firebase Configuration
Update the Firebase configuration in `src/config/firebase.ts` with your own project credentials.

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Firebase connection issues**
   - Verify Firebase project configuration
   - Check internet connection
   - Ensure Firestore rules allow read/write

3. **Build failures**
   ```bash
   eas build --clear-cache
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

---

**Celei - Empowering Education Management** 📚✨ eas build --platform android --profile preview
=======
# childApp
Mobile App
>>>>>>> d268f94ca5fe8dc4e1fa5d5f01793208503a4274
