import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { MAIN_GRADIENT } from '../config/colors';

interface AttendanceProps {
  userType: 'parent' | 'student';
  userId: string;
  onBack: () => void;
}

interface AttendanceRecord {
  id?: string;
  userId: string;
  userType: 'parent' | 'student';
  date: Date;
  status: 'present' | 'absent' | 'late';
  subject?: string;
  notes?: string;
}

const Attendance: React.FC<AttendanceProps> = ({ userType, userId, onBack }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const loadAttendanceRecords = async () => {
    try {
      // For demo purposes, we'll create mock attendance data
      const mockRecords: AttendanceRecord[] = [
        {
          userId,
          userType,
          date: new Date(2024, 0, 15),
          status: 'present',
          subject: 'Mathematics',
          notes: 'On time',
        },
        {
          userId,
          userType,
          date: new Date(2024, 0, 16),
          status: 'present',
          subject: 'Science',
          notes: 'On time',
        },
        {
          userId,
          userType,
          date: new Date(2024, 0, 17),
          status: 'late',
          subject: 'English',
          notes: 'Arrived 10 minutes late',
        },
        {
          userId,
          userType,
          date: new Date(2024, 0, 18),
          status: 'present',
          subject: 'History',
          notes: 'On time',
        },
        {
          userId,
          userType,
          date: new Date(2024, 0, 19),
          status: 'absent',
          subject: 'Physical Education',
          notes: 'Sick leave',
        },
      ];

      setAttendanceRecords(mockRecords);
    } catch (error) {
      console.error('Error loading attendance records:', error);
      Alert.alert('Error', 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#F44336';
      case 'late':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return 'checkmark-circle';
      case 'absent':
        return 'close-circle';
      case 'late':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const calculateAttendancePercentage = () => {
    if (attendanceRecords.length === 0) return 0;
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    return Math.round((presentDays / attendanceRecords.length) * 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={MAIN_GRADIENT}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{attendanceRecords.length}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{calculateAttendancePercentage()}%</Text>
              <Text style={styles.statLabel}>Attendance Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {attendanceRecords.filter(r => r.status === 'present').length}
              </Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
          </View>

          <View style={styles.recordsContainer}>
            <Text style={styles.sectionTitle}>Recent Attendance</Text>
            {attendanceRecords.map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                    <Text style={styles.subjectText}>{record.subject}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Ionicons
                      name={getStatusIcon(record.status)}
                      size={24}
                      color={getStatusColor(record.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                      {record.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {record.notes && (
                  <Text style={styles.notesText}>{record.notes}</Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.legendText}>Present</Text>
              </View>
              <View style={styles.legendItem}>
                <Ionicons name="time" size={20} color="#FF9800" />
                <Text style={styles.legendText}>Late</Text>
              </View>
              <View style={styles.legendItem}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.legendText}>Absent</Text>
              </View>
            </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 44,
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
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  recordsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subjectText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
});

export default Attendance; 