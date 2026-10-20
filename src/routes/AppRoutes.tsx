import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { HomePage } from '../pages/Home/HomePage';
import { FacilitiesPage } from '../pages/Facilities/FacilitiesPage';
import { MembershipPage } from '../pages/Membership/MembershipPage';
import { SeatsPage } from '../pages/Seats/SeatsPage';
import { RegistrationPage } from '../pages/Registration/RegistrationPage';
import { LoginPage } from '../pages/Login/LoginPage';
import { StudentDashboardPage } from '../pages/StudentDashboard/StudentDashboardPage';
import { AboutPage } from '../pages/About/AboutPage';
import { ContactPage } from '../pages/Contact/ContactPage';

// Admin Panel Layout & Pages
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminDashboard } from '../pages/admin/Dashboard/AdminDashboard';
import { ManageUsers } from '../pages/admin/ManageUsers/ManageUsers';
import { ManageSeatsPlans } from '../pages/admin/ManageSeatsPlans/ManageSeatsPlans';
import { ManageFloors } from '../pages/admin/ManageFloors/ManageFloors';
import { ManageFees } from '../pages/admin/ManageFees/ManageFees';
import { ManageAdmissions } from '../pages/admin/ManageAdmissions/ManageAdmissions';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Facing Application Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/plans" element={<MembershipPage />} />
        <Route path="/seats" element={<SeatsPage />} />
        <Route path="/join" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<StudentDashboardPage />} />
      </Route>

      {/* Admin Panel Routes with Left Sidebar */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="admissions" element={<ManageAdmissions />} />
        <Route path="fees" element={<ManageFees />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="floors" element={<ManageFloors />} />
        <Route path="seats-plans" element={<ManageSeatsPlans />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
