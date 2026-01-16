// Clock settings
export interface ClockSettings {
  id?: number;
  theme: string;
  color: string;
  fontFamily: string;
  fontSize: number;
  opacity: number;
  positionX: number;
  positionY: number;
  workDuration: number;
  breakDuration: number;
  enableReminder: boolean;
}

// Statistics data
export interface KeyboardStats {
  count: number;
  timestamp: string;
}

export interface MouseClickStats {
  button: string;
  count: number;
  timestamp: string;
}

export interface MouseMoveStats {
  distance: number;
  timestamp: string;
}

export interface StatsData {
  keyboard: KeyboardStats[];
  mouseClicks: MouseClickStats[];
  mouseMove: MouseMoveStats[];
}
