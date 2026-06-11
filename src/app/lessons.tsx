import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Lesson, LessonsService, StudentProfile, StudentsService } from '@/services/lessons';

// ─── Create lesson modal ──────────────────────────────────────────────────────

function CreateLessonModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<Lesson, 'id' | 'createdAt'>) => void;
}) {
  const theme = useTheme();
  const [topic, setTopic] = useState('');
  const [assignment, setAssignment] = useState('');
  const [scanTarget, setScanTarget] = useState('');
  const [xp, setXp] = useState('');
  const [points, setPoints] = useState('');

  const reset = () => {
    setTopic('');
    setAssignment('');
    setScanTarget('');
    setXp('');
    setPoints('');
  };

  const handleSave = () => {
    if (!topic.trim()) {
      Alert.alert('Missing field', 'Please enter a topic.');
      return;
    }
    if (!assignment.trim()) {
      Alert.alert('Missing field', 'Please enter an assignment.');
      return;
    }
    if (!scanTarget.trim()) {
      Alert.alert('Missing field', 'Please enter what to scan.');
      return;
    }
    const xpNum = parseInt(xp, 10);
    const pointsNum = parseInt(points, 10);
    if (isNaN(xpNum) || xpNum < 0) {
      Alert.alert('Invalid value', 'XP must be a non-negative number.');
      return;
    }
    if (isNaN(pointsNum) || pointsNum < 0) {
      Alert.alert('Invalid value', 'Points must be a non-negative number.');
      return;
    }
    onSave({
      topic: topic.trim(),
      assignment: assignment.trim(),
      scanTarget: scanTarget.trim(),
      xpReward: xpNum,
      pointsReward: pointsNum,
    });
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Modal header */}
        <View style={[styles.modalHeader, { borderBottomColor: '#38383a' }]}>
          <TouchableOpacity onPress={handleClose} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>New Lesson</Text>
          <TouchableOpacity onPress={handleSave} style={styles.modalSave}>
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>Topic</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            placeholder="e.g. Plastic Recycling"
            placeholderTextColor="#8e8e93"
            value={topic}
            onChangeText={setTopic}
            maxLength={80}
          />

          <Text style={styles.fieldLabel}>Assignment</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            placeholder="Describe what students need to do…"
            placeholderTextColor="#8e8e93"
            value={assignment}
            onChangeText={setAssignment}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>🔍 Scan Target</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            placeholder="e.g. plastic bottle, glass jar, newspaper"
            placeholderTextColor="#8e8e93"
            value={scanTarget}
            onChangeText={setScanTarget}
            maxLength={80}
          />
          <Text style={styles.fieldHint}>
            What object should the student scan to complete this lesson?
          </Text>

          <View style={styles.rewardRow}>
            <View style={styles.rewardField}>
              <Text style={styles.fieldLabel}>XP Reward</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                placeholder="50"
                placeholderTextColor="#8e8e93"
                value={xp}
                onChangeText={setXp}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={styles.rewardField}>
              <Text style={styles.fieldLabel}>Points Reward</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                placeholder="100"
                placeholderTextColor="#8e8e93"
                value={points}
                onChangeText={setPoints}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Send to student modal ────────────────────────────────────────────────────

function SendStudentModal({
  visible,
  lessonTopic,
  onClose,
  onSend,
}: {
  visible: boolean;
  lessonTopic: string;
  onClose: () => void;
  onSend: (studentIds: string[]) => Promise<void>;
}) {
  const theme = useTheme();
  const [students, setStudents]   = useState<StudentProfile[]>([]);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSelected(new Set());
    setLoading(true);
    StudentsService.loadAll().then((s) => {
      setStudents(s);
      setLoading(false);
    });
  }, [visible]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!selected.size || sending) return;
    setSending(true);
    await onSend(Array.from(selected));
    setSending(false);
  };

  const selectedCount = selected.size;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.modalHeader, { borderBottomColor: '#38383a' }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Skip</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Send to Students</Text>
          <TouchableOpacity
            onPress={handleSend}
            style={styles.modalSave}
            disabled={!selectedCount || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color="#0a84ff" />
              : <Text style={[styles.modalSaveText, { color: selectedCount ? '#0a84ff' : '#8e8e93' }]}>
                  Send{selectedCount > 0 ? ` (${selectedCount})` : ''}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Lesson hint */}
        <View style={styles.sendLessonHint}>
          <SymbolView name="book.fill" size={14} tintColor="#0a84ff" />
          <Text style={[styles.sendTopicHint, { color: theme.textSecondary }]}>
            {' '}<Text style={{ color: theme.text, fontWeight: '700' }}>{lessonTopic}</Text>
          </Text>
        </View>

        {/* Student list */}
        {loading ? (
          <View style={styles.centerFlex}>
            <ActivityIndicator color="#0a84ff" />
          </View>
        ) : students.length === 0 ? (
          <View style={styles.centerFlex}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🎓</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No students yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Students need to register with a School · Student account
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={{ paddingVertical: 8 }}>
            {students.map((s) => {
              const isSelected = selected.has(s.id);
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.studentRow,
                    { backgroundColor: theme.backgroundElement },
                    isSelected && styles.studentRowSelected,
                  ]}
                  onPress={() => toggle(s.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.studentAvatar, isSelected && styles.studentAvatarSelected]}>
                    <Text style={styles.studentAvatarText}>
                      {(s.name[0] || '?').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: theme.text }]}>{s.name}</Text>
                    {s.email ? (
                      <Text style={[styles.studentEmail, { color: theme.textSecondary }]}>{s.email}</Text>
                    ) : null}
                  </View>
                  {isSelected && (
                    <SymbolView name="checkmark.circle.fill" size={22} tintColor="#30d158" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

// ─── Lesson card ──────────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  theme,
  onDelete,
  onSend,
}: {
  lesson: Lesson;
  theme: ReturnType<typeof useTheme>;
  onDelete: (id: string) => void;
  onSend: (id: string, topic: string) => void;
}) {
  const date = new Date(lesson.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = () => {
    Alert.alert('Delete Lesson', `Delete "${lesson.topic}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(lesson.id) },
    ]);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={styles.lessonIcon}>
            <SymbolView name="book.fill" size={16} tintColor="#fff" />
          </View>
          <Text style={[styles.cardTopic, { color: theme.text }]} numberOfLines={1}>
            {lesson.topic}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <SymbolView name="trash" size={18} tintColor="#ff453a" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.cardAssignment, { color: theme.textSecondary }]} numberOfLines={3}>
        {lesson.assignment}
      </Text>

      {lesson.scanTarget ? (
        <View style={styles.scanTargetBadge}>
          <Text style={styles.scanTargetText}>🔍 Scan: {lesson.scanTarget}</Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardBadgeText}>⚡ {lesson.xpReward} XP</Text>
        </View>
        <View style={[styles.rewardBadge, styles.pointsBadge]}>
          <Text style={[styles.rewardBadgeText, styles.pointsBadgeText]}>
            🌿 {lesson.pointsReward} pts
          </Text>
        </View>
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => onSend(lesson.id, lesson.topic)}
        >
          <Text style={styles.sendBtnText}>Send →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type SendTarget = { lessonId: string; lessonTopic: string } | null;

export default function LessonsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [lessons, setLessons]           = useState<Lesson[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [sendTarget, setSendTarget]     = useState<SendTarget>(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    LessonsService.load().then((l) => {
      setLessons(l);
      setLoading(false);
    });
  }, []);

  const handleCreate = useCallback(
    async (data: Omit<Lesson, 'id' | 'createdAt'>) => {
      const lesson = await LessonsService.add(data);
      setLessons((prev) => [lesson, ...prev]);
      setModalVisible(false);
      // Immediately open send-to-students for the new lesson
      setSendTarget({ lessonId: lesson.id, lessonTopic: lesson.topic });
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    await LessonsService.remove(id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleSendToStudents = useCallback(async (studentIds: string[]) => {
    if (!sendTarget) return;
    const lessonId = sendTarget.lessonId;
    setSendTarget(null);

    const results = await Promise.all(
      studentIds.map((id) => LessonsService.sendToStudentById(lessonId, id))
    );

    const sent  = results.filter((r) => r === 'ok').length;
    const dupes = results.filter((r) => r !== 'ok' && r !== 'error').length;
    if (sent > 0) {
      Alert.alert('Sent! 🎉', `Lesson assigned to ${sent} student${sent !== 1 ? 's' : ''}.`);
    } else if (dupes > 0) {
      Alert.alert('Already sent', 'These students already have this lesson.');
    } else {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }, [sendTarget]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={24} tintColor="#0a84ff" />
          <Text style={styles.backText}>Activity</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Lessons</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <SymbolView name="plus.circle.fill" size={28} tintColor="#30d158" />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? null : lessons.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No lessons yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Tap + to create your first lesson
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              theme={theme}
              onDelete={handleDelete}
              onSend={(id, topic) => setSendTarget({ lessonId: id, lessonTopic: topic })}
            />
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <CreateLessonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreate}
      />

      <SendStudentModal
        visible={!!sendTarget}
        lessonTopic={sendTarget?.lessonTopic ?? ''}
        onClose={() => setSendTarget(null)}
        onSend={handleSendToStudents}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
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
  backText: {
    color: '#0a84ff',
    fontSize: 17,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 8,
  },

  // List
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 60,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 15, textAlign: 'center' },

  // Lesson card
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lessonIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#0a84ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopic: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  cardAssignment: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  rewardBadge: {
    backgroundColor: '#ff9f0a22',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  rewardBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff9f0a',
  },
  pointsBadge: {
    backgroundColor: '#30d15822',
  },
  pointsBadgeText: {
    color: '#30d158',
  },
  cardDate: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  sendBtn: {
    marginLeft: 'auto',
    backgroundColor: '#0a84ff22',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a84ff',
  },
  sendLessonHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#38383a',
  },
  sendTopicHint: {
    fontSize: 14,
    flex: 1,
  },
  centerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  studentRowSelected: {
    borderWidth: 1.5,
    borderColor: '#30d158',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#38383a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarSelected: {
    backgroundColor: '#30d15833',
  },
  studentAvatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentEmail: {
    fontSize: 13,
  },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalCancel: { paddingVertical: 4, paddingHorizontal: 4 },
  modalCancelText: { color: '#0a84ff', fontSize: 17 },
  modalSave: { paddingVertical: 4, paddingHorizontal: 4 },
  modalSaveText: { color: '#30d158', fontSize: 17, fontWeight: '600' },
  modalScroll: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },

  // Form
  fieldLabel: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 110,
    paddingTop: 14,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardField: { flex: 1 },
  fieldHint: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 6,
    marginBottom: 4,
  },
  scanTargetBadge: {
    backgroundColor: '#0a84ff18',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  scanTargetText: {
    fontSize: 13,
    color: '#0a84ff',
    fontWeight: '600',
  },
});
