export interface Beneficiary {
  id: string;
  wardId: number;
  category: 'healthcare' | 'education' | 'issue_resolution' | 'smart_voter' | 'direct_call' | 'jobs';
  age: number;
  gender: 'male' | 'female' | 'other';
  sentiment: 'happy' | 'unhappy' | 'neutral';
  urgency: 'low' | 'medium' | 'high';
  timestamp: number;
  lat: number;
  lng: number;
}

export interface Ward {
  id: number;
  name: string;
  center: [number, number]; // [lat, lng]
}

// Bareilly approximate bounds based on reference map
const MIN_LAT = 28.3119;
const MAX_LAT = 28.4329;
const MIN_LNG = 79.3644;
const MAX_LNG = 79.4735;

// Point-in-polygon algorithm
const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Refined Bareilly boundary based on Google Maps
export const BAREILLY_BOUNDARY: [number, number][] = [
  [28.4300, 79.4000],
  [28.4400, 79.4200],
  [28.4300, 79.4500],
  [28.4100, 79.4700],
  [28.3800, 79.4800],
  [28.3500, 79.4700],
  [28.3200, 79.4500],
  [28.3100, 79.4200],
  [28.3200, 79.3900],
  [28.3400, 79.3700],
  [28.3700, 79.3600],
  [28.4000, 79.3700],
  [28.4200, 79.3800],
  [28.4300, 79.4000],
];

export interface Neighborhood {
  name: string;
  center: [number, number];
  type: 'macro' | 'micro';
}

export const BAREILLY_NEIGHBORHOODS: Neighborhood[] = [
  { name: 'BAREILLY', center: [28.3670355, 79.4304381], type: 'macro' },
  { name: 'Civil Lines', center: [28.3600, 79.4200], type: 'micro' },
  { name: 'Izzatnagar', center: [28.4000, 79.4200], type: 'micro' },
  { name: 'Subhash Nagar', center: [28.3400, 79.4100], type: 'micro' },
  { name: 'Rajendra Nagar', center: [28.3800, 79.4400], type: 'micro' },
  { name: 'Model Town', center: [28.3700, 79.4500], type: 'micro' },
  { name: 'Prem Nagar', center: [28.3750, 79.4250], type: 'micro' },
  { name: 'Qila', center: [28.3500, 79.4000], type: 'micro' },
  { name: 'Cantonment', center: [28.3300, 79.4300], type: 'micro' },
  { name: 'Koharapeer', center: [28.3650, 79.4100], type: 'micro' },
  { name: 'Rampur Garden', center: [28.3550, 79.4350], type: 'micro' },
  { name: 'Nainital Road', center: [28.3900, 79.4150], type: 'micro' },
  { name: 'Pilibhit Road', center: [28.3800, 79.4600], type: 'micro' },
  { name: 'Chopla', center: [28.3500, 79.4150], type: 'micro' },
  { name: 'Bara Bazar', center: [28.3550, 79.4050], type: 'micro' },
  { name: 'Suresh Sharma Nagar', center: [28.3850, 79.4550], type: 'micro' },
  { name: 'Mahanagar', center: [28.4100, 79.4400], type: 'micro' },
  { name: 'CB Ganj', center: [28.3800, 79.3800], type: 'micro' },
  { name: 'Parsakhera', center: [28.4000, 79.3700], type: 'micro' },
  { name: 'Mini Bypass', center: [28.3900, 79.3900], type: 'micro' },
  { name: 'Nekpur', center: [28.3300, 79.4000], type: 'micro' },
  { name: 'Kareilly', center: [28.3250, 79.4100], type: 'micro' },
  { name: 'Hartman', center: [28.4100, 79.4000], type: 'micro' },
  { name: 'Biharipur', center: [28.3600, 79.4000], type: 'micro' },
  { name: 'Azamnagar', center: [28.3550, 79.3950], type: 'micro' },
  { name: 'Karula', center: [28.3450, 79.3850], type: 'micro' },
  { name: 'Shamat Ganj', center: [28.3600, 79.4300], type: 'micro' },
  { name: 'Kutub Khana', center: [28.3650, 79.4150], type: 'micro' },
  { name: 'Delapeer', center: [28.3950, 79.4350], type: 'micro' },
  { name: 'Jagatpur', center: [28.3750, 79.4450], type: 'micro' },
  { name: 'Shahdana', center: [28.3700, 79.4100], type: 'micro' },
  { name: 'Rithora', center: [28.3900, 79.4800], type: 'micro' },
  { name: 'Bhojipura', center: [28.4500, 79.4200], type: 'micro' },
  { name: 'Rohilkhand Univ.', center: [28.3700, 79.4700], type: 'micro' },
  { name: 'Phoenix Area', center: [28.3850, 79.4650], type: 'micro' },
  { name: 'Invertis Village', center: [28.4300, 79.4800], type: 'micro' },
  { name: 'Ayub Khan Ch.', center: [28.3620, 79.4220], type: 'micro' },
  { name: 'Novelty', center: [28.3630, 79.4180], type: 'micro' },
];

// Create a more realistic grid-like ward distribution for Bareilly
export const BAREILLY_WARDS: Ward[] = (() => {
  const wards: Ward[] = [];
  const rows = 9;
  const cols = 9;
  const latStep = (MAX_LAT - MIN_LAT) / (rows - 1);
  const lngStep = (MAX_LNG - MIN_LNG) / (cols - 1);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lat = MIN_LAT + row * latStep + (Math.random() - 0.5) * 0.002;
      const lng = MIN_LNG + col * lngStep + (Math.random() - 0.5) * 0.002;
      
      // Only add ward if it's within boundary
      if (isPointInPolygon([lat, lng], BAREILLY_BOUNDARY)) {
        wards.push({
          id: wards.length + 1,
          name: `Ward ${wards.length + 1}`,
          center: [lat, lng]
        });
      }
    }
  }
  return wards;
})();

const CATEGORIES = ['healthcare', 'education', 'issue_resolution', 'smart_voter', 'direct_call', 'jobs'] as const;
const GENDERS = ['male', 'female', 'other'] as const;
const SENTIMENTS = ['happy', 'unhappy', 'neutral'] as const;
const URGENCIES = ['low', 'medium', 'high'] as const;

export const generateMockBeneficiaries = (count: number): Beneficiary[] => {
  const beneficiaries: Beneficiary[] = [];
  let i = 0;
  
  while (beneficiaries.length < count) {
    const lat = MIN_LAT + Math.random() * (MAX_LAT - MIN_LAT);
    const lng = MIN_LNG + Math.random() * (MAX_LNG - MIN_LNG);
    
    if (isPointInPolygon([lat, lng], BAREILLY_BOUNDARY)) {
      // Find closest ward for ID assignment
      let closestWard = BAREILLY_WARDS[0];
      let minDistance = Infinity;
      BAREILLY_WARDS.forEach(w => {
        const d = Math.sqrt(Math.pow(w.center[0] - lat, 2) + Math.pow(w.center[1] - lng, 2));
        if (d < minDistance) {
          minDistance = d;
          closestWard = w;
        }
      });

      beneficiaries.push({
        id: `b-${i}`,
        wardId: closestWard.id,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        age: 18 + Math.floor(Math.random() * 60),
        gender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
        sentiment: SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)],
        urgency: URGENCIES[Math.floor(Math.random() * URGENCIES.length)],
        timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30,
        lat,
        lng,
      });
      i++;
    }
  }
  
  return beneficiaries;
};
