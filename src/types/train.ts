export type TrainStatus = "VOLNO" | "DOTAZ" | "PLNO";

export type CorridorId = "BRV_OBRNICE" | "HAM_OBRNICE" | "BRV_MOSNOV" | "HAM_MOSNOV";

export interface Train {
  id: string;
  corridor: CorridorId;
  departureIso: string;
  status: TrainStatus;
}

export interface Corridor {
  id: CorridorId;
  name: string;
  from: string;
  to: string;
}

export const CORRIDORS: Corridor[] = [
  {
    id: "BRV_OBRNICE",
    name: "BRV → Obrnice/Mělník",
    from: "BRV",
    to: "Obrnice/Mělník"
  },
  {
    id: "HAM_OBRNICE", 
    name: "HAM → Obrnice/Mělník",
    from: "HAM",
    to: "Obrnice/Mělník"
  },
  {
    id: "BRV_MOSNOV",
    name: "BRV → Mošnov", 
    from: "BRV",
    to: "Mošnov"
  },
  {
    id: "HAM_MOSNOV",
    name: "HAM → Mošnov",
    from: "HAM", 
    to: "Mošnov"
  }
];

export const STATUS_LABELS: Record<TrainStatus, string> = {
  VOLNO: "Volno",
  DOTAZ: "Na dotaz", 
  PLNO: "Plno"
};

export const STATUS_COLORS: Record<TrainStatus, { bg: string; text: string; indicator: string }> = {
  VOLNO: {
    bg: "bg-status-available-bg",
    text: "text-status-available",
    indicator: "bg-status-available"
  },
  DOTAZ: {
    bg: "bg-status-inquiry-bg", 
    text: "text-status-inquiry",
    indicator: "bg-status-inquiry"
  },
  PLNO: {
    bg: "bg-status-full-bg",
    text: "text-status-full", 
    indicator: "bg-status-full"
  }
};