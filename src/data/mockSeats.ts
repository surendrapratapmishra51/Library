import { Seat } from '../types';

export const generateInitialSeats = (): Seat[] => {
  const seats: Seat[] = [];

  const sections: { section: 'A' | 'B' | 'C' | 'D'; floor: 1 | 2 }[] = [
    { section: 'A', floor: 1 },
    { section: 'B', floor: 1 },
    { section: 'C', floor: 2 },
    { section: 'D', floor: 2 }
  ];

  for (const sec of sections) {
    for (let i = 1; i <= 25; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const seatNumber = `${sec.section}${numStr}`;
      const isCorner = i === 1 || i === 5 || i === 21 || i === 25;

      seats.push({
        id: `seat-${seatNumber.toLowerCase()}`,
        number: seatNumber,
        floor: sec.floor,
        section: sec.section,
        status: 'available',
        hasPowerOutlet: true,
        hasDeskLamp: true,
        isCornerOrWindow: isCorner,
        occupiedBy: undefined,
        assignedUntil: undefined
      });
    }
  }

  return seats;
};

export const mockSeats: Seat[] = generateInitialSeats();
