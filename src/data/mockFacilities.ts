import { Facility } from '../types';

export const mockFacilities: Facility[] = [
  {
    id: 'fac-1',
    iconName: 'Armchair',
    title: 'Individual Study Seats',
    shortDesc: 'Dedicated personal cubicle with side wooden partitions for total visual privacy.',
    detailedDesc: 'Each seat is thoughtfully engineered with sound-dampening acoustic dividers, ample 3.5-foot wide solid wood desk surface, and ergonomic lumbar-support chairs suited for 8-12 hours of strain-free studying.',
    features: ['High-partition acoustic divider', 'Ergonomic lumbar-support chair', 'Bookrest & stationery ledge']
  },
  {
    id: 'fac-2',
    iconName: 'Snowflake',
    title: 'AC & Ventilated Space',
    shortDesc: 'Climate-controlled temperature (24°C) with fresh air circulation system.',
    detailedDesc: 'Dual inverter multi-split HVAC units maintain continuous 24°C ambient cooling, coupled with high-efficiency carbon air filtration so you stay refreshed and alert during long study shifts.',
    features: ['Dust & pollen air filters', 'Consistent 24°C temperature', 'Zero humidity dampness']
  },
  {
    id: 'fac-3',
    iconName: 'Wifi',
    title: 'High-Speed Optical WiFi',
    shortDesc: 'Dual commercial 300 Mbps fiber connections with automatic failover.',
    detailedDesc: 'Redundant leased fiber lines provide zero-buffer video lectures, seamless PDF downloads, and reliable mock-test submissions with dedicated bandwidth per desk.',
    features: ['300 Mbps redundant dual ISPs', 'Mesh coverage in all corners', 'Low-latency ping (<15ms)']
  },
  {
    id: 'fac-4',
    iconName: 'Zap',
    title: '100% Power Backup',
    shortDesc: 'Silent inverter system with automatic generator backup. Zero blackouts.',
    detailedDesc: 'Never lose your focus or study momentum during city power outages. Automatic online UPS and generator back up lighting, air conditioning, and individual desk sockets instantly.',
    features: ['Zero millisecond cut-over UPS', 'Diesel silent generator backup', 'Dual 3-pin plug per seat']
  },
  {
    id: 'fac-5',
    iconName: 'ShieldCheck',
    title: '24/7 CCTV Security',
    shortDesc: 'High-definition surveillance cameras and biometric entrance gate.',
    detailedDesc: 'Your belongings and study material are safe around the clock. Biometric RFID access ensures strictly registered members enter, monitored by CCTV cameras across hallways and entrance.',
    features: ['RFID fingerprint/card turnstile', 'Full HD 24/7 recording', 'Locker facilities available']
  },
  {
    id: 'fac-6',
    iconName: 'Droplet',
    title: 'RO Drinking Water',
    shortDesc: 'Chilled, normal, and hot RO purified water dispenser on each floor.',
    detailedDesc: 'Multi-stage RO + UV purification system ensures safe, crystal-clean hydration. Hot water dispenser available for herbal teas, green tea, or warm water during winter study sessions.',
    features: ['Multi-stage RO + UV purifiers', 'Chilled & hot water dispenser', 'BPA-free clean station']
  },
  {
    id: 'fac-7',
    iconName: 'Sparkles',
    title: 'Clean & Sanitized Space',
    shortDesc: 'Daily deep cleaning, sanitized restrooms, and hygienic study stations.',
    detailedDesc: 'Dedicated on-site housekeeping cleans and disinfects desks, sanitizes shared touchpoints twice daily, and maintains spotlessly dry, modern restrooms with hand sanitizers.',
    features: ['Twice-daily desk sanitization', 'Dedicated hygienic washrooms', 'Shoe-cover / clean shoe zone']
  },
  {
    id: 'fac-8',
    iconName: 'VolumeX',
    title: 'Strict Silent Study Area',
    shortDesc: 'Zero phone calls, zero group chatting. Pin-drop silence strictly enforced.',
    detailedDesc: 'A designated library warden ensures absolute quiet. Phone calls must be taken in the exterior soundproof corridor. Whisper-free environment allows unmatched focus.',
    features: ['Library warden supervision', 'Separate phone-call lounge', 'Acoustic ceiling soundproofing']
  }
];
