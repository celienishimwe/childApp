import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface TeacherDashboardProps {
  teacherEmail: string;
}

interface Assignment {
  id: string;
  courseName: string;
  className: string;
  levelName: string;
  departmentName: string;
  facultyName: string;
  status: string;
  assignedAt: Timestamp;
}

interface AttendanceStats {
  present: number;
  absent: number;
  excused: number;
  total: number;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacherEmail }) => {
  const [teacherName, setTeacherName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [todayStats, setTodayStats] = useState<AttendanceStats | null>(null);
  const [weekStats, setWeekStats] = useState<AttendanceStats | null>(null);
  const [monthStats, setMonthStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherEmail) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get teacher info
        const teacherQ = query(collection(db, 'teachers'), where('email', '==', teacherEmail));
        const teacherSnap = await getDocs(teacherQ);
        const teacherDoc = teacherSnap.docs[0];
        if (!teacherDoc) throw new Error('Teacher not found');
        setTeacherName(teacherDoc.data().name || '');
        const teacherId = teacherDoc.id;

        // 2. Get assignments
        const assignQ = query(collection(db, 'course_teacher_assignments'), where('teacherId', '==', teacherId));
        const assignSnap = await getDocs(assignQ);
        const assignments: Assignment[] = assignSnap.docs.map(doc => ({
          id: doc.id,
          courseName: doc.data().courseName || '',
          className: doc.data().className || '',
          levelName: doc.data().levelName || '',
          departmentName: doc.data().departmentName || '',
          facultyName: doc.data().facultyName || '',
          status: doc.data().status || '',
          assignedAt: doc.data().assignedAt,
        }));
        setAssignments(assignments);
        const classIds = assignments.map(a => a.id).filter(Boolean);

        // 3. Attendance stats
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().slice(0, 10);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().slice(0, 10);

        async function getStats(start: string, end?: string): Promise<AttendanceStats> {
          let attQ = query(collection(db, 'attendance'), where('classId', 'in', classIds));
          if (end) {
            attQ = query(attQ, where('date', '>=', start), where('date', '<=', end));
          } else {
            attQ = query(attQ, where('date', '==', start));
          }
          const attSnap = await getDocs(attQ);
          const stats: AttendanceStats = { present: 0, absent: 0, excused: 0, total: 0 };
          attSnap.forEach(doc => {
            const status = (doc.data().status || '').toLowerCase();
            if (status in stats) stats[status as keyof AttendanceStats]++;
            stats.total++;
          });
          return stats;
        }
        setTodayStats(await getStats(todayStr));
        setWeekStats(await getStats(weekStartStr, todayStr));
        setMonthStats(await getStats(monthStartStr, todayStr));
      } catch (e) {
        setTeacherName('');
        setAssignments([]);
        setTodayStats(null);
        setWeekStats(null);
        setMonthStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherEmail]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, marginTop: 60 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back, {teacherName}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Today's Overview</Text>
          <Text style={styles.welcomeSubtitle}>Your attendance records</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: '#b71c1c' }]}> 
            <Text style={styles.statTitle}>Today's Attendance</Text>
            <Text style={styles.statValue}>{todayStats?.present || 0}/{todayStats?.total || 0}</Text>
            <Text style={styles.statDetail}>Present: {todayStats?.present || 0} Absent: {todayStats?.absent || 0} Excused: {todayStats?.excused || 0}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#1976d2' }]}> 
            <Text style={styles.statTitle}>This Week's Attendance</Text>
            <Text style={styles.statValue}>{weekStats?.present || 0}/{weekStats?.total || 0}</Text>
            <Text style={styles.statDetail}>Present: {weekStats?.present || 0} Absent: {weekStats?.absent || 0} Excused: {weekStats?.excused || 0}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#388e3c' }]}> 
            <Text style={styles.statTitle}>This Month's Attendance</Text>
            <Text style={styles.statValue}>{monthStats?.present || 0}/{monthStats?.total || 0}</Text>
            <Text style={styles.statDetail}>Present: {monthStats?.present || 0} Absent: {monthStats?.absent || 0} Excused: {monthStats?.excused || 0}</Text>
          </View>
        </View>
        <View style={styles.coursesCard}>
          <Text style={styles.coursesTitle}>Assigned Courses</Text>
          <View style={styles.coursesTableHeader}>
            <Text style={styles.tableHeaderCell}>Course Name</Text>
            <Text style={styles.tableHeaderCell}>Class</Text>
            <Text style={styles.tableHeaderCell}>Level</Text>
            <Text style={styles.tableHeaderCell}>Department</Text>
            <Text style={styles.tableHeaderCell}>Faculty</Text>
            <Text style={styles.tableHeaderCell}>Status</Text>
            <Text style={styles.tableHeaderCell}>Assigned At</Text>
          </View>
          {assignments.map(a => (
            <View key={a.id} style={styles.coursesTableRow}>
              <Text style={styles.tableCell}>{a.courseName}</Text>
              <Text style={styles.tableCell}>{a.className}</Text>
              <Text style={styles.tableCell}>{a.levelName}</Text>
              <Text style={styles.tableCell}>{a.departmentName}</Text>
              <Text style={styles.tableCell}>{a.facultyName}</Text>
              <Text style={styles.tableCell}>{a.status}</Text>
              <Text style={styles.tableCell}>{a.assignedAt?.toDate ? a.assignedAt.toDate().toLocaleString() : ''}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  welcomeCard: { backgroundColor: '#b71c1c', borderRadius: 16, padding: 24, marginBottom: 24 },
  welcomeTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  welcomeSubtitle: { color: 'white', fontSize: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 18, marginHorizontal: 6, borderWidth: 2, alignItems: 'center', elevation: 2 },
  statTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#b71c1c', marginBottom: 4 },
  statDetail: { fontSize: 13, color: '#333' },
  coursesCard: { backgroundColor: 'white', borderRadius: 16, padding: 18, elevation: 2 },
  coursesTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 12 },
  coursesTableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 6, marginBottom: 6 },
  tableHeaderCell: { flex: 1, fontWeight: 'bold', color: '#b71c1c', fontSize: 13 },
  coursesTableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  tableCell: { flex: 1, fontSize: 13, color: '#333' },
});

export default TeacherDashboard; 