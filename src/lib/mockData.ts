import { Train, CorridorId, TrainStatus } from "@/types/train";

// Local storage key
const STORAGE_KEY = 'captrain_trains';

// Load trains from localStorage or use default data
const loadTrainsFromStorage = (): Train[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that stored data is an array
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load trains from localStorage:', error);
  }
  
  // Return default data if no stored data or invalid
  return [
    {
      id: "1",
      corridor: "BRV_OBRNICE",
      departureIso: "2024-09-02T08:30:00.000Z",
      status: "VOLNO"
    },
    {
      id: "2", 
      corridor: "BRV_OBRNICE",
      departureIso: "2024-09-03T14:15:00.000Z",
      status: "DOTAZ"
    },
    {
      id: "3",
      corridor: "HAM_OBRNICE", 
      departureIso: "2024-09-02T10:00:00.000Z",
      status: "PLNO"
    },
    {
      id: "4",
      corridor: "BRV_MOSNOV",
      departureIso: "2024-09-04T09:45:00.000Z", 
      status: "VOLNO"
    },
    {
      id: "5",
      corridor: "HAM_MOSNOV",
      departureIso: "2024-09-05T16:20:00.000Z",
      status: "DOTAZ"
    }
  ];
};

// Save trains to localStorage
const saveTrainsToStorage = (trains: Train[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trains));
  } catch (error) {
    console.error('Failed to save trains to localStorage:', error);
  }
};

// Initialize trains from storage
let trains: Train[] = loadTrainsFromStorage();

// Helper to check if train is valid (more than 48h from now)
const isTrainValid = (departureIso: string): boolean => {
  const departure = new Date(departureIso);
  const now = new Date();
  const diffInHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffInHours > 48;
};

// Clean expired trains automatically
const cleanExpiredTrains = () => {
  const initialLength = trains.length;
  trains = trains.filter(train => isTrainValid(train.departureIso));
  
  // If we removed any expired trains, save to storage
  if (trains.length < initialLength) {
    saveTrainsToStorage(trains);
  }
};

// Mock API functions
export const getTrains = (corridor?: CorridorId): Train[] => {
  cleanExpiredTrains();
  if (corridor) {
    return trains
      .filter(train => train.corridor === corridor)
      .sort((a, b) => new Date(a.departureIso).getTime() - new Date(b.departureIso).getTime());
  }
  return trains.sort((a, b) => new Date(a.departureIso).getTime() - new Date(b.departureIso).getTime());
};

export const getPublicCapacity = (corridor: CorridorId, limit: number = 5): Train[] => {
  cleanExpiredTrains();
  return trains
    .filter(train => train.corridor === corridor)
    .sort((a, b) => new Date(a.departureIso).getTime() - new Date(b.departureIso).getTime())
    .slice(0, limit);
};

export const addTrain = (train: Omit<Train, "id">): Train => {
  // Validate departure time is more than 48h from now
  if (!isTrainValid(train.departureIso)) {
    throw new Error("Vlak musí odjíždět nejdříve za 48 hodin");
  }
  
  const newTrain: Train = {
    ...train,
    id: Date.now().toString()
  };
  trains.push(newTrain);
  
  // Save to localStorage
  saveTrainsToStorage(trains);
  
  return newTrain;
};

export const updateTrain = (id: string, updates: Partial<Omit<Train, "id">>): Train => {
  const index = trains.findIndex(train => train.id === id);
  if (index === -1) {
    throw new Error("Vlak nenalezen");
  }
  
  // If updating departure time, validate it
  if (updates.departureIso && !isTrainValid(updates.departureIso)) {
    throw new Error("Vlak musí odjíždět nejdříve za 48 hodin");
  }
  
  trains[index] = { ...trains[index], ...updates };
  
  // Save to localStorage
  saveTrainsToStorage(trains);
  
  return trains[index];
};

export const deleteTrain = (id: string): boolean => {
  const initialLength = trains.length;
  trains = trains.filter(train => train.id !== id);
  
  // Save to localStorage if we deleted a train
  if (trains.length < initialLength) {
    saveTrainsToStorage(trains);
  }
  
  return trains.length < initialLength;
};

// Export function to get all trains for debugging/export
export const getAllTrains = (): Train[] => {
  cleanExpiredTrains();
  return [...trains];
};

// Export function to reset to default data
export const resetToDefaultData = () => {
  trains = loadTrainsFromStorage();
  saveTrainsToStorage(trains);
};

// Export function to import data from JSON
export const importTrainsFromJSON = (jsonData: string): Train[] => {
  try {
    const parsed = JSON.parse(jsonData);
    if (!Array.isArray(parsed)) {
      throw new Error('Importovaná data musí být pole vlaků');
    }
    
    // Validate each train has required fields
    const validTrains = parsed.filter((train: any) => {
      return train && 
             typeof train.id === 'string' &&
             typeof train.corridor === 'string' &&
             typeof train.departureIso === 'string' &&
             typeof train.status === 'string';
    });
    
    if (validTrains.length === 0) {
      throw new Error('Žádné platné vlaky v importovaných datech');
    }
    
    // Replace current trains with imported ones
    trains = validTrains;
    saveTrainsToStorage(trains);
    
    return trains;
  } catch (error) {
    throw new Error(`Chyba při importu dat: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
  }
};