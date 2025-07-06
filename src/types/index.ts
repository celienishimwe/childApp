export interface Parent {
  id?: string;
  created_at: Date;
  email: string;
  name: string;
  phone: string;
}
export interface Student {
  id?: string;
  age: number;
  createdAt: Date;
  department_id: string;
  department_name: string;
  faculty_name?: string;
  grade?: string;
  status?: string;
  has_voice_data: boolean;
  lastName: string;
  parent_id: string;
  parent_name: string;
  school_id: string;
  school_name: string;
  updatedAt: Date;
}
export interface School {
  id?: string;
  address: string;
  contact: string;
  name: string;
  students_count: number;
  type: string;
}
export interface Department {
  id?: string;
  faculty_id: string;
  name: string;
}
export interface Feedback {
  id?: string;
  userId: string;
  userType: 'parent' | 'student';
  message: string;
  rating: number;
  createdAt: Date;
}

export interface Teacher {
  id: string;
  email: string;
  name: string;
}

export type RootStackParamList = {
  UserTypeSelection: undefined;
  Registration: { userType: 'parent' | 'student' };
  ThankYou: { userType: 'parent' | 'student' };
  Dashboard: { userType: 'parent' | 'student' };
  Feedback: { userType: 'parent' | 'student'; userId: string };
  Attendance: { userType: 'parent' | 'student'; userId: string };
};

export type DrawerParamList = {
  TeacherDashboard: undefined;
  MarkAttendance: undefined;
  Comments: undefined;
}; 