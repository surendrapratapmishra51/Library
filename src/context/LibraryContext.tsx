import React, { createContext, useContext, useState, useEffect } from 'react';
import { Seat, StudentProfile, RegistrationFormData, AdminUser, MembershipPlan, ActivityItem, SeatStatus } from '../types';
import { mockSeats } from '../data/mockSeats';
import { mockDefaultStudent } from '../data/mockStudents';
import { mockInitialUsers } from '../data/mockUsers';
import { mockPlans } from '../data/mockPlans';
import { Floor, FloorStats } from '../types';
import { userApi, seatApi, planApi, activityApi, authApi, floorApi, BulkAddSeatsResponse } from '../services';
import { calculateExpiryDate, getTodayDateString } from '../utils/dateUtils';

interface LibraryContextType {
  seats: Seat[];
  floors: Floor[];
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
  
  // Floor Management
  refreshFloors: () => Promise<void>;
  addFloor: (floorData: { name: string; description?: string; status?: 'Active' | 'Inactive'; floorNumber?: number | null; sortOrder?: number }) => Promise<{ success: boolean; message: string; floor?: Floor }>;
  editFloor: (floorId: string, floorData: { name?: string; description?: string; status?: 'Active' | 'Inactive'; floorNumber?: number | null; sortOrder?: number }) => Promise<{ success: boolean; message: string; warning?: string | null; floor?: Floor }>;
  deleteFloor: (floorId: string) => Promise<{ success: boolean; message: string }>;
  toggleFloorStatus: (floorId: string) => Promise<{ success: boolean; message: string; warning?: string | null }>;

  // Seat Management
  refreshSeats: () => Promise<void>;
  addSeat: (seatData: { number: string; floorId?: string | null; description?: string; status?: SeatStatus }) => Promise<{ success: boolean; message: string; seat?: Seat }>;
  bulkAddSeats: (payload: { count: number; prefix?: string; startNumber: number; floorId?: string | null; description?: string }) => Promise<BulkAddSeatsResponse>;
  transferSeat: (userId: string, newSeatNumber: string) => Promise<{ success: boolean; message: string; seat?: string }>;
  releaseSeat: (payload: { userId?: string; seatNumber?: string }) => Promise<{ success: boolean; message: string }>;
  removeSeat: (seatNumber: string) => { success: boolean; message: string };

  // Admin Operations
  addUser: (userData: Omit<AdminUser, 'id' | 'history'>) => Promise<{ success: boolean; message: string; user?: AdminUser }>;
  editUser: (userId: string, userData: Partial<AdminUser>) => Promise<{ success: boolean; message: string }>;
  discontinueUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  changeUserSeat: (userId: string, newSeatNumber: string) => Promise<{ success: boolean; message: string }>;
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

  const [floors, setFloors] = useState<Floor[]>([]);

  const refreshFloors = async () => {
    try {
      const res = await floorApi.getFloors();
      if (res && Array.isArray(res.floors)) {
        setFloors(res.floors);
      }
    } catch (err: any) {
      console.info('[floorApi.getFloors]', err.message);
    }
  };

  const refreshSeats = async () => {
    try {
      const res = await seatApi.getSeats();
      if (Array.isArray(res)) {
        setSeats(res);
      }
    } catch (err: any) {
      console.info('[seatApi.getSeats]', err.message);
    }
  };

  // Fetch from MySQL Backend on mount using centralized services
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [seatsResult, usersResult, plansResult, actResult, floorsResult] = await Promise.allSettled([
          seatApi.getSeats(),
          userApi.getUsers(),
          planApi.getPlans(),
          activityApi.getActivities(),
          floorApi.getFloors(),
        ]);

        if (seatsResult.status === 'fulfilled' && Array.isArray(seatsResult.value)) {
          setSeats(seatsResult.value);
        }
        if (usersResult.status === 'fulfilled' && Array.isArray(usersResult.value)) {
          setUsers(usersResult.value);
        }
        if (plansResult.status === 'fulfilled' && Array.isArray(plansResult.value) && plansResult.value.length > 0) {
          setPlans(plansResult.value);
        }
        if (actResult.status === 'fulfilled' && Array.isArray(actResult.value)) {
          setActivities(actResult.value);
        }
        if (floorsResult.status === 'fulfilled' && floorsResult.value && Array.isArray(floorsResult.value.floors)) {
          setFloors(floorsResult.value.floors);
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
    authApi.logout();
    setIsAuthenticated(false);
    setUserRole('guest');
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

    const chosenPlan = plans.find((p) => p.id === formData.planId);
    const startDate = formData.startDate || getTodayDateString();
    const expiryDate = calculateExpiryDate(startDate, chosenPlan);

    // Create user record in Admin Users list
    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      plan: chosenPlan?.name || 'Custom Plan',
      planId: formData.planId,
      seat: selectedSeatNo,
      joiningDate: startDate,
      expiryDate,
      status: 'Active',
      history: [`Joined on ${startDate} with reserved Seat ${selectedSeatNo}`]
    };

    setUsers((prev) => [newUser, ...prev]);

    // Persist to backend database via userApi
    userApi.createUser({
      name: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      plan: chosenPlan?.name || 'Custom Plan',
      planId: formData.planId,
      seat: selectedSeatNo,
      joiningDate: startDate,
      expiryDate,
      status: 'Active',
      role: 'student',
    }).catch((err) => console.info('[userApi.createUser registration]', err.message));

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

    // Sync to backend via seatApi
    seatApi.updateSeat(seatId, {
      status,
      occupiedBy: status === 'occupied' ? occupant || 'Enrolled Student' : null,
    }).catch((err) => console.info('[seatApi.updateSeat]', err.message));
  };

  // Admin Add User (Persists directly to database via userApi, then updates cache & UI)
  const addUser = async (userData: Omit<AdminUser, 'id' | 'history'>): Promise<{ success: boolean; message: string; user?: AdminUser }> => {
    // 1. Client-side validation: Seat must be available if assigned
    const selectedSeatNo = userData.seat && userData.seat !== 'None' ? userData.seat.trim().toUpperCase() : 'None';
    if (selectedSeatNo !== 'None' && userData.status === 'Active') {
      const targetSeat = seats.find((s) => s.number.toUpperCase() === selectedSeatNo);
      if (!targetSeat) {
        return { success: false, message: `Seat ${userData.seat} does not exist in library layout.` };
      }
      if (targetSeat.status !== 'available') {
        return { success: false, message: `Seat ${userData.seat} is already ${targetSeat.status} (occupied by ${targetSeat.occupiedBy || 'another student'}).` };
      }
    }

    try {
      // 2. Make actual POST API call to persist user in backend database
      const response = await userApi.createUser({
        name: userData.name.trim(),
        mobile: userData.mobile.trim(),
        email: userData.email && userData.email.trim() ? userData.email.trim() : undefined,
        password: userData.password && userData.password.trim() ? userData.password.trim() : undefined,
        address: userData.address ? userData.address.trim() : '',
        plan: userData.plan,
        planId: userData.planId,
        seat: selectedSeatNo,
        joiningDate: userData.joiningDate,
        expiryDate: userData.expiryDate,
        status: 'Active',
        role: userData.role || 'student',
        baseFee: userData.baseFee,
        discount: userData.discount,
        discountReason: userData.discountReason,
        finalFee: userData.finalFee,
        paidAmount: userData.paidAmount,
        balanceDue: userData.balanceDue,
        paymentMethod: (userData as any).paymentMethod,
      });

      if (!response.success || !response.user) {
        return { success: false, message: response.message || 'Failed to create user in database.' };
      }

      // 3. Immediately refresh users, seats, and activities directly from the database to guarantee persistence and consistency
      try {
        const [updatedUsers, updatedSeats, updatedActivities] = await Promise.all([
          userApi.getUsers(),
          seatApi.getSeats(),
          activityApi.getActivities(),
        ]);

        if (Array.isArray(updatedUsers)) setUsers(updatedUsers);
        if (Array.isArray(updatedSeats)) setSeats(updatedSeats);
        if (Array.isArray(updatedActivities)) setActivities(updatedActivities);
      } catch {
        // Fallback: If immediate re-fetch fails, append the created user returned by server
        setUsers((prev) => [response.user, ...prev.filter((u) => u.id !== response.user.id)]);
      }

      return {
        success: true,
        message: response.message || `Member ${userData.name} enrolled and saved to database successfully.`,
        user: response.user,
      };
    } catch (err: any) {
      console.error('[LibraryContext.addUser] Database user creation failed:', err);
      const errorMessage =
        err?.data?.error ||
        err?.message ||
        'Failed to save member to database. Please check database connection and try again.';
      return { success: false, message: errorMessage };
    }
  };

  // Admin Edit User
  const editUser = async (userId: string, updatedData: Partial<AdminUser>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await userApi.updateUser(userId, {
        name: updatedData.name,
        mobile: updatedData.mobile,
        email: updatedData.email,
        password: updatedData.password,
        address: updatedData.address,
        plan: updatedData.plan,
        planId: updatedData.planId,
        seat: updatedData.seat,
        joiningDate: updatedData.joiningDate,
        expiryDate: updatedData.expiryDate,
        status: updatedData.status,
        baseFee: updatedData.baseFee,
        discount: updatedData.discount,
        discountReason: updatedData.discountReason,
        finalFee: updatedData.finalFee,
        paidAmount: updatedData.paidAmount,
        balanceDue: updatedData.balanceDue,
      });

      if (!res.success) {
        return { success: false, message: res.message || 'Failed to update member in database.' };
      }

      // Refresh fresh records from DB
      try {
        const [updatedUsers, updatedSeats] = await Promise.all([
          userApi.getUsers(),
          seatApi.getSeats(),
        ]);
        if (Array.isArray(updatedUsers)) setUsers(updatedUsers);
        if (Array.isArray(updatedSeats)) setSeats(updatedSeats);
      } catch {}

      return { success: true, message: 'Member details updated successfully in database.' };
    } catch (err: any) {
      console.error('[LibraryContext.editUser]', err);
      return { success: false, message: err?.data?.error || err?.message || 'Failed to update member.' };
    }
  };

  // Discontinue User (Business Rule #2, #6)
  const discontinueUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await userApi.discontinueUser(userId);
      if (!res.success) {
        return { success: false, message: res.message || 'Failed to discontinue member.' };
      }

      // Refresh fresh records from DB
      try {
        const [updatedUsers, updatedSeats, updatedActivities] = await Promise.all([
          userApi.getUsers(),
          seatApi.getSeats(),
          activityApi.getActivities(),
        ]);
        if (Array.isArray(updatedUsers)) setUsers(updatedUsers);
        if (Array.isArray(updatedSeats)) setSeats(updatedSeats);
        if (Array.isArray(updatedActivities)) setActivities(updatedActivities);
      } catch {}

      return { success: true, message: 'Member discontinued and seat released successfully.' };
    } catch (err: any) {
      console.error('[LibraryContext.discontinueUser]', err);
      return { success: false, message: err?.data?.error || err?.message || 'Failed to discontinue member.' };
    }
  };

  // Change Student Seat (Business Rule #3)
  const changeUserSeat = async (userId: string, newSeatNumber: string): Promise<{ success: boolean; message: string }> => {
    const cleanNewSeat = newSeatNumber.trim().toUpperCase();
    try {
      const res = await userApi.changeUserSeat(userId, cleanNewSeat);
      if (!res.success) {
        return { success: false, message: res.message || 'Failed to change seat in database.' };
      }

      // Refresh fresh records from DB
      try {
        const [updatedUsers, updatedSeats, updatedActivities] = await Promise.all([
          userApi.getUsers(),
          seatApi.getSeats(),
          activityApi.getActivities(),
        ]);
        if (Array.isArray(updatedUsers)) setUsers(updatedUsers);
        if (Array.isArray(updatedSeats)) setSeats(updatedSeats);
        if (Array.isArray(updatedActivities)) setActivities(updatedActivities);
      } catch {}

      return { success: true, message: `Seat successfully changed to ${cleanNewSeat}.` };
    } catch (err: any) {
      console.error('[LibraryContext.changeUserSeat]', err);
      return { success: false, message: err?.data?.error || err?.message || 'Failed to change seat.' };
    }
  };

  // Floor Management Implementations
  const addFloor = async (floorData: {
    name: string;
    description?: string;
    status?: 'Active' | 'Inactive';
    floorNumber?: number | null;
    sortOrder?: number;
  }): Promise<{ success: boolean; message: string; floor?: Floor }> => {
    try {
      const res = await floorApi.createFloor(floorData);
      if (res.success && res.floor) {
        setFloors((prev) => [...prev, res.floor!]);
        await refreshFloors();
        return { success: true, message: res.message, floor: res.floor };
      }
      return { success: false, message: res.message || 'Failed to create floor.' };
    } catch (err: any) {
      return { success: false, message: err?.data?.error || err?.message || 'Failed to create floor.' };
    }
  };

  const editFloor = async (
    floorId: string,
    floorData: { name?: string; description?: string; status?: 'Active' | 'Inactive'; floorNumber?: number | null; sortOrder?: number }
  ): Promise<{ success: boolean; message: string; warning?: string | null; floor?: Floor }> => {
    try {
      const res = await floorApi.updateFloor(floorId, floorData);
      if (res.success && res.floor) {
        setFloors((prev) => prev.map((f) => (f.id === floorId ? res.floor! : f)));
        await Promise.all([refreshFloors(), refreshSeats()]);
        return { success: true, message: res.message, warning: res.warning, floor: res.floor };
      }
      return { success: false, message: res.message || 'Failed to update floor.' };
    } catch (err: any) {
      return { success: false, message: err?.data?.error || err?.message || 'Failed to update floor.' };
    }
  };

  const deleteFloor = async (floorId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await floorApi.deleteFloor(floorId);
      if (res.success) {
        setFloors((prev) => prev.filter((f) => f.id !== floorId));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Failed to remove floor.' };
    } catch (err: any) {
      return { success: false, message: err?.data?.error || err?.message || 'Failed to remove floor.' };
    }
  };

  const toggleFloorStatus = async (floorId: string): Promise<{ success: boolean; message: string; warning?: string | null }> => {
    const current = floors.find((f) => f.id === floorId);
    if (!current) return { success: false, message: 'Floor not found.' };
    const nextStatus = current.status === 'Active' ? 'Inactive' : 'Active';
    return editFloor(floorId, { status: nextStatus });
  };

  // Add Seat
  const addSeat = async (seatData: {
    number: string;
    floorId?: string | null;
    description?: string;
    status?: SeatStatus;
  }): Promise<{ success: boolean; message: string; seat?: Seat }> => {
    const cleanNumber = seatData.number.trim().toUpperCase();
    if (!cleanNumber) {
      return { success: false, message: 'Please enter a valid seat number.' };
    }

    try {
      const res = await seatApi.addSeat({
        number: cleanNumber,
        floorId: seatData.floorId,
        description: seatData.description,
        status: seatData.status || 'available',
      });

      if (res.success && res.seat) {
        setSeats((prev) => [...prev, res.seat!]);
        await Promise.all([refreshSeats(), refreshFloors()]);
        return { success: true, message: res.message, seat: res.seat };
      }
      return { success: false, message: res.message || 'Failed to add seat.' };
    } catch (err: any) {
      return { success: false, message: err?.data?.error || err?.message || 'Failed to create seat.' };
    }
  };

  // Bulk Add Seats
  const bulkAddSeats = async (payload: {
    count: number;
    prefix?: string;
    startNumber: number;
    floorId?: string | null;
    description?: string;
  }): Promise<BulkAddSeatsResponse> => {
    try {
      const res = await seatApi.bulkAddSeats(payload);
      if (res.success) {
        await Promise.all([refreshSeats(), refreshFloors()]);
      }
      return res;
    } catch (err: any) {
      return {
        success: false,
        message: err?.data?.error || err?.message || 'Bulk creation failed.',
        requestedCount: payload.count,
        createdCount: 0,
        skippedCount: payload.count,
        createdSeats: [],
        skippedSeats: []
      };
    }
  };

  // Seat Transfer
  const transferSeat = async (userId: string, newSeatNumber: string): Promise<{ success: boolean; message: string; seat?: string }> => {
    try {
      const res = await seatApi.transferSeat({ userId, newSeatNumber });
      if (res.success) {
        await Promise.all([refreshSeats(), refreshFloors()]);
        // Refresh users
        const updatedUsers = await userApi.getUsers();
        if (Array.isArray(updatedUsers)) setUsers(updatedUsers);
        return { success: true, message: res.message, seat: res.seat };
      }
      return { success: false, message: res.message || 'Seat transfer failed.' };
    } catch (err: any) {
      return { success: false, message: err?.data?.error || err?.message || 'Seat transfer failed.' };
    }
  };

  // Seat Release
  const releaseSeat = async (payload: { userId?: string; seatNumber?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await seatApi.releaseSeat(payload);
      if (res.success) {
        await Promise.all([refreshSeats(), refreshFloors()]);
        const updatedUsers = await userApi.getUsers();
        if (Array.isArray(updatedUsers)) setUsers(updatedUsers);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Seat release failed.' };
    } catch (err: any) {
      return { success: false, message: err?.data?.error || err?.message || 'Seat release failed.' };
    }
  };

  // Remove Seat (Business Rule #5)
  const removeSeat = (seatNumber: string): { success: boolean; message: string } => {
    const targetSeat = seats.find((s) => s.number.toUpperCase() === seatNumber.toUpperCase());
    if (!targetSeat) {
      return { success: false, message: `Seat ${seatNumber} not found.` };
    }

    if (targetSeat.status === 'occupied') {
      return {
        success: false,
        message: `Cannot remove Seat ${seatNumber}. It is currently assigned to ${targetSeat.occupiedBy || 'an active student'}. Please reassign or release the student's seat first.`
      };
    }

    setSeats((prev) => prev.filter((s) => s.number.toUpperCase() !== seatNumber.toUpperCase()));

    // Sync to backend via seatApi
    seatApi.deleteSeat(seatNumber).catch((err) => console.info('[seatApi.deleteSeat]', err.message));

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

    // Sync to backend via planApi
    planApi.addPlan(planData).catch((err) => console.info('[planApi.addPlan]', err.message));

    return { success: true, message: `Plan "${planData.name}" created successfully.` };
  };

  // Manage Plans: Edit
  const editPlan = (planId: string, planData: Partial<MembershipPlan>): { success: boolean; message: string } => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, ...planData } : p))
    );

    // Sync to backend via planApi
    planApi.updatePlan(planId, planData).catch((err) => console.info('[planApi.updatePlan]', err.message));

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

    // Sync to backend via planApi
    planApi.updatePlan(planId, { status: nextStatus }).catch((err) => console.info('[planApi.updatePlan]', err.message));

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
        floors,
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
        refreshFloors,
        refreshSeats,
        addFloor,
        editFloor,
        deleteFloor,
        toggleFloorStatus,
        bulkAddSeats,
        transferSeat,
        releaseSeat,
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
