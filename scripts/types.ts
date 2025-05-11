export interface City {
  id: string;
  name: string;
  path: string;
}

export const SUPPORTED_CITIES = {
  SEATTLE: {
    id: 'seattle',
    name: 'Seattle',
    path: 'FinalBathrooms/SeattleFinal/bathrooms',
  },
  BOSTON: {
    id: 'boston',
    name: 'Boston',
    path: 'FinalBathrooms/BostonFinal/bathrooms',
  },
  CHICAGO: {
    id: 'chicago',
    name: 'Chicago',
    path: 'FinalBathrooms/ChicagoFinal/bathrooms',
  },
  NYC: {
    id: 'nyc',
    name: 'New York City',
    path: 'FinalBathrooms/NYCFinal/bathrooms',
  }
} as const; 