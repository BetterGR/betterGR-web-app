export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Announcement = {
  __typename?: 'Announcement';
  content: Scalars['String']['output'];
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Course = {
  __typename?: 'Course';
  announcements: Array<Announcement>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  grades: Array<Grade>;
  homework: Array<Homework>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  semester: Scalars['String']['output'];
  staff: Array<Staff>;
  students: Array<Student>;
  updatedAt: Scalars['String']['output'];
};

export type Grade = {
  __typename?: 'Grade';
  comments?: Maybe<Scalars['String']['output']>;
  courseId: Scalars['ID']['output'];
  gradeType: Scalars['String']['output'];
  gradeValue: Scalars['String']['output'];
  gradedAt: Scalars['String']['output'];
  gradedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  itemId: Scalars['String']['output'];
  semester: Scalars['String']['output'];
  studentId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Homework = {
  __typename?: 'Homework';
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  dueDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  workflow: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addStaffToCourse: Scalars['Boolean']['output'];
  addStudentToCourse: Scalars['Boolean']['output'];
  createAnnouncement: Announcement;
  createCourse: Course;
  createGrade: Grade;
  createHomework: Homework;
  createStaff: Staff;
  createStudent: Student;
  deleteAnnouncement: Scalars['Boolean']['output'];
  deleteCourse: Scalars['Boolean']['output'];
  deleteGrade: Scalars['Boolean']['output'];
  deleteStaff: Scalars['Boolean']['output'];
  deleteStudent: Scalars['Boolean']['output'];
  removeStaffFromCourse: Scalars['Boolean']['output'];
  removeStudentFromCourse: Scalars['Boolean']['output'];
  submitHomework: Submission;
  updateCourse: Course;
  updateGrade: Grade;
  updateStaff: Staff;
  updateStudent: Student;
};


export type MutationAddStaffToCourseArgs = {
  courseId: Scalars['ID']['input'];
  staffId: Scalars['ID']['input'];
};


export type MutationAddStudentToCourseArgs = {
  courseId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationCreateAnnouncementArgs = {
  input: NewAnnouncement;
};


export type MutationCreateCourseArgs = {
  input: NewCourse;
};


export type MutationCreateGradeArgs = {
  input: NewGrade;
};


export type MutationCreateHomeworkArgs = {
  input: NewHomework;
};


export type MutationCreateStaffArgs = {
  input: NewStaff;
};


export type MutationCreateStudentArgs = {
  input: NewStudent;
};


export type MutationDeleteAnnouncementArgs = {
  announcementId: Scalars['ID']['input'];
  courseId: Scalars['ID']['input'];
};


export type MutationDeleteCourseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGradeArgs = {
  courseId: Scalars['ID']['input'];
  gradeType: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  itemId: Scalars['String']['input'];
  semester: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationDeleteStaffArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStudentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveStaffFromCourseArgs = {
  courseId: Scalars['ID']['input'];
  staffId: Scalars['ID']['input'];
};


export type MutationRemoveStudentFromCourseArgs = {
  courseId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationSubmitHomeworkArgs = {
  homeworkId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationUpdateCourseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCourse;
};


export type MutationUpdateGradeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGrade;
};


export type MutationUpdateStaffArgs = {
  id: Scalars['ID']['input'];
  input: UpdateStaff;
};


export type MutationUpdateStudentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateStudent;
};

export type NewAnnouncement = {
  content: Scalars['String']['input'];
  courseId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

export type NewCourse = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  semester: Scalars['String']['input'];
};

export type NewGrade = {
  comments?: InputMaybe<Scalars['String']['input']>;
  courseId: Scalars['ID']['input'];
  gradeType: Scalars['String']['input'];
  gradeValue: Scalars['String']['input'];
  gradedBy?: InputMaybe<Scalars['ID']['input']>;
  itemId: Scalars['String']['input'];
  semester: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};

export type NewHomework = {
  courseId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  dueDate: Scalars['String']['input'];
  title: Scalars['String']['input'];
  workflow: Scalars['String']['input'];
};

export type NewStaff = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  office?: InputMaybe<Scalars['String']['input']>;
  phoneNumber: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type NewStudent = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  announcement?: Maybe<Announcement>;
  announcementsByCourse: Array<Announcement>;
  course?: Maybe<Course>;
  courseGrades: Array<Grade>;
  courseStaff: Array<Staff>;
  courseStudents: Array<Student>;
  grade?: Maybe<Grade>;
  grades: Array<Grade>;
  homework?: Maybe<Homework>;
  homeworkByCourse: Array<Homework>;
  staff?: Maybe<Staff>;
  staffCourses: Array<Course>;
  student?: Maybe<Student>;
  studentCourseGrades: Array<Grade>;
  studentCourses: Array<Course>;
  studentSemesterGrades: Array<Grade>;
  submission?: Maybe<Submission>;
  submissionsByStudent: Array<Submission>;
};


export type QueryAnnouncementArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAnnouncementsByCourseArgs = {
  courseId: Scalars['ID']['input'];
};


export type QueryCourseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCourseGradesArgs = {
  courseId: Scalars['ID']['input'];
  semester: Scalars['String']['input'];
};


export type QueryCourseStaffArgs = {
  courseId: Scalars['ID']['input'];
};


export type QueryCourseStudentsArgs = {
  courseId: Scalars['ID']['input'];
};


export type QueryGradeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGradesArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryHomeworkArgs = {
  id: Scalars['ID']['input'];
};


export type QueryHomeworkByCourseArgs = {
  courseId: Scalars['ID']['input'];
};


export type QueryStaffArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStaffCoursesArgs = {
  staffId: Scalars['ID']['input'];
};


export type QueryStudentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStudentCourseGradesArgs = {
  courseId: Scalars['ID']['input'];
  semester: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};


export type QueryStudentCoursesArgs = {
  studentId: Scalars['ID']['input'];
};


export type QueryStudentSemesterGradesArgs = {
  semester: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};


export type QuerySubmissionArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubmissionsByStudentArgs = {
  studentId: Scalars['ID']['input'];
};

export type Staff = {
  __typename?: 'Staff';
  courses: Array<Course>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  office?: Maybe<Scalars['String']['output']>;
  phoneNumber: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type Student = {
  __typename?: 'Student';
  courses: Array<Course>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Submission = {
  __typename?: 'Submission';
  homeworkId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  studentId: Scalars['ID']['output'];
  submittedAt: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type UpdateCourse = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  semester?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGrade = {
  comments?: InputMaybe<Scalars['String']['input']>;
  gradeValue?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStaff = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  office?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStudent = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type GetStudentQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetStudentQuery = { __typename?: 'Query', student?: { __typename?: 'Student', id: string, firstName: string, lastName: string, email: string, phoneNumber: string, createdAt: string, updatedAt: string } | null };

export type GetStaffQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetStaffQuery = { __typename?: 'Query', staff?: { __typename?: 'Staff', id: string, firstName: string, lastName: string, email: string, phoneNumber: string, title?: string | null, office?: string | null, createdAt: string, updatedAt: string } | null };

export type GetCourseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCourseQuery = { __typename?: 'Query', course?: { __typename?: 'Course', id: string, name: string, semester: string, description?: string | null, createdAt: string, updatedAt: string } | null };

export type GetCourseStudentsQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type GetCourseStudentsQuery = { __typename?: 'Query', courseStudents: Array<{ __typename?: 'Student', id: string, firstName: string, lastName: string }> };

export type GetCourseStaffQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type GetCourseStaffQuery = { __typename?: 'Query', courseStaff: Array<{ __typename?: 'Staff', id: string, firstName: string, lastName: string }> };

export type GetStudentCoursesQueryVariables = Exact<{
  studentId: Scalars['ID']['input'];
}>;


export type GetStudentCoursesQuery = { __typename?: 'Query', studentCourses: Array<{ __typename?: 'Course', id: string, name: string, semester: string, description?: string | null }> };

export type GetStaffCoursesQueryVariables = Exact<{
  staffId: Scalars['ID']['input'];
}>;


export type GetStaffCoursesQuery = { __typename?: 'Query', staffCourses: Array<{ __typename?: 'Course', id: string, name: string, semester: string }> };

export type GetGradeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGradeQuery = { __typename?: 'Query', grade?: { __typename?: 'Grade', id: string, studentId: string, courseId: string, semester: string, gradeType: string, itemId: string, gradeValue: string, gradedBy?: string | null, comments?: string | null, gradedAt: string, updatedAt: string } | null };

export type GetGradesQueryVariables = Exact<{
  studentId?: InputMaybe<Scalars['ID']['input']>;
  courseId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetGradesQuery = { __typename?: 'Query', grades: Array<{ __typename?: 'Grade', id: string, studentId: string, courseId: string, semester: string, gradeType: string, itemId: string, gradeValue: string }> };

export type GetCourseGradesQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  semester: Scalars['String']['input'];
}>;


export type GetCourseGradesQuery = { __typename?: 'Query', courseGrades: Array<{ __typename?: 'Grade', id: string, studentId: string, gradeValue: string }> };

export type GetStudentCourseGradesQueryVariables = Exact<{
  studentId: Scalars['ID']['input'];
  courseId: Scalars['ID']['input'];
  semester: Scalars['String']['input'];
}>;


export type GetStudentCourseGradesQuery = { __typename?: 'Query', studentCourseGrades: Array<{ __typename?: 'Grade', id: string, gradeType: string, gradeValue: string }> };

export type GetStudentSemesterGradesQueryVariables = Exact<{
  studentId: Scalars['ID']['input'];
  semester: Scalars['String']['input'];
}>;


export type GetStudentSemesterGradesQuery = { __typename?: 'Query', studentSemesterGrades: Array<{ __typename?: 'Grade', id: string, courseId: string, gradeValue: string }> };

export type GetHomeworkQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetHomeworkQuery = { __typename?: 'Query', homework?: { __typename?: 'Homework', id: string, courseId: string, title: string, description: string, dueDate: string } | null };

export type GetHomeworkByCourseQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type GetHomeworkByCourseQuery = { __typename?: 'Query', homeworkByCourse: Array<{ __typename?: 'Homework', id: string, title: string, dueDate: string }> };

export type GetSubmissionQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSubmissionQuery = { __typename?: 'Query', submission?: { __typename?: 'Submission', id: string, homeworkId: string, studentId: string, submittedAt: string } | null };

export type GetSubmissionsByStudentQueryVariables = Exact<{
  studentId: Scalars['ID']['input'];
}>;


export type GetSubmissionsByStudentQuery = { __typename?: 'Query', submissionsByStudent: Array<{ __typename?: 'Submission', id: string, homeworkId: string, submittedAt: string }> };

export type GetAnnouncementQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetAnnouncementQuery = { __typename?: 'Query', announcement?: { __typename?: 'Announcement', id: string, courseId: string, title: string, content: string } | null };

export type GetAnnouncementsByCourseQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type GetAnnouncementsByCourseQuery = { __typename?: 'Query', announcementsByCourse: Array<{ __typename?: 'Announcement', id: string, title: string, content: string, createdAt: string }> };

export type CreateStudentMutationVariables = Exact<{
  input: NewStudent;
}>;


export type CreateStudentMutation = { __typename?: 'Mutation', createStudent: { __typename?: 'Student', id: string, firstName: string, lastName: string, email: string, phoneNumber: string } };

export type UpdateStudentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateStudent;
}>;


export type UpdateStudentMutation = { __typename?: 'Mutation', updateStudent: { __typename?: 'Student', id: string, firstName: string, lastName: string, email: string, phoneNumber: string } };

export type DeleteStudentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteStudentMutation = { __typename?: 'Mutation', deleteStudent: boolean };

export type CreateStaffMutationVariables = Exact<{
  input: NewStaff;
}>;


export type CreateStaffMutation = { __typename?: 'Mutation', createStaff: { __typename?: 'Staff', id: string, firstName: string, lastName: string, email: string, phoneNumber: string, title?: string | null, office?: string | null } };

export type UpdateStaffMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateStaff;
}>;


export type UpdateStaffMutation = { __typename?: 'Mutation', updateStaff: { __typename?: 'Staff', id: string, firstName: string, lastName: string, email: string, phoneNumber: string, title?: string | null, office?: string | null } };

export type DeleteStaffMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteStaffMutation = { __typename?: 'Mutation', deleteStaff: boolean };

export type CreateCourseMutationVariables = Exact<{
  input: NewCourse;
}>;


export type CreateCourseMutation = { __typename?: 'Mutation', createCourse: { __typename?: 'Course', id: string, name: string, semester: string, description?: string | null } };

export type UpdateCourseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCourse;
}>;


export type UpdateCourseMutation = { __typename?: 'Mutation', updateCourse: { __typename?: 'Course', id: string, name: string, semester: string, description?: string | null } };

export type DeleteCourseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCourseMutation = { __typename?: 'Mutation', deleteCourse: boolean };

export type AddStudentToCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
}>;


export type AddStudentToCourseMutation = { __typename?: 'Mutation', addStudentToCourse: boolean };

export type RemoveStudentFromCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
}>;


export type RemoveStudentFromCourseMutation = { __typename?: 'Mutation', removeStudentFromCourse: boolean };

export type AddStaffToCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  staffId: Scalars['ID']['input'];
}>;


export type AddStaffToCourseMutation = { __typename?: 'Mutation', addStaffToCourse: boolean };

export type RemoveStaffFromCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  staffId: Scalars['ID']['input'];
}>;


export type RemoveStaffFromCourseMutation = { __typename?: 'Mutation', removeStaffFromCourse: boolean };

export type CreateGradeMutationVariables = Exact<{
  input: NewGrade;
}>;


export type CreateGradeMutation = { __typename?: 'Mutation', createGrade: { __typename?: 'Grade', id: string, studentId: string, courseId: string, semester: string, gradeType: string, itemId: string, gradeValue: string } };

export type UpdateGradeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateGrade;
}>;


export type UpdateGradeMutation = { __typename?: 'Mutation', updateGrade: { __typename?: 'Grade', id: string, gradeValue: string, comments?: string | null } };

export type DeleteGradeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  courseId: Scalars['ID']['input'];
  semester: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
  gradeType: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
}>;


export type DeleteGradeMutation = { __typename?: 'Mutation', deleteGrade: boolean };

export type CreateHomeworkMutationVariables = Exact<{
  input: NewHomework;
}>;


export type CreateHomeworkMutation = { __typename?: 'Mutation', createHomework: { __typename?: 'Homework', id: string, courseId: string, title: string, dueDate: string } };

export type SubmitHomeworkMutationVariables = Exact<{
  homeworkId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
}>;


export type SubmitHomeworkMutation = { __typename?: 'Mutation', submitHomework: { __typename?: 'Submission', id: string, submittedAt: string } };

export type CreateAnnouncementMutationVariables = Exact<{
  input: NewAnnouncement;
}>;


export type CreateAnnouncementMutation = { __typename?: 'Mutation', createAnnouncement: { __typename?: 'Announcement', id: string, courseId: string, title: string } };

export type DeleteAnnouncementMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  announcementId: Scalars['ID']['input'];
}>;


export type DeleteAnnouncementMutation = { __typename?: 'Mutation', deleteAnnouncement: boolean };
