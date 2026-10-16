import { Seat } from '../types';

// Deterministic set of 18 available seats and 2 maintenance seats
const availableSeatNumbers = new Set([
  'A04', 'A09', 'A14', 'A19', 'A23',
  'B02', 'B07', 'B15', 'B21', 'B24',
  'C03', 'C11', 'C18', 'C22',
  'D05', 'D12', 'D17', 'D25'
]);

const maintenanceSeatNumbers = new Set(['A10', 'C15']);

const mockStudentOccupants = [
  'Aman Verma', 'Pooja Sharma', 'Rohit Kumar', 'Sneha Patel', 'Vikram Singh',
  'Ananya Iyer', 'Rahul Mishra', 'Priya Gupta', 'Karthik Rao', 'Divya Nair',
  'Aditya Joshi', 'Kavita Das', 'Manish Tiwari', 'Megha Sen', 'Saurabh Jha'
];

export const generateInitialSeats = (): Seat[] => {
  const seats: Seat[] = [];

  const sections: { section: 'A' | 'B' | 'C' | 'D'; floor: 1 | 2 }[] = [
    { section: 'A', floor: 1 },
    { section: 'B', floor: 1 },
    { section: 'C', floor: 2 },
    { section: 'D', floor: 2 }
  ];

  let studentIdx = 0;

  for (const sec of sections) {
    for (let i = 1; i <= 25; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const seatNumber = `${sec.section}${numStr}`;
      
      let status: 'available' | 'occupied' | 'maintenance' = 'occupied';
      if (availableSeatNumbers.has(seatNumber)) {
        status = 'available';
      } else if (maintenanceSeatNumbers.has(seatNumber)) {
        status = 'maintenance';
      }

      const isCorner = i === 1 || i === 5 || i === 21 || i === 25;
      const occupant = status === 'occupied' ? mockStudentOccupants[studentIdx % mockStudentOccupants.length] : undefined;
      studentIdx++;

      seats.push({
        id: `seat-${seatNumber.toLowerCase()}`,
        number: seatNumber,
        floor: sec.floor,
        section: sec.section,
        status,
        hasPowerOutlet: true,
        hasDeskLamp: true,
        isCornerOrWindow: isCorner,
        occupiedBy: occupant,
        assignedUntil: status === 'occupied' ? '30 Nov 2026' : undefined
      });
    }
  }

  return seats;
};

export const mockSeats: Seat[] = generateInitialSeats();
