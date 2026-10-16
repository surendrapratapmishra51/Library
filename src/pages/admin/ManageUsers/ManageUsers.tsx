import React from 'react';
import { UserTable } from '../../../components/admin/UserTable/UserTable';

export const ManageUsers: React.FC = () => {
  return (
    <div className="space-y-6">
      <UserTable />
    </div>
  );
};
