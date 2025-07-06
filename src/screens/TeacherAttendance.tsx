import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { db } from '../config/firebase';

interface TeacherAttendanceProps {
  teacherEmail: string;
}

interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  has_voice_data: boolean;
}

type AttendanceStatus = 'present' | 'absent' | 'excused';

const TeacherAttendance: React.FC<TeacherAttendanceProps> = ({ teacherEmail }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{ [studentId: string]: AttendanceStatus }>({});
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [voiceResult, setVoiceResult] = useState<{ [studentId: string]: string }>({});

  useEffect(() => {
    if (!teacherEmail) return;
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        // 1. Get teacherId
        const teacherQ = query(collection(db, 'teachers'), where('email', '==', teacherEmail));
        const teacherSnap = await getDocs(teacherQ);
        const teacherDoc = teacherSnap.docs[0];
        if (!teacherDoc) throw new Error('Teacher not found');
        const teacherId = teacherDoc.id;
        // 2. Get assignments
        const assignQ = query(collection(db, 'course_teacher_assignments'), where('teacherId', '==', teacherId));
        const assignSnap = await getDocs(assignQ);
        const assignments: Assignment[] = assignSnap.docs.map(doc => ({
          id: doc.id,
          courseId: doc.data().courseId,
          courseName: doc.data().courseName,
          classId: doc.data().classId,
          className: doc.data().className,
        }));
        setAssignments(assignments);
      } catch (e) {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [teacherEmail]);

  useEffect(() => {
    if (!selectedAssignment) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const studentsQ = query(collection(db, 'students'), where('class_id', '==', selectedAssignment.classId));
        const studentsSnap = await getDocs(studentsQ);
        const students: Student[] = studentsSnap.docs.map(doc => ({
          id: doc.id,
          firstName: doc.data().firstName || '',
          lastName: doc.data().lastName || '',
          has_voice_data: doc.data().has_voice_data || false,
        }));
        setStudents(students);
      } catch (e) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedAssignment]);

  // Voice recording and verification (mocked for now)
  const startRecording = async (studentId: string) => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setVerifying(studentId);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async (studentId: string) => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    setRecording(null);
    setVerifying(null);
    // Here you would send the audio to your backend for verification
    // For now, we mock a successful match
    setVoiceResult(prev => ({ ...prev, [studentId]: 'matched' }));
    Alert.alert('Voice Verified', 'Voice matched with registration data.');
  };

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedAssignment) return;
    setLoading(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      for (const student of students) {
        await addDoc(collection(db, 'attendance'), {
          studentId: student.id,
          classId: selectedAssignment.classId,
          courseId: selectedAssignment.courseId,
          date: dateStr,
          status: attendance[student.id] || 'absent',
          markedAt: Timestamp.now(),
        });
      }
      Alert.alert('Success', 'Attendance saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save attendance.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, marginTop: 60 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <Text style={styles.headerSubtitle}>Record student attendance</Text>
      </View>
      <ScrollView style={styles.scrollContent}>
      {/* Assignment selection */}
      <View style={styles.assignmentPicker}>
        <Text style={styles.label}>Select Course/Class:</Text>
        {assignments.map(a => (
          <TouchableOpacity
            key={a.id}
            style={[styles.assignmentBtn, selectedAssignment?.id === a.id && styles.assignmentBtnSelected]}
            onPress={() => setSelectedAssignment(a)}
          >
            <Text style={styles.assignmentBtnText}>{a.courseName} - {a.className}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Students list */}
      {selectedAssignment && (
        <View style={styles.studentsList}>
          <Text style={styles.label}>Students:</Text>
          {students.map(student => (
            <View key={student.id} style={styles.studentCard}>
              <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
              <View style={styles.voiceRow}>
                <TouchableOpacity
                  style={[styles.voiceBtn, verifying === student.id && styles.voiceBtnActive]}
                  onPress={() => verifying === student.id ? stopRecording(student.id) : startRecording(student.id)}
                >
                  <Text style={styles.voiceBtnText}>{verifying === student.id ? 'Stop Recording' : 'Record Voice'}</Text>
                </TouchableOpacity>
                {voiceResult[student.id] === 'matched' && <Text style={styles.verifiedText}>Verified</Text>}
              </View>
              <View style={styles.statusRow}>
                {(['present', 'absent', 'excused'] as AttendanceStatus[]).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusBtn, attendance[student.id] === status && styles.statusBtnSelected]}
                    onPress={() => handleAttendanceChange(student.id, status)}
                  >
                    <Text style={styles.statusBtnText}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAttendance}>
            <Text style={styles.saveBtnText}>Save Attendance</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    backgroundColor: '#b71c1c', 
    paddingTop: 20, 
    paddingBottom: 20, 
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  headerSubtitle: { 
    color: 'rgba(255,255,255,0.9)', 
    fontSize: 16 
  },
  scrollContent: { flex: 1, padding: 16 },
  assignmentPicker: { marginBottom: 18 },
  label: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  assignmentBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ccc' },
  assignmentBtnSelected: { borderColor: '#b71c1c', backgroundColor: '#fbe9e7' },
  assignmentBtnText: { color: '#b71c1c', fontWeight: 'bold' },
  studentsList: { marginTop: 12 },
  studentCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 2 },
  studentName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  voiceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  voiceBtn: { backgroundColor: '#b71c1c', padding: 10, borderRadius: 8, marginRight: 12 },
  voiceBtnActive: { backgroundColor: '#388e3c' },
  voiceBtnText: { color: 'white', fontWeight: 'bold' },
  verifiedText: { color: '#388e3c', fontWeight: 'bold', marginLeft: 8 },
  statusRow: { flexDirection: 'row', marginTop: 8 },
  statusBtn: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  statusBtnSelected: { backgroundColor: '#b71c1c', borderColor: '#b71c1c' },
  statusBtnText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#b71c1c', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default TeacherAttendance; 