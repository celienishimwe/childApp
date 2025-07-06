import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Button,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Parent, Student, Department } from '../types';
import { MAIN_GRADIENT, BUTTON_COLOR } from '../config/colors';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import axios, { AxiosError } from 'axios';
import { Provider as PaperProvider, TextInput as PaperTextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

interface RegistrationProps {
  userType: 'parent' | 'student';
  onRegistrationComplete: () => void;
}

interface Faculty {
  id: string;
  name: string;
  description: string;
  head: string;
}

const optionList = [
  { label: 'Select Option', value: '' },
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

const Registration: React.FC<RegistrationProps> = ({ userType, onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lastName: '',
    age: '',
    facultyId: '',
    departmentId: '',
    schoolId: '',
    parentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schools, setSchools] = useState<{ id: string, name: string }[]>([]);
  const [parents, setParents] = useState<{ id: string, name: string }[]>([]);
  const [showVoice, setShowVoice] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecordings, setVoiceRecordings] = useState<string[]>([]);
  const [recordingCount, setRecordingCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showOptionDropdown, setShowOptionDropdown] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  useEffect(() => {
    if (userType === 'student') {
      fetchFaculties();
      fetchDepartments();
      fetchSchools();
      fetchParents();
    }
  }, [userType]);

  const fetchFaculties = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'faculties'));
      const facultyList: Faculty[] = [];
      querySnapshot.forEach((doc) => {
        facultyList.push({ id: doc.id, ...doc.data() } as Faculty);
      });
      setFaculties(facultyList);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'departments'));
      const deptList: Department[] = [];
      querySnapshot.forEach((doc) => {
        deptList.push({ id: doc.id, ...doc.data() } as Department);
      });
      setDepartments(deptList);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'schools'));
      const schoolList: { id: string, name: string }[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        schoolList.push({ id: doc.id, name: data.name || 'Unnamed' });
      });
      setSchools(schoolList);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchParents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'parents'));
      const parentList: { id: string, name: string }[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        parentList.push({ id: doc.id, name: data.name || 'Unnamed' });
      });
      setParents(parentList);
    } catch (error) {
      console.error('Error fetching parents:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.name) errors.push('First Name');
    // if (!formData.email) errors.push('Email');
    // if (!formData.phone) errors.push('Phone');
    if (userType === 'student') {
      if (!formData.lastName) errors.push('Last Name');
      if (!formData.age) errors.push('Age');
      if (!formData.facultyId) errors.push('Faculty');
      if (!formData.departmentId) errors.push('Department');
      if (!formData.schoolId) errors.push('School');
      if (!formData.parentId) errors.push('Parent');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Valid Email');
    }
    return errors;
  };

  const handleRegistration = async () => {
    setSubmitted(true);
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Error', 'Please fill in: ' + errors.join(', '));
      return;
    }
    setLoading(true);
    try {
      if (userType === 'parent') {
        const parentData: Omit<Parent, 'id'> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          created_at: new Date(),
        };
        await addDoc(collection(db, 'parents'), parentData);
        Alert.alert('Success', 'Registration completed successfully!', [
          { text: 'OK', onPress: onRegistrationComplete }
        ]);
      } else {
        const selectedDepartment = departments.find(d => d.id === formData.departmentId);
        const selectedFaculty = faculties.find(f => f.id === formData.facultyId);
        const selectedSchool = schools.find(s => s.id === formData.schoolId);
        // Build FormData for backend
        const form = new FormData();
        form.append('firstName', formData.name);
        form.append('lastName', formData.lastName);
        form.append('age', formData.age);
        form.append('school', formData.schoolId);
        form.append('faculty', formData.facultyId);
        form.append('department', formData.departmentId);
        form.append('parent', formData.parentId);
        // Append 5 voice samples (React Native FormData file object)
        voiceRecordings.forEach((uri, i) => {
          form.append(`voice_sample_${i}`, {
            uri: uri,
            name: `sample_${i}.wav`,
            type: 'audio/wav',
          } as any);
        });
        try {
          const apiRes = await axios.post('http://192.168.1.5:8000/api/add-student/', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 5 * 60 * 1000
          });
          if (apiRes.data && (apiRes.data.id || apiRes.data.student_id)) {
            setStudentId(apiRes.data.id || apiRes.data.student_id);
            Alert.alert('Success', 'Registration successful!', [
              { text: 'OK', onPress: onRegistrationComplete }
            ]);
          }
          setShowVoice(true);
        } catch (apiError) {
          const err = apiError as AxiosError;
          console.error('API registration error:', err);
          let errorMsg = 'Failed to register student with external API.';
          if (err.response && err.response.data) {
            if (typeof err.response.data === 'string') {
              errorMsg = err.response.data;
            } else if ((err.response.data as any).error) {
              errorMsg = (err.response.data as any).error;
            } else if ((err.response.data as any).errors) {
              errorMsg = JSON.stringify((err.response.data as any).errors);
            } else {
              errorMsg = JSON.stringify(err.response.data);
            }
          }
          Alert.alert('Error', errorMsg);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) {
      setVoiceRecordings(prev => [...prev, uri]);
      setRecordingCount(prev => prev + 1);
      if (recordingCount + 1 < 5) {
        Alert.alert('Success', `Voice recorded successfully! (${recordingCount + 1}/5)`, [
          { text: 'Record Again', onPress: () => {} }
        ]);
      } else {
        // All 5 samples recorded, move to registration form
        setStep(2);
      }
    }
  };

  // --- UI Steps ---
  const renderVoiceStep = () => (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={MAIN_GRADIENT} style={styles.gradient}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.voiceCardModern}>
            <Text style={styles.voiceTitle}>Voice Registration</Text>
            <Text style={styles.voiceSubtitle}>Please record 5 voice samples for attendance verification</Text>
            <View style={styles.voiceControlsRowModern}>
              <TouchableOpacity
                style={[styles.voiceBtnModern, isRecording ? styles.voiceBtnDisabled : styles.voiceBtnActive]}
                onPress={isRecording ? undefined : startRecording}
                disabled={isRecording}
              >
                <Ionicons name="mic" size={20} color="white" />
                <Text style={styles.voiceBtnText}>Start Recording</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.voiceBtnModern, !isRecording ? styles.voiceBtnDisabled : styles.voiceBtnStop]}
                onPress={isRecording ? stopRecording : undefined}
                disabled={!isRecording}
              >
                <Ionicons name="stop" size={20} color="white" />
                <Text style={styles.voiceBtnText}>Stop Recording</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.voiceSamplesTitle}>Recorded Samples</Text>
            <View style={styles.samplesList}>
              {voiceRecordings.map((uri, idx) => (
                <View key={idx} style={styles.sampleItem}>
                  <Text style={styles.sampleLabel}>Sample {idx + 1}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.voiceCountText}>{recordingCount}/5 samples recorded</Text>
            {recordingCount >= 5 && (
              <TouchableOpacity style={[styles.saveButton, { marginTop: 16 }]} onPress={() => setStep(2)}>
                <Text style={styles.saveButtonText}>Continue to Registration</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );

  const filteredDepartments = formData.facultyId
    ? departments.filter(d => d.faculty_id === formData.facultyId)
    : departments;

  const renderRegistrationStep = () => (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={MAIN_GRADIENT} style={styles.gradient}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.formCardModern}>
              <Text style={styles.formTitle}>Student Registration</Text>
              {/* Step 1: Basic Info */}
              <View style={styles.rowGroup}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>First Name *</Text>
                  <PaperTextInput
                    mode="outlined"
                    value={formData.name}
                    onChangeText={value => handleInputChange('name', value)}
                    placeholder="First Name"
                    placeholderTextColor="#999"
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Last Name *</Text>
                  <PaperTextInput
                    mode="outlined"
                    value={formData.lastName}
                    onChangeText={value => handleInputChange('lastName', value)}
                    placeholder="Last Name"
                    placeholderTextColor="#999"
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={styles.rowGroup}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Age *</Text>
                  <PaperTextInput
                    mode="outlined"
                    value={formData.age}
                    onChangeText={value => handleInputChange('age', value)}
                    placeholder="Age"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Parent *</Text>
                  <Dropdown
                    label={parents.find(p => p.id === formData.parentId)?.name || 'Select Parent'}
                    mode="outlined"
                    value={formData.parentId}
                    onSelect={(value?: string) => handleInputChange('parentId', value || '')}
                    options={parents.map(p => ({ label: p.name, value: p.id }))}
                  />
                </View>
              </View>
              <View style={styles.rowGroup}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>School *</Text>
                  <Dropdown
                    label={schools.find(s => s.id === formData.schoolId)?.name || 'Select School'}
                    mode="outlined"
                    value={formData.schoolId}
                    onSelect={(value?: string) => handleInputChange('schoolId', value || '')}
                    options={schools.map(s => ({ label: s.name, value: s.id }))}
                  />
                </View>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Faculty *</Text>
                  <Dropdown
                    label={faculties.find(f => f.id === formData.facultyId)?.name || 'Select Faculty'}
                    mode="outlined"
                    value={formData.facultyId}
                    onSelect={(value?: string) => handleInputChange('facultyId', value || '')}
                    options={faculties.map(f => ({ label: f.name, value: f.id }))}
                  />
                </View>
              </View>
              <View style={styles.rowGroup}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Department *</Text>
                  <Dropdown
                    label={filteredDepartments.find(d => d.id === formData.departmentId)?.name || 'Select Department'}
                    mode="outlined"
                    value={formData.departmentId}
                    onSelect={(value?: string) => handleInputChange('departmentId', value || '')}
                    options={filteredDepartments.map(d => ({ label: d.name, value: d.id as string }))}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 24 }}>
                <TouchableOpacity style={[styles.saveButton, { flex: 1, marginRight: 8 }]} onPress={() => setStep(1)}>
                  <Text style={styles.saveButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { flex: 1, marginLeft: 8 }]} onPress={handleRegistration} disabled={loading}>
                  <Ionicons name="save" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.saveButtonText}>{loading ? 'Registering...' : 'Register'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </PaperProvider>
  );

  // --- Main Render ---
  if (userType === 'student') {
    if (step === 1) {
      return renderVoiceStep();
    } else {
      return renderRegistrationStep();
    }
  }
  // ... existing code for parent registration ...

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={MAIN_GRADIENT} style={styles.gradient}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.formCardModern}>
              <Text style={styles.formTitle}>Student Registration</Text>
              {step === 1 && renderVoiceStep()}
              {step === 2 && renderRegistrationStep()}
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  registerButton: {
    backgroundColor: BUTTON_COLOR,
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
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
  formCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 60,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  rowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  inputGroupHalf: {
    width: '48%',
  },
  inputGroupThird: {
    width: '32%',
  },
  inputGroupFull: {
    width: '100%',
  },
  saveButton: {
    backgroundColor: BUTTON_COLOR,
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  voiceCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  voiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  voiceSubtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
  },
  voiceControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 12,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BUTTON_COLOR,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    opacity: 1,
  },
  voiceBtnActive: {
    backgroundColor: BUTTON_COLOR,
    opacity: 1,
  },
  voiceBtnStop: {
    backgroundColor: '#b71c1c',
    opacity: 1,
  },
  voiceBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  voiceBtnText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  voiceSamplesTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
    color: '#333',
  },
  samplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  sampleItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  sampleLabel: {
    color: '#333',
    fontSize: 14,
  },
  voiceCountText: {
    color: BUTTON_COLOR,
    fontWeight: 'bold',
    marginTop: 8,
  },
  formCardSmall: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 18,
    width: '95%',
    alignSelf: 'center',
  },
  registerBtnWrapper: {
    marginTop: 18,
    alignItems: 'center',
  },
  formCardModern: {
    width: '95%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 16,
    padding: 24,
    marginVertical: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  voiceCardModern: {
    width: '95%',
    maxWidth: 420,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    marginVertical: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  voiceControlsRowModern: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  voiceBtnModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginHorizontal: 6,
  },
});

export default Registration; 