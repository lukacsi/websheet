import type { EntityTagType } from '@/utils/parse-tags';
import { SpellDetail } from './details/SpellDetail';
import { ItemDetail } from './details/ItemDetail';
import { ClassDetail } from './details/ClassDetail';
import { ClassFeatureDetail } from './details/ClassFeatureDetail';
import { RaceDetail } from './details/RaceDetail';
import { BackgroundDetail } from './details/BackgroundDetail';
import { CreatureDetail } from './details/CreatureDetail';
import { FallbackDetail } from './details/FallbackDetail';

interface Props {
  tagType: EntityTagType;
  data: Record<string, unknown>;
}

export function EntityDetailView({ tagType, data }: Props) {
  switch (tagType) {
    case 'spell':
      return <SpellDetail data={data} />;
    case 'item':
      return <ItemDetail data={data} />;
    case 'class':
      return <ClassDetail data={data} />;
    case 'classFeature':
    case 'subclassFeature':
      return <ClassFeatureDetail data={data} />;
    case 'race':
      return <RaceDetail data={data} />;
    case 'background':
      return <BackgroundDetail data={data} />;
    case 'creature':
      return <CreatureDetail data={data} />;
    default:
      return <FallbackDetail tagType={tagType} data={data} />;
  }
}
