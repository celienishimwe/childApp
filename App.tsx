import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native';
import { Button } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Teacher, RootStackParamList, DrawerParamList } from './src/types';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import UserTypeSelection from './src/screens/UserTypeSelection';
import Registration from './src/screens/Registration';
import ThankYou from './src/screens/ThankYou';
import Dashboard from './src/screens/Dashboard';
import Feedback from './src/screens/Feedback';
import Attendance from './src/screens/Attendance';
import TeacherLogin from './src/screens/TeacherLogin';
import TeacherDashboard from './src/screens/TeacherDashboard';
import TeacherAttendance from './src/screens/TeacherAttendance';
import TeacherComments from './src/screens/TeacherComments';
import TeacherProfile from './src/screens/TeacherProfile';
import ParentLogin from './src/screens/ParentLogin';
import ParentWelcome from './src/screens/ParentWelcome';

// Import Firebase config with error handling
try {
  require('./src/config/firebase');
} catch (error) {
  console.warn('Firebase config not loaded:', error);
}

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    type: 'parent' | 'student';
  } | null>(null);
  const [teacher, setTeacher] = useState<any>(null); // { email, name, ... }
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);
  const [dashboardScreen, setDashboardScreen] = useState<'dashboard' | 'attendance' | 'comments'>('dashboard');
  const [parent, setParent] = useState<any>(null);
  const [showParentLogin, setShowParentLogin] = useState(false);

  useEffect(() => {
    // Simulate splash screen loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  // Bottom tab navigator for teacher
  function TeacherTabNavigator() {
    return (
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Attendance') {
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
            } else if (route.name === 'Comments') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#b71c1c',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          children={props => <TeacherDashboard {...props} teacherEmail={teacher?.email} />}
        />
        <Tab.Screen 
          name="Attendance" 
          children={props => <TeacherAttendance {...props} teacherEmail={teacher?.email} />}
        />
        <Tab.Screen 
          name="Comments" 
          children={props => <TeacherComments {...props} teacherEmail={teacher?.email} />}
        />
        <Tab.Screen 
          name="Profile" 
          children={props => <TeacherProfile {...props} teacherEmail={teacher?.email} onLogout={() => setTeacher(null)} />}
        />
      </Tab.Navigator>
    );
  }

  if (teacher) {
    return (
      <NavigationContainer>
        <TeacherTabNavigator />
      </NavigationContainer>
    );
  }

  if (!teacher && showTeacherLogin) {
    return (
      <NavigationContainer>
        <TeacherLogin onLoginSuccess={(teacherData) => { setTeacher(teacherData); setShowTeacherLogin(false); }} onBack={() => setShowTeacherLogin(false)} />
      </NavigationContainer>
    );
  }

  if (parent) {
    return (
      <NavigationContainer>
        <ParentWelcome
          parent={parent}
          onLogout={() => { setParent(null); setShowParentLogin(false); }}
          onBack={() => setParent(null)}
        />
      </NavigationContainer>
    );
  }

  if (showParentLogin) {
    return (
      <NavigationContainer>
        <ParentLogin onLoginSuccess={setParent} onBack={() => setShowParentLogin(false)} />
      </NavigationContainer>
    );
  }

  // Handler to trigger teacher login from UserTypeSelectionScreen
  const handleShowTeacherLogin = () => setShowTeacherLogin(true);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="UserTypeSelection"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="UserTypeSelection">
          {props => <UserTypeSelectionScreen {...props} onTeacherLogin={handleShowTeacherLogin} onParentLogin={() => setShowParentLogin(true)} />}
        </Stack.Screen>
        <Stack.Screen name="Registration">
          {props => <RegistrationScreen {...props} setShowParentLogin={setShowParentLogin} setCurrentUser={setCurrentUser} />}
        </Stack.Screen>
        <Stack.Screen name="ThankYou" component={ThankYouScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Screen wrapper components to handle navigation
function UserTypeSelectionScreen({ navigation, onTeacherLogin, onParentLogin }: any) {
  const handleUserTypeSelect = (userType: 'parent' | 'student') => {
    if (userType === 'parent') {
      if (typeof onParentLogin === 'function') onParentLogin();
    } else {
      navigation.navigate('Registration', { userType });
    }
  };

  const handleTeacherSelect = () => {
    if (typeof onTeacherLogin === 'function') onTeacherLogin();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <UserTypeSelection
      onSelectUserType={handleUserTypeSelect}
      onTeacherSelect={handleTeacherSelect}
      onBack={handleBack}
    />
  );
}

function RegistrationScreen({ navigation, route, setShowParentLogin, setCurrentUser }: any) {
  const { userType } = route.params;

  const handleRegistrationComplete = () => {
    if (userType === 'parent') {
      setShowParentLogin(true);
    } else {
      // Generate a mock user ID for demo purposes
      const userId = `user_${Date.now()}`;
      setCurrentUser({ id: userId, type: userType });
      navigation.navigate('ThankYou', { userType });
    }
  };

  return (
    <Registration 
      userType={userType} 
      onRegistrationComplete={handleRegistrationComplete} 
    />
  );
}

function ThankYouScreen({ navigation, route }: any) {
  const { userType } = route.params;

  const handleContinue = () => {
    navigation.navigate('Dashboard', { userType });
  };

  return <ThankYou userType={userType} onContinue={handleContinue} />;
}

function DashboardScreen({ navigation, route }: any) {
  const { userType } = route.params;

  const handleNavigateToFeedback = () => {
    navigation.navigate('Feedback', { 
      userType,
      userId: currentUser?.id || 'demo_user_id'
    });
  };

  const handleNavigateToAttendance = () => {
    navigation.navigate('Attendance', { 
      userType,
      userId: currentUser?.id || 'demo_user_id'
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserTypeSelection' }],
    });
  };

  return (
    <Dashboard 
      userType={userType}
      onNavigateToFeedback={handleNavigateToFeedback}
      onNavigateToAttendance={handleNavigateToAttendance}
      onLogout={handleLogout}
    />
  );
}

function FeedbackScreen({ navigation, route }: any) {
  const { userType, userId } = route.params;

  const handleFeedbackSubmitted = () => {
    navigation.goBack();
  };

  return (
    <Feedback 
      userId={userId}
      userType={userType}
      onFeedbackSubmitted={handleFeedbackSubmitted}
    />
  );
}

function AttendanceScreen({ navigation, route }: any) {
  const { userType, userId } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <Attendance 
      userType={userType}
      userId={userId}
      onBack={handleBack}
    />
  );
}

// Global state management for current user
let currentUser: { id: string; type: 'parent' | 'student' } | null = null;

function setCurrentUser(user: { id: string; type: 'parent' | 'student' } | null) {
  currentUser = user;
}
