import { useProfile } from '@/contexts/ProfileContext';
import { WasteCategory } from '@/services/profile';

const RECYCLABLE: WasteCategory[] = ['plastic', 'glass', 'paper', 'cardboard', 'metal'];
const POLLUTING: WasteCategory[] = ['electronics', 'food', 'unknown'];

export function useEcoScore() {
  const { categoryStats, totalScans } = useProfile();

  const recycledCount = RECYCLABLE.reduce((sum, cat) => sum + categoryStats[cat], 0);
  const wastedCount = POLLUTING.reduce((sum, cat) => sum + categoryStats[cat], 0);

  const score = totalScans > 0 ? recycledCount / totalScans : 0.5;

  return { score, recycledCount, wastedCount, totalScans };
}
