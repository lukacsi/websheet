import type { Entry } from '@/types';

export interface ClassFeatureRecord {
  id: string;
  name: string;
  level: number;
  entries: Entry[];
  isSubclassFeature: boolean;
  subclassName?: string;
}

export interface RaceTraits {
  name: string;
  traits: Entry[];
}

export interface BackgroundFeature {
  name: string;
  featureName: string;
  featureEntries: Entry[];
}
