import { Train, CorridorId, TrainStatus } from "@/types/train";

// Mock data storage
let trains: Train[] = [
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

// Helper to check if train is valid (more than 48h from now)
const isTrainValid = (departureIso: string): boolean => {
  const departure = new Date(departureIso);
  const now = new Date();
  const diffInHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffInHours > 48;
};

// Clean expired trains automatically
const cleanExpiredTrains = () => {
  trains = trains.filter(train => isTrainValid(train.departureIso));
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
  return trains[index];
};

export const deleteTrain = (id: string): boolean => {
  const initialLength = trains.length;
  trains = trains.filter(train => train.id !== id);
  return trains.length < initialLength;
};