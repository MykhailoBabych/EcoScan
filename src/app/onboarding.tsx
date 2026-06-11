import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

// ─── Sprite constants (same as profile.tsx) ───────────────────────────────────

const ORIGINAL_WIDTH = 341;
const ORIGINAL_HEIGHT = 512;
const SCALE = 2.8;
const DISPLAY_WIDTH = ORIGINAL_WIDTH / SCALE;
const DISPLAY_HEIGHT = ORIGINAL_HEIGHT / SCALE;
const FULL_IMAGE_WIDTH = DISPLAY_WIDTH * 3;
const FULL_IMAGE_HEIGHT = DISPLAY_HEIGHT * 3;
const CIRCLE_SIZE = DISPLAY_WIDTH;

type Step = 'welcome' | 'selecting' | 'naming';

export default function OnboardingScreen() {
  const { completeOnboarding } = useProfile();
  const [step, setStep] = useState<Step>('welcome');
  const [characterIndex, setCharacterIndex] = useState(0);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const col = characterIndex % 3;
  const row = Math.floor(characterIndex / 3);
  const translateX = -(col * DISPLAY_WIDTH) || 0;
  const translateY = -(row * DISPLAY_HEIGHT) || 0;

  const handleNext = () => setCharacterIndex((i) => (i + 1) % 9);
  const handlePrev = () => setCharacterIndex((i) => (i - 1 + 9) % 9);

  const handleFinish = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await completeOnboarding(name.trim(), characterIndex);
    // _layout will react to isProfileComplete and unmount this screen
  };

  // ── Welcome step ─────────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.appName}>EcoScan</Text>
          <Text style={styles.tagline}>
            Scan waste. Earn points.{'\n'}Help the planet.
          </Text>

          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setStep('selecting')}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Avatar selection step ────────────────────────────────────────────────────
  if (step === 'selecting') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.stepTitle}>Choose Your Avatar</Text>
          <Text style={styles.stepSubtitle}>This will represent you in the app</Text>

          <View style={styles.avatarRow}>
            <TouchableOpacity onPress={handlePrev} style={styles.arrowBtn}>
              <SymbolView name="chevron.left.circle.fill" size={40} tintColor="#38383a" />
            </TouchableOpacity>

            <View style={styles.spriteContainer}>
              <Image
                source={require('@/assets/images/guys.png')}
                style={[styles.spriteImage, { left: translateX, top: translateY }]}
              />
            </View>

            <TouchableOpacity onPress={handleNext} style={styles.arrowBtn}>
              <SymbolView name="chevron.right.circle.fill" size={40} tintColor="#38383a" />
            </TouchableOpacity>
          </View>

          <Text style={styles.avatarCounter}>
            {characterIndex + 1} / 9
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setStep('naming')}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Name step ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.center}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Selected avatar preview */}
        <View style={[styles.spriteContainer, styles.nameStepAvatar]}>
          <Image
            source={require('@/assets/images/guys.png')}
            style={[styles.spriteImage, { left: translateX, top: translateY }]}
          />
        </View>

        <Text style={styles.stepTitle}>What's your name?</Text>
        <Text style={styles.stepSubtitle}>
          You'll earn Eco Points for every scan
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#8e8e93"
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={handleFinish}
        />

        <TouchableOpacity
          style={[styles.primaryBtn, (!name.trim() || saving) && styles.disabledBtn]}
          disabled={!name.trim() || saving}
          onPress={handleFinish}
        >
          <Text style={styles.primaryBtnText}>
            {saving ? 'Saving…' : 'Start Scanning 🌿'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => setStep('selecting')}
        >
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '📷', text: 'Scan any waste item instantly' },
  { icon: '♻️', text: 'Get recycling & upcycling advice' },
  { icon: '🗺️', text: 'Find nearby recycling points' },
  { icon: '🏆', text: 'Earn Eco Points & level up' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    fontSize: 72,
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 17,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  featureList: {
    width: '100%',
    gap: 14,
    marginBottom: 44,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#ebebf5cc',
  },
  primaryBtn: {
    backgroundColor: '#30d158',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#8e8e93',
    marginBottom: 36,
    textAlign: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrowBtn: {
    padding: 10,
  },
  spriteContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
    borderWidth: 3,
    borderColor: '#30d158',
    marginHorizontal: 20,
  },
  spriteImage: {
    position: 'absolute',
    width: FULL_IMAGE_WIDTH,
    height: FULL_IMAGE_HEIGHT,
  },
  nameStepAvatar: {
    marginBottom: 28,
    borderColor: '#0a84ff',
  },
  avatarCounter: {
    color: '#8e8e93',
    fontSize: 14,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#1c1c1e',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 17,
    marginBottom: 16,
  },
  backLink: {
    marginTop: 16,
    padding: 8,
  },
  backLinkText: {
    color: '#8e8e93',
    fontSize: 15,
  },
});
