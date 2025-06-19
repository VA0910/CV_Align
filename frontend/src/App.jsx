import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import RegisterCompany from './pages/RegisterCompany';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/admin_dashboard/Dashboard';
import ManageUsers from './pages/admin_dashboard/ManageUsers';
import ManageCVs from './pages/admin_dashboard/ManageCVs';
import RecruiterDashboard from './pages/recruiter_dashboard/Dashboard';
import RecruiterManageCVs from './pages/recruiter_dashboard/ManageCVs';
import RecruiterManageCandidates from './pages/recruiter_dashboard/ManageCandidates';
import HiringManagerDashboard from './pages/hiring_manager_dashboard/Dashboard';
import HiringManagerManageCVs from './pages/hiring_manager_dashboard/ManageCVs';
import HiringManagerManageCandidates from './pages/hiring_manager_dashboard/ManageCandidates';
import ManageJobRoles from './pages/hiring_manager_dashboard/ManageJobRoles';
import CreateJobRole from './pages/hiring_manager_dashboard/CreateJobRole';
import ModifyJobRole from './pages/hiring_manager_dashboard/ModifyJobRole';
import ViewJobRole from './pages/hiring_manager_dashboard/ViewJobRole';
import ManageRecruiters from './pages/hiring_manager_dashboard/ManageRecruiters';
import Feedback from './pages/shared/Feedback';
import ViewFeedback from './pages/recruiter_dashboard/ViewFeedback';
import CompanyCode from './pages/CompanyCode';
import ContactUs from './pages/ContactUs';
import ThankYou from './pages/ThankYou';
import UploadCV from './pages/recruiter_dashboard/UploadCV';
import FinalListing from './pages/hiring_manager_dashboard/FinalListing';
import JobRoleDetails from './pages/hiring_manager_dashboard/JobRoleDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-font-body">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/register-company" element={<RegisterCompany />} />
            <Route path="/company-code" element={<CompanyCode />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/thank-you" element={<ThankYou />} />

            {/* Protected routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <HiringManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/manage/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage/cvs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageCVs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback/:candidateName"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Feedback />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Routes */}
            <Route
              path="/recruiter/manage/cvs"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <RecruiterManageCVs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/manage/candidates"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <RecruiterManageCandidates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/upload-cv"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <UploadCV />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/feedback/:candidateId"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <ViewFeedback />
                </ProtectedRoute>
              }
            />
            
            {/* Hiring Manager Routes */}
            <Route
              path="/hiring-manager/manage/cvs"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <HiringManagerManageCVs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/manage/candidates"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <HiringManagerManageCandidates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/final-listing"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <FinalListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/feedback/:candidateName"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/manage/job-roles"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <ManageJobRoles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/manage/create-job-role"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <CreateJobRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/manage/job-roles/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <ModifyJobRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/manage/job-roles/:id"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <ViewJobRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-manager/manage/recruiters"
              element={
                <ProtectedRoute allowedRoles={['hiring_manager']}>
                  <ManageRecruiters />
                </ProtectedRoute>
              }
            />
            <Route path="/hiring-manager/job-roles/:id" element={<JobRoleDetails />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
