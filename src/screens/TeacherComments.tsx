import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface TeacherCommentsProps {
  teacherEmail: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  parent_id: string;
}

interface Course {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  comment: string;
  course_id: string;
  student_id: string;
  receiver_id: string;
  sender_id: string;
  timestamp: Timestamp;
  read: boolean;
  type: string;
}

const TeacherComments: React.FC<TeacherCommentsProps> = ({ teacherEmail }) => {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [commentText, setCommentText] = useState('');
  const [sentComments, setSentComments] = useState<Comment[]>([]);
  const [receivedComments, setReceivedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherEmail) return;
    const fetchTeacherId = async () => {
      setLoading(true);
      try {
        const teacherQ = query(collection(db, 'teachers'), where('email', '==', teacherEmail));
        const teacherSnap = await getDocs(teacherQ);
        const teacherDoc = teacherSnap.docs[0];
        if (!teacherDoc) throw new Error('Teacher not found');
        setTeacherId(teacherDoc.id);
      } catch (e) {
        setTeacherId(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherId();
  }, [teacherEmail]);

  useEffect(() => {
    if (!teacherId) return;
    const fetchStudentsAndCourses = async () => {
      setLoading(true);
      try {
        // Get assignments for teacher
        const assignQ = query(collection(db, 'course_teacher_assignments'), where('teacherId', '==', teacherId));
        const assignSnap = await getDocs(assignQ);
        const classIds = Array.from(new Set(assignSnap.docs.map(doc => doc.data().classId)));
        const courseIds = Array.from(new Set(assignSnap.docs.map(doc => doc.data().courseId)));
        // Fetch students in those classes
        let students: Student[] = [];
        for (const classId of classIds) {
          const studentsQ = query(collection(db, 'students'), where('class_id', '==', classId));
          const studentsSnap = await getDocs(studentsQ);
          students = students.concat(studentsSnap.docs.map(doc => ({
            id: doc.id,
            firstName: doc.data().firstName || '',
            lastName: doc.data().lastName || '',
            parent_id: doc.data().parent_id || '',
          })));
        }
        setStudents(students);
        // Fetch courses
        let courses: Course[] = [];
        for (const courseId of courseIds) {
          const courseDoc = await getDocs(query(collection(db, 'courses'), where('__name__', '==', courseId)));
          courseDoc.forEach(doc => {
            courses.push({ id: doc.id, name: doc.data().name || '' });
          });
        }
        setCourses(courses);
      } catch (e) {
        setStudents([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentsAndCourses();
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    const fetchComments = async () => {
      setLoading(true);
      try {
        // Sent comments
        const sentQ = query(collection(db, 'comments'), where('sender_id', '==', teacherId), where('type', '==', 't'));
        const sentSnap = await getDocs(sentQ);
        setSentComments(sentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
        // Received comments
        const receivedQ = query(collection(db, 'comments'), where('receiver_id', '==', teacherId), where('type', '==', 'p'));
        const receivedSnap = await getDocs(receivedQ);
        setReceivedComments(receivedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      } catch (e) {
        setSentComments([]);
        setReceivedComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [teacherId]);

  const handleSendComment = async () => {
    if (!teacherId || !selectedStudent || !selectedCourse || !commentText.trim()) {
      Alert.alert('Error', 'Please select student, course, and enter a comment.');
      return;
    }
    setLoading(true);
    try {
      // Get parent_id for student
      const student = students.find(s => s.id === selectedStudent);
      if (!student) throw new Error('Student not found');
      const parent_id = student.parent_id;
      if (!parent_id) throw new Error('No parent assigned to this student.');
      await addDoc(collection(db, 'comments'), {
        comment: commentText.trim(),
        course_id: selectedCourse,
        student_id: selectedStudent,
        receiver_id: parent_id,
        sender_id: teacherId,
        timestamp: Timestamp.now(),
        read: false,
        type: 't',
      });
      setCommentText('');
      Alert.alert('Success', 'Comment sent successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to send comment.');
    } finally {
      setLoading(false);
    }
  };

  const markCommentRead = async (commentId: string) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), { read: true });
      setReceivedComments(prev => prev.map(c => c.id === commentId ? { ...c, read: true } : c));
    } catch (e) {
      // ignore
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, marginTop: 60 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comments</Text>
        <Text style={styles.headerSubtitle}>Communicate with parents</Text>
      </View>
      <ScrollView style={styles.scrollContent}>
      <View style={styles.formCard}>
        <Text style={styles.label}>Send Comment to Parent</Text>
        <Text style={styles.inputLabel}>Student:</Text>
        <View style={styles.dropdownRow}>
          {students.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.dropdownBtn, selectedStudent === s.id && styles.dropdownBtnSelected]}
              onPress={() => setSelectedStudent(s.id)}
            >
              <Text style={styles.dropdownBtnText}>{s.firstName} {s.lastName}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.inputLabel}>Course:</Text>
        <View style={styles.dropdownRow}>
          {courses.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.dropdownBtn, selectedCourse === c.id && styles.dropdownBtnSelected]}
              onPress={() => setSelectedCourse(c.id)}
            >
              <Text style={styles.dropdownBtnText}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Type your comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendComment}>
          <Text style={styles.sendBtnText}>Send Comment</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Sent Comments</Text>
        {sentComments.length === 0 ? <Text>No sent comments.</Text> : sentComments.map(c => (
          <View key={c.id} style={styles.commentBox}>
            <Text style={styles.commentText}>{c.comment}</Text>
            <Text style={styles.commentMeta}>Course: {c.course_id} | Student: {c.student_id}</Text>
            <Text style={styles.commentMeta}>Sent: {c.timestamp?.toDate ? c.timestamp.toDate().toLocaleString() : ''}</Text>
          </View>
        ))}
        <Text style={styles.sectionTitle}>Received Comments</Text>
        {receivedComments.length === 0 ? <Text>No received comments.</Text> : receivedComments.map(c => (
          <View key={c.id} style={styles.commentBox}>
            <Text style={styles.commentText}>{c.comment}</Text>
            <Text style={styles.commentMeta}>Course: {c.course_id} | Student: {c.student_id}</Text>
            <Text style={styles.commentMeta}>Received: {c.timestamp?.toDate ? c.timestamp.toDate().toLocaleString() : ''}</Text>
            {!c.read && <TouchableOpacity onPress={() => markCommentRead(c.id)}><Text style={styles.markRead}>Mark as Read</Text></TouchableOpacity>}
          </View>
        ))}
      </View>
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
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 24, elevation: 2 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  inputLabel: { fontSize: 14, color: '#333', marginTop: 8, marginBottom: 4 },
  dropdownRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  dropdownBtn: { backgroundColor: '#eee', borderRadius: 8, padding: 8, marginRight: 8, marginBottom: 8 },
  dropdownBtnSelected: { backgroundColor: '#b71c1c' },
  dropdownBtnText: { color: '#333', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 16, backgroundColor: '#f8f9fa' },
  sendBtn: { backgroundColor: '#b71c1c', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  sendBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  commentsSection: { marginTop: 18 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 12, marginBottom: 8 },
  commentBox: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, elevation: 1 },
  commentText: { fontSize: 16 },
  commentMeta: { fontSize: 12, color: '#888', marginTop: 4 },
  markRead: { color: '#388e3c', fontWeight: 'bold', marginTop: 4 },
});

export default TeacherComments; 