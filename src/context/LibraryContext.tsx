import React, { createContext, useContext, useState, useEffect } from 'react';
import { Seat, StudentProfile, RegistrationFormData, AdminUser, MembershipPlan, ActivityItem, SeatStatus } from '../types';
import { mockSeats } from '../data/mockSeats';
import { mockDefaultStudent } from '../data/mockStudents';
import { mockInitialUsers } from '../data/mockUsers';
import { mockPlans } from '../data/mockPlans';

interface LibraryContextType {
  seats: Seat[];
  users: AdminUser[];
  plans: MembershipPlan[];
  activities: ActivityItem[];
  student: StudentProfile;
  isAuthenticated: boolean;
  userRole: 'student' | 'admin' | 'guest';
  selectedSeatForBooking: Seat | null;
  setSelectedSeatForBooking: (seat: Seat | null) => void;
  login: (role: 'student' | 'admin', profileData?: any, token?: string) => void;
  logout: () => void;
  registerApplication: (formData: RegistrationFormData) => Promise<{ success: boolean; message: string }>;
  updateSeatStatus: (seatId: string, status: 'available' | 'occupied' | 'maintenance', occupant?: string) => void;
  
  // Admin Operations
  addUser: (userData: Omit<AdminUser, 'id' | 'history'>) => { success: boolean; message: string };
  editUser: (userId: string, userData: Partial<AdminUser>) => { success: boolean; message: string };
  discontinueUser: (userId: string) => { success: boolean; message: string };
  changeUserSeat: (userId: string, newSeatNumber: string) => { success: boolean; message: string };
  addSeat: (seatData: { number: string; floor: 1 | 2; section: 'A' | 'B' | 'C' | 'D'; status: SeatStatus }) => { success: boolean; message: string };
  removeSeat: (seatNumber: string) => { success: boolean; message: string };
  addPlan: (planData: Omit<MembershipPlan, 'id'>) => { success: boolean; message: string };
  editPlan: (planId: string, planData: Partial<MembershipPlan>) => { success: boolean; message: string };
  togglePlanStatus: (planId: string) => { success: boolean; message: string };

  stats: {
    totalMembers: number;
    activeMembers: number;
    discontinuedMembers: number;
    totalSeats: number;
    availableSeats: number;
    occupiedSeats: number;
    maintenanceSeats: number;
    activePlans: number;
  };
}

const initialActivities: ActivityItem[] = [];

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync seats with active users on initial load
  const [seats, setSeats] = useState<Seat[]>(() => {
    const saved = localStorage.getItem('fz_library_seats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved seats contain mock occupant names, purge old cache
        if (Array.isArray(parsed) && parsed.some((s: any) => s.occupiedBy === 'Aman Verma' || s.occupiedBy === 'Vikramaditya Sharma')) {
          localStorage.removeItem('fz_library_seats');
          return mockSeats;
        }
        return parsed;
      } catch (e) {
        return mockSeats;
      }
    }
    return mockSeats;
  });

  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('fz_library_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved users contain old mock student "usr-101", purge old cache
        if (Array.isArray(parsed) && parsed.some((u: any) => u.id === 'usr-101' || u.name === 'Vikramaditya Sharma')) {
          localStorage.removeItem('fz_library_users');
          return [];
        }
        return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [plans, setPlans] = useState<MembershipPlan[]>(() => {
    const saved = localStorage.getItem('fz_library_plans');
    return saved ? JSON.parse(saved) : mockPlans;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('fz_library_activities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((a: any) => a.id === 'act-1' || a.meta?.userName === 'Vikramaditya Sharma')) {
          localStorage.removeItem('fz_library_activities');
          return [];
        }
        return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('fz_library_student');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'std-1042' || parsed.id === 'usr-101' || parsed.name === 'Vikramaditya Sharma') {
          localStorage.removeItem('fz_library_student');
          return mockDefaultStudent;
        }
        return parsed;
      } catch (e) {
        return mockDefaultStudent;
      }
    }
    return mockDefaultStudent;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fz_library_auth') === 'true';
  });

  const [userRole, setUserRole] = useState<'student' | 'admin' | 'guest'>(() => {
    const saved = localStorage.getItem('fz_library_role');
    return (saved as 'student' | 'admin') || 'guest';
  });

  const [selectedSeatForBooking, setSelectedSeatForBooking] = useState<Seat | null>(null);

  // Fetch from MySQL Backend on mount
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [seatsRes, usersRes, plansRes, actRes] = await Promise.all([
          fetch('/api/seats'),
          fetch('/api/users'),
          fetch('/api/plans'),
          fetch('/api/activities'),
        ]);

        if (seatsRes.ok) {
          const seatsData = await seatsRes.json();
          if (Array.isArray(seatsData)) setSeats(seatsData);
        }
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (Array.isArray(usersData)) setUsers(usersData);
        }
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          if (Array.isArray(plansData) && plansData.length > 0) setPlans(plansData);
        }
        if (actRes.ok) {
          const actData = await actRes.json();
          if (Array.isArray(actData)) setActivities(actData);
        }
      } catch (err) {
        console.info('Backend API running in local fallback mode.');
      }
    };

    fetchBackendData();
  }, []);

  // Sync to local storage for offline / quick reload resilience
  useEffect(() => {
    localStorage.setItem('fz_library_seats', JSON.stringify(seats));
  }, [seats]);

  useEffect(() => {
    localStorage.setItem('fz_library_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fz_library_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('fz_library_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('fz_library_student', JSON.stringify(student));
  }, [student]);

  const login = (role: 'student' | 'admin', profileData?: any, token?: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('fz_library_auth', 'true');
    localStorage.setItem('fz_library_role', role);
    if (token) {
      localStorage.setItem('fz_library_token', token);
    }
    if (profileData && role === 'student') {
      setStudent((prev) => ({
        ...prev,
        id: profileData.id || prev.id,
        name: profileData.name || prev.name,
        email: profileData.email || prev.email,
        mobile: profileData.mobile || prev.mobile,
        assignedSeat: profileData.seat || prev.assignedSeat,
        planName: profileData.plan || prev.planName,
        planId: profileData.planId || prev.planId,
        startDate: profileData.joiningDate || prev.startDate,
        expiryDate: profileData.expiryDate || prev.expiryDate,
        membershipStatus: profileData.status === 'Active' ? 'Active' : 'Expired',
      }));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('guest');
    localStorage.removeItem('fz_library_auth');
    localStorage.removeItem('fz_library_role');
    localStorage.removeItem('fz_library_token');
  };

  const registerApplication = async (formData: RegistrationFormData): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const selectedSeatNo = formData.preferredSeat ? formData.preferredSeat.toUpperCase() : 'A04';
    
    // Check if seat exists and is available
    if (formData.preferredSeat) {
      const seatObj = seats.find((s) => s.number.toUpperCase() === selectedSeatNo);
      if (seatObj && seatObj.status !== 'available') {
        return {
          success: false,
          message: `Seat ${selectedSeatNo} is currently ${seatObj.status}. Please choose another available seat.`
        };
      }
    }

    // Update seat to occupied
    setSeats((prev) =>
      prev.map((s) => {
        if (s.number.toUpperCase() === selectedSeatNo) {
          return {
            ...s,
            status: 'occupied',
            occupiedBy: formData.fullName,
            assignedUntil: '30 Dec 2026'
          };
        }
        return s;
      })
    );

    // Create user record in Admin Users list
    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      plan: plans.find((p) => p.id === formData.planId)?.name || 'Custom Plan',
      planId: formData.planId,
      seat: selectedSeatNo,
      joiningDate: formData.startDate || new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      history: [`Joined on ${formData.startDate || 'today'} with reserved Seat ${selectedSeatNo}`]
    };

    setUsers((prev) => [newUser, ...prev]);

    // Log Activity
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'member_added',
      title: 'New Member Registered',
      timestamp: 'Just now',
      details: `${formData.fullName} enrolled (${newUser.plan}) · Seat ${selectedSeatNo}`,
      meta: { userName: formData.fullName, seatNumber: selectedSeatNo }
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Update student state for demonstration
    setStudent((prev) => ({
      ...prev,
      name: formData.fullName,
      email: formData.email,
      mobile: formData.mobile,
      dob: formData.dob,
      address: formData.address,
      assignedSeat: selectedSeatNo,
      membershipStatus: 'Active',
      startDate: formData.startDate || '03 Oct 2026'
    }));

    return {
      success: true,
      message: `Application received successfully! Your seat reservation for Seat ${selectedSeatNo} is confirmed.`
    };
  };

  const updateSeatStatus = (seatId: string, status: SeatStatus, occupant?: string) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id === seatId || s.number === seatId) {
          return {
            ...s,
            status,
            occupiedBy: status === 'occupied' ? occupant || 'Enrolled Student' : undefined
          };
        }
        return s;
      })
    );
  };

  // Admin Add User
  const addUser = (userData: Omit<AdminUser, 'id' | 'history'>): { success: boolean; message: string } => {
    // Business rule: Seat must be available if assigned
    if (userData.seat && userData.seat !== 'None' && userData.status === 'Active') {
      const targetSeat = seats.find((s) => s.number.toUpperCase() === userData.seat.toUpperCase());
      if (!targetSeat) {
        return { success: false, message: `Seat ${userData.seat} does not exist in library.` };
      }
      if (targetSeat.status !== 'available') {
        return { success: false, message: `Seat ${userData.seat} is already ${targetSeat.status} (occupied by ${targetSeat.occupiedBy || 'another student'}).` };
      }
    }

    const newId = `usr-${Date.now()}`;
    const newUser: AdminUser = {
      ...userData,
      id: newId,
      history: [
        `Created by Admin on ${new Date().toLocaleDateString('en-GB')}` +
          (userData.seat && userData.seat !== 'None' ? ` (Assigned Seat ${userData.seat})` : '')
      ]
    };

    // If seat was assigned, mark seat as occupied
    if (userData.seat && userData.seat !== 'None' && userData.status === 'Active') {
      setSeats((prev) =>
        prev.map((s) =>
          s.number.toUpperCase() === userData.seat.toUpperCase()
            ? { ...s, status: 'occupied', occupiedBy: userData.name }
            : s
        )
      );
    }

    setUsers((prev) => [newUser, ...prev]);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'member_added',
        title: 'New Member Added',
        timestamp: 'Just now',
        details: `${userData.name} added by Admin · Seat ${userData.seat || 'Unassigned'}`,
        meta: { userName: userData.name, seatNumber: userData.seat }
      },
      ...prev
    ]);

    return { success: true, message: `Member ${userData.name} added successfully.` };
  };

  // Admin Edit User
  const editUser = (userId: string, updatedData: Partial<AdminUser>): { success: boolean; message: string } => {
    const existingUser = users.find((u) => u.id === userId);
    if (!existingUser) {
      return { success: false, message: 'User not found.' };
    }

    // Check if seat changed
    const oldSeat = existingUser.seat;
    const newSeat = updatedData.seat;

    if (newSeat && newSeat !== oldSeat && newSeat !== 'None' && updatedData.status !== 'Discontinued') {
      const seatObj = seats.find((s) => s.number.toUpperCase() === newSeat.toUpperCase());
      if (seatObj && seatObj.status !== 'available') {
        return {
          success: false,
          message: `Cannot assign seat ${newSeat}. It is already ${seatObj.status}.`
        };
      }

      // Free old seat if valid
      if (oldSeat && oldSeat !== 'None') {
        setSeats((prev) =>
          prev.map((s) =>
            s.number.toUpperCase() === oldSeat.toUpperCase()
              ? { ...s, status: 'available', occupiedBy: undefined }
              : s
          )
        );
      }

      // Claim new seat
      setSeats((prev) =>
        prev.map((s) =>
          s.number.toUpperCase() === newSeat.toUpperCase()
            ? { ...s, status: 'occupied', occupiedBy: updatedData.name || existingUser.name }
            : s
        )
      );
    }

    // If updated to Discontinued
    if (updatedData.status === 'Discontinued' && existingUser.status === 'Active') {
      if (oldSeat && oldSeat !== 'None') {
        setSeats((prev) =>
          prev.map((s) =>
            s.number.toUpperCase() === oldSeat.toUpperCase()
              ? { ...s, status: 'available', occupiedBy: undefined }
              : s
          )
        );
      }
      updatedData.previousSeat = oldSeat;
      updatedData.seat = 'None';
      updatedData.discontinuedDate = new Date().toISOString().split('T')[0];
    }

    const updatedHistory = [
      ...(existingUser.history || []),
      `Profile modified by Admin on ${new Date().toLocaleDateString('en-GB')}`
    ];

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedData, history: updatedHistory } : u))
    );

    return { success: true, message: 'Member details updated successfully.' };
  };

  // Discontinue User (Business Rule #2, #6)
  const discontinueUser = (userId: string): { success: boolean; message: string } => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Member not found.' };
    }

    const releasedSeat = targetUser.seat;

    // Release assigned seat
    if (releasedSeat && releasedSeat !== 'None') {
      setSeats((prev) =>
        prev.map((s) =>
          s.number.toUpperCase() === releasedSeat.toUpperCase()
            ? { ...s, status: 'available', occupiedBy: undefined }
            : s
        )
      );
    }

    const todayDate = new Date().toLocaleDateString('en-GB');

    // Update user status
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: 'Discontinued',
              previousSeat: releasedSeat,
              seat: 'None',
              discontinuedDate: new Date().toISOString().split('T')[0],
              history: [
                ...(u.history || []),
                `Discontinued membership on ${todayDate}. Seat ${releasedSeat !== 'None' ? releasedSeat : 'N/A'} released to Available pool.`
              ]
            }
          : u
      )
    );

    // Record activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'member_discontinued',
        title: 'Member Discontinued',
        timestamp: 'Just now',
        details: `${targetUser.name} discontinued. Seat ${releasedSeat !== 'None' ? releasedSeat : 'N/A'} released.`,
        meta: { userName: targetUser.name, seatNumber: releasedSeat }
      },
      ...prev
    ]);

    return {
      success: true,
      message: `Member ${targetUser.name} discontinued. Seat ${releasedSeat !== 'None' ? releasedSeat : ''} is now available.`
    };
  };

  // Change Student Seat (Business Rule #3)
  const changeUserSeat = (userId: string, newSeatNumber: string): { success: boolean; message: string } => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Member not found.' };
    }

    const cleanNewSeat = newSeatNumber.toUpperCase();
    const newSeatObj = seats.find((s) => s.number.toUpperCase() === cleanNewSeat);
    if (!newSeatObj) {
      return { success: false, message: `Seat ${cleanNewSeat} does not exist.` };
    }

    if (newSeatObj.status !== 'available') {
      return {
        success: false,
        message: `Seat ${cleanNewSeat} cannot be assigned because it is ${newSeatObj.status}.`
      };
    }

    const oldSeatNumber = targetUser.seat;

    // Release old seat
    if (oldSeatNumber && oldSeatNumber !== 'None') {
      setSeats((prev) =>
        prev.map((s) =>
          s.number.toUpperCase() === oldSeatNumber.toUpperCase()
            ? { ...s, status: 'available', occupiedBy: undefined }
            : s
        )
      );
    }

    // Occupy new seat
    setSeats((prev) =>
      prev.map((s) =>
        s.number.toUpperCase() === cleanNewSeat
          ? { ...s, status: 'occupied', occupiedBy: targetUser.name }
          : s
      )
    );

    const todayDate = new Date().toLocaleDateString('en-GB');

    // Update user record
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              seat: cleanNewSeat,
              history: [
                ...(u.history || []),
                `Seat changed from ${oldSeatNumber !== 'None' ? oldSeatNumber : 'Unassigned'} to ${cleanNewSeat} on ${todayDate}`
              ]
            }
          : u
      )
    );

    // Record activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'seat_changed',
        title: 'Seat Reassigned',
        timestamp: 'Just now',
        details: `${targetUser.name} moved from ${oldSeatNumber} to ${cleanNewSeat}`,
        meta: { userName: targetUser.name, oldSeat: oldSeatNumber, newSeat: cleanNewSeat }
      },
      ...prev
    ]);

    return {
      success: true,
      message: `Seat successfully changed from ${oldSeatNumber} to ${cleanNewSeat} for ${targetUser.name}.`
    };
  };

  // Add Seat
  const addSeat = (seatData: {
    number: string;
    floor: 1 | 2;
    section: 'A' | 'B' | 'C' | 'D';
    status: SeatStatus;
  }): { success: boolean; message: string } => {
    const cleanNumber = seatData.number.trim().toUpperCase();
    if (!cleanNumber) {
      return { success: false, message: 'Please enter a valid seat number.' };
    }

    const exists = seats.some((s) => s.number.toUpperCase() === cleanNumber);
    if (exists) {
      return { success: false, message: `Seat ${cleanNumber} already exists in the library layout.` };
    }

    const newSeatObj: Seat = {
      id: `seat-${cleanNumber.toLowerCase()}`,
      number: cleanNumber,
      floor: seatData.floor,
      section: seatData.section,
      status: seatData.status,
      hasPowerOutlet: true,
      hasDeskLamp: true
    };

    setSeats((prev) => [...prev, newSeatObj]);
    return { success: true, message: `Seat ${cleanNumber} added successfully to Floor ${seatData.floor}, Section ${seatData.section}.` };
  };

  // Remove Seat (Business Rule #5)
  const removeSeat = (seatNumber: string): { success: boolean; message: string } => {
    const targetSeat = seats.find((s) => s.number.toUpperCase() === seatNumber.toUpperCase());
    if (!targetSeat) {
      return { success: false, message: `Seat ${seatNumber} not found.` };
    }

    // Business rule: If seat is assigned to an active student, reject
    if (targetSeat.status === 'occupied') {
      return {
        success: false,
        message: `Cannot remove Seat ${seatNumber}. It is currently assigned to ${targetSeat.occupiedBy || 'an active student'}. Please reassign or release the student's seat first.`
      };
    }

    setSeats((prev) => prev.filter((s) => s.number.toUpperCase() !== seatNumber.toUpperCase()));
    return { success: true, message: `Seat ${seatNumber} has been removed from library layout.` };
  };

  // Manage Plans: Add
  const addPlan = (planData: Omit<MembershipPlan, 'id'>): { success: boolean; message: string } => {
    const newId = `plan-${Date.now()}`;
    const newPlan: MembershipPlan = {
      ...planData,
      id: newId,
      status: planData.status || 'Active'
    };

    setPlans((prev) => [...prev, newPlan]);
    return { success: true, message: `Plan "${planData.name}" created successfully.` };
  };

  // Manage Plans: Edit
  const editPlan = (planId: string, planData: Partial<MembershipPlan>): { success: boolean; message: string } => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, ...planData } : p))
    );
    return { success: true, message: 'Plan details updated successfully.' };
  };

  // Manage Plans: Toggle Status (Business Rule #7, #8)
  const togglePlanStatus = (planId: string): { success: boolean; message: string } => {
    let nextStatus: 'Active' | 'Inactive' = 'Active';
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    return { success: true, message: `Plan status set to ${nextStatus}.` };
  };

  const stats = {
    totalMembers: users.length,
    activeMembers: users.filter((u) => u.status === 'Active').length,
    discontinuedMembers: users.filter((u) => u.status === 'Discontinued').length,
    totalSeats: seats.length,
    availableSeats: seats.filter((s) => s.status === 'available').length,
    occupiedSeats: seats.filter((s) => s.status === 'occupied').length,
    maintenanceSeats: seats.filter((s) => s.status === 'maintenance').length,
    activePlans: plans.filter((p) => p.status === 'Active').length
  };

  return (
    <LibraryContext.Provider
      value={{
        seats,
        users,
        plans,
        activities,
        student,
        isAuthenticated,
        userRole,
        selectedSeatForBooking,
        setSelectedSeatForBooking,
        login,
        logout,
        registerApplication,
        updateSeatStatus,
        addUser,
        editUser,
        discontinueUser,
        changeUserSeat,
        addSeat,
        removeSeat,
        addPlan,
        editPlan,
        togglePlanStatus,
        stats
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
