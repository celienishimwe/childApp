import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MAIN_GRADIENT, BUTTON_COLOR } from '../config/colors';

interface DashboardProps {
  userType: 'parent' | 'student';
  onNavigateToFeedback: () => void;
  onNavigateToAttendance: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userType, 
  onNavigateToFeedback, 
  onNavigateToAttendance,
  onLogout 
}) => {
  const dashboardItems = userType === 'parent' 
    ? [
        {
          title: 'My Children',
          description: 'View and manage your children\'s profiles',
          icon: 'people',
          color: BUTTON_COLOR,
          onPress: () => {},
        },
        {
          title: 'Progress Reports',
          description: 'Track academic performance and achievements',
          icon: 'analytics',
          color: BUTTON_COLOR,
          onPress: () => {},
        },
        {
          title: 'Communication',
          description: 'Connect with teachers and school staff',
          icon: 'chatbubbles',
          color: BUTTON_COLOR,
          onPress: () => {},
        },
        {
          title: 'Attendance',
          description: 'Monitor attendance and school activities',
          icon: 'calendar',
          color: BUTTON_COLOR,
          onPress: onNavigateToAttendance,
        },
      ]
    : [
        {
          title: 'My Profile',
          description: 'View and update your student information',
          icon: 'person',
          color: BUTTON_COLOR,
          onPress: () => {},
        },
        {
          title: 'Grades & Results',
          description: 'Check your academic performance',
          icon: 'school',
          color: BUTTON_COLOR,
          onPress: () => {},
        },
        {
          title: 'Assignments',
          description: 'View and submit your assignments',
          icon: 'document-text',
          color: BUTTON_COLOR,
          onPress: () => {},
        },
        {
          title: 'Attendance',
          description: 'Track your attendance record',
          icon: 'calendar',
          color: BUTTON_COLOR,
          onPress: onNavigateToAttendance,
        },
      ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={MAIN_GRADIENT}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>
              Welcome back!
            </Text>
            <Text style={styles.userTypeText}>
              {userType === 'parent' ? 'Parent Dashboard' : 'Student Dashboard'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={30} color="#4CAF50" />
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={30} color="#FF9800" />
              <Text style={styles.statNumber}>A+</Text>
              <Text style={styles.statLabel}>Average Grade</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={30} color="#2196F3" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Days This Month</Text>
            </View>
          </View>

          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Quick Actions</Text>
            {dashboardItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                activeOpacity={0.8}
                onPress={item.onPress}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={24} color="white" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={onNavigateToFeedback}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
            <Text style={styles.feedbackButtonText}>Share Feedback</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userTypeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  feedbackButton: {
    backgroundColor: BUTTON_COLOR,
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Dashboard; 