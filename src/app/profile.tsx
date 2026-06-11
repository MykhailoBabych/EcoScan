import { useRef, useEffect } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useProfile } from '@/contexts/ProfileContext';
import { WasteCategory } from '@/services/profile';
import { useTheme } from '@/hooks/use-theme';

// ─── Sprite constants ─────────────────────────────────────────────────────────

const ORIGINAL_WIDTH = 341;
const ORIGINAL_HEIGHT = 512;
const SCALE = 3.2;
const DISPLAY_WIDTH = ORIGINAL_WIDTH / SCALE;
const DISPLAY_HEIGHT = ORIGINAL_HEIGHT / SCALE;
const FULL_IMAGE_WIDTH = DISPLAY_WIDTH * 3;
const FULL_IMAGE_HEIGHT = DISPLAY_HEIGHT * 3;
const CIRCLE_SIZE = DISPLAY_WIDTH;

// ─── Category config ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<WasteCategory, { label: string; emoji: string; color: string }> = {
  plastic:     { label: 'Plastic',      emoji: '🧴', color: '#0ea5e9' },
  glass:       { label: 'Glass',        emoji: '🫙', color: '#8b5cf6' },
  paper:       { label: 'Paper',        emoji: '📄', color: '#f59e0b' },
  cardboard:   { label: 'Cardboard',    emoji: '📦', color: '#d97706' },
  metal:       { label: 'Metal',        emoji: '🥫', color: '#6b7280' },
  food:        { label: 'Food/Organic', emoji: '🍌', color: '#22c55e' },
  electronics: { label: 'Electronics', emoji: '📱', color: '#ef4444' },
  unknown:     { label: 'Other',        emoji: '❓', color: '#94a3b8' },
};

const LEVEL_COLORS = ['#94a3b8', '#22c55e', '#0ea5e9', '#8b5cf6', '#f59e0b'];

// ─── Animated progress bar ────────────────────────────────────────────────────

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width, backgroundColor: color }]} />
    </View>
  );
}

// ─── Scan history item ────────────────────────────────────────────────────────

function ScanItem({ item }: { item: ReturnType<typeof useProfile>['scanHistory'][number] }) {
  const meta = CATEGORY_META[item.category];
  const theme = useTheme();
  const date = new Date(item.timestamp);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.scanItem}>
      <View style={[styles.scanEmoji, { backgroundColor: meta.color + '22' }]}>
        <Text style={styles.scanEmojiText}>{meta.emoji}</Text>
      </View>
      <View style={styles.scanInfo}>
        <Text style={[styles.scanLabel, { color: theme.text }]} numberOfLines={1}>{item.objectLabel}</Text>
        <Text style={styles.scanCategory}>{meta.label}</Text>
      </View>
      <View style={styles.scanRight}>
        <Text style={styles.scanDate}>{dateStr}</Text>
        <Text style={styles.scanTime}>{timeStr}</Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const {
    name, characterIndex,
    ecoPoints, totalScans,
    scanHistory, categoryStats,
    level, levelProgress,
  } = useProfile();

  const theme = useTheme();
  const router = useRouter();

  const col = characterIndex % 3;
  const row = Math.floor(characterIndex / 3);
  const translateX = -(col * DISPLAY_WIDTH);
  const translateY = -(row * DISPLAY_HEIGHT);

  const levelColor = LEVEL_COLORS[(level.level - 1) % LEVEL_COLORS.length];

  // Only show categories with at least 1 scan, sorted descending
  const activeCats = (Object.entries(categoryStats) as [WasteCategory, number][])
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const maxCatCount = activeCats[0]?.[1] ?? 1;

  const nextLevelPoints =
    level.maxPoints === Infinity
      ? null
      : level.maxPoints + 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={24} tintColor="#0a84ff" />
          <Text style={styles.headerBackText}>Settings</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: theme.backgroundElement }]}>
          {/* Avatar */}
          <View style={[styles.avatarRing, { borderColor: levelColor }]}>
            <View style={styles.avatarClip}>
              <Image
                source={require('@/assets/images/guys.png')}
                style={[
                  styles.avatarSprite,
                  { left: translateX, top: translateY },
                ]}
              />
            </View>
          </View>

          {/* Name + level badge */}
          <Text style={[styles.heroName, { color: theme.text }]}>{name}</Text>
          <View style={[styles.levelBadge, { backgroundColor: levelColor + '22', borderColor: levelColor }]}>
            <Text style={[styles.levelBadgeText, { color: levelColor }]}>
              Lv.{level.level}  {level.title}
            </Text>
          </View>

          {/* Points */}
          <Text style={[styles.pointsValue, { color: levelColor }]}>
            {ecoPoints.toLocaleString()}
          </Text>
          <Text style={[styles.pointsLabel, { color: theme.textSecondary }]}>Eco Points</Text>

          {/* Progress bar */}
          <View style={styles.progressWrapper}>
            <ProgressBar progress={levelProgress} color={levelColor} />
            <View style={styles.progressLabels}>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {ecoPoints} pts
              </Text>
              {nextLevelPoints ? (
                <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                  {nextLevelPoints} pts
                </Text>
              ) : (
                <Text style={[styles.progressText, { color: levelColor }]}>MAX</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            value={totalScans}
            label="Total Scans"
            emoji="📷"
            theme={theme}
          />
          <StatCard
            value={activeCats.length}
            label="Categories"
            emoji="♻️"
            theme={theme}
          />
          <StatCard
            value={level.level}
            label="Level"
            emoji="⭐"
            theme={theme}
          />
        </View>

        {/* ── Category stats ───────────────────────────────────────────────── */}
        {activeCats.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Waste Categories
            </Text>
            {activeCats.map(([cat, count]) => {
              const meta = CATEGORY_META[cat];
              return (
                <View key={cat} style={styles.catRow}>
                  <Text style={styles.catEmoji}>{meta.emoji}</Text>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={[styles.catLabel, { color: theme.text }]}>{meta.label}</Text>
                      <Text style={[styles.catCount, { color: meta.color }]}>{count}</Text>
                    </View>
                    <View style={styles.catTrack}>
                      <View
                        style={[
                          styles.catFill,
                          {
                            width: `${(count / maxCatCount) * 100}%`,
                            backgroundColor: meta.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Scan history ─────────────────────────────────────────────────── */}
        {scanHistory.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recent Scans
            </Text>
            {scanHistory.slice(0, 10).map((item) => (
              <ScanItem key={item.id} item={item} />
            ))}
          </View>
        )}

        {/* Empty state */}
        {totalScans === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No scans yet.{'\n'}Head to the Scanner tab to get started!
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  value, label, emoji, theme,
}: {
  value: number;
  label: string;
  emoji: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerBackText: {
    color: '#0a84ff',
    fontSize: 17,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flex: 1,
  },

  // Hero
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  avatarRing: {
    width: CIRCLE_SIZE + 8,
    height: CIRCLE_SIZE + 8,
    borderRadius: (CIRCLE_SIZE + 8) / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarClip: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
  },
  avatarSprite: {
    position: 'absolute',
    width: FULL_IMAGE_WIDTH,
    height: FULL_IMAGE_HEIGHT,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 2,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pointsValue: {
    fontSize: 40,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: -1,
  },
  pointsLabel: {
    fontSize: 13,
    marginTop: -4,
  },
  progressWrapper: {
    width: '100%',
    marginTop: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff18',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontSize: 11,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, textAlign: 'center' },

  // Section
  section: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },

  // Category bars
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  catInfo: { flex: 1, gap: 4 },
  catLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catLabel: { fontSize: 14, fontWeight: '500' },
  catCount: { fontSize: 14, fontWeight: '700' },
  catTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff18',
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Scan history
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  scanEmoji: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanEmojiText: { fontSize: 20 },
  scanInfo: { flex: 1 },
  scanLabel: { fontSize: 15, fontWeight: '600' },
  scanCategory: { fontSize: 12, color: '#8e8e93', marginTop: 1 },
  scanRight: { alignItems: 'flex-end' },
  scanDate: { fontSize: 12, color: '#8e8e93' },
  scanTime: { fontSize: 11, color: '#636366', marginTop: 1 },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
