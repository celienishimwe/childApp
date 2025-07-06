import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MAIN_GRADIENT, BUTTON_COLOR } from '../config/colors';

const { width, height } = Dimensions.get('window');

interface UserTypeSelectionProps {
  onSelectUserType: (userType: 'parent' | 'student') => void;
  onTeacherSelect?: () => void;
  onBack?: () => void;
  onParentLogin?: () => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelectUserType, onTeacherSelect, onBack, onParentLogin }) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={MAIN_GRADIENT} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
          )}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to ChildGuard</Text>
            <Text style={styles.subtitle}>Select your role to continue</Text>
          </View>
          <View style={styles.optionsContainer}>
            {/* Parent Card with Register and Login */}
            <View style={[styles.optionCard, { borderColor: '#667eea', borderWidth: 2 }]}> 
              <View style={[styles.iconContainer, { backgroundColor: '#e3eaff' }]}> 
                <Ionicons name="people" size={50} color="#667eea" />
              </View>
              <Text style={styles.optionTitle}>Parent</Text>
              <Text style={styles.optionDescription}>
                Monitor your child's progress and stay connected with their education
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: BUTTON_COLOR }]}
                  onPress={() => onSelectUserType('parent')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionButtonText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#fff', borderColor: BUTTON_COLOR, borderWidth: 1 }]}
                  onPress={onParentLogin}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.actionButtonText, { color: BUTTON_COLOR }]}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Student Card */}
            <TouchableOpacity
              style={[styles.optionCard, { borderColor: '#764ba2', borderWidth: 2 }]}
              onPress={() => onSelectUserType('student')}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#ede3ff' }]}> 
                <Ionicons name="school" size={50} color="#764ba2" />
              </View>
              <Text style={styles.optionTitle}>Student</Text>
              <Text style={styles.optionDescription}>
                Access your academic information and track your learning journey
              </Text>
            </TouchableOpacity>
            {/* Teacher Card */}
            <TouchableOpacity
              style={[styles.optionCard, { borderColor: '#b71c1c', borderWidth: 2 }]}
              onPress={onTeacherSelect}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#ffe3e3' }]}> 
                <Ionicons name="person" size={50} color="#b71c1c" />
              </View>
              <Text style={styles.optionTitle}>Teacher</Text>
              <Text style={styles.optionDescription}>
                Manage your classes, mark attendance, and interact with students
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              You can change this selection later in settings
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 6,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 10,
  },
  optionsContainer: {
    justifyContent: 'center',
    gap: 24,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 18,
    borderRadius: 16,
    padding: 12,
  },
  optionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default UserTypeSelection; 