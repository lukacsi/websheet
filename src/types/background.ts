import type { Edition, Entry, ProfChoice, LangChoice } from './common';

export interface Background {
  id?: string;
  name: string;
  source: string;
  edition?: Edition;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  toolChoices?: ProfChoice[];
  languages?: string[];
  languageChoices?: LangChoice[];
  startingEquipment: Entry[];
  feats?: string[];
  feature?: {
    name: string;
    entries: Entry[];
  };
  entries: Entry[];
}
