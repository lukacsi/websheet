import type { Edition, Entry } from './common';

export interface Background {
  id?: string;
  name: string;
  source: string;
  edition?: Edition;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: string[];
  startingEquipment: Entry[];
  feats?: string[];
  feature?: {
    name: string;
    entries: Entry[];
  };
  entries: Entry[];
}
