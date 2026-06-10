import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { UseType, SchoolRole } from '@/services/profile';
import { signUpWithEmail, signInWithEmail } from '@/services/supabase';

// ─── Sprite constants ─────────────────────────────────────────────────────────

const ORIGINAL_WIDTH  = 341;
const ORIGINAL_HEIGHT = 512;
const SCALE           = 2.8;
const DISPLAY_WIDTH   = ORIGINAL_WIDTH  / SCALE;
const DISPLAY_HEIGHT  = ORIGINAL_HEIGHT / SCALE;
const FULL_IMAGE_WIDTH  = DISPLAY_WIDTH  * 3;
const FULL_IMAGE_HEIGHT = DISPLAY_HEIGHT * 3;
const CIRCLE_SIZE = DISPLAY_WIDTH;

type Step = 'welcome' | 'selecting' | 'naming' | 'usetype' | 'schoolrole' | 'auth';
type AuthMode = 'signup' | 'signin';

export default function OnboardingScreen() {
  const { completeOnboarding, reloadProfile } = useProfile();

  const [step, setStep]               = useState<Step>('welcome');
  const [characterIndex, setCharacterIndex] = useState(0);
  const [name, setName]               = useState('');
  const [pendingUseType, setPendingUseType]     = useState<UseType>('personal');
  const [pendingSchoolRole, setPendingSchoolRole] = useState<SchoolRole | null>(null);

  // Auth step state
  const [authMode, setAuthMode]   = useState<AuthMode>('signup');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [authError, setAuthError] = useState('');
  const [saving, setSaving]       = useState(false);

  const col        = characterIndex % 3;
  const row        = Math.floor(characterIndex / 3);
  const translateX = -(col * DISPLAY_WIDTH)  || 0;
  const translateY = -(row * DISPLAY_HEIGHT) || 0;

  const handleNext = () => setCharacterIndex((i) => (i + 1) % 9);
  const handlePrev = () => setCharacterIndex((i) => (i - 1 + 9) % 9);

  const goToAuth = (useType: UseType, schoolRole: SchoolRole | null) => {
    setPendingUseType(useType);
    setPendingSchoolRole(schoolRole);
    setAuthMode('signup');
    setAuthError('');
    setStep('auth');
  };

  const handleAuthSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || password.length < 6) return;
    setSaving(true);
    setAuthError('');

    try {
      if (authMode === 'signup') {
        const { sessionCreated, error } = await signUpWithEmail(trimmedEmail, password);
        if (error) {
          setAuthError(error);
          return;
        }
        if (!sessionCreated) {
          // Email confirmation required — switch to sign-in and prompt user
          setAuthError('Check your email to confirm your account, then sign in below.');
          setAuthMode('signin');
          return;
        }
        // Session created — save the full profile
        await completeOnboarding(name.trim(), characterIndex, pendingUseType, pendingSchoolRole, trimmedEmail);
      } else {
        const { error } = await signInWithEmail(trimmedEmail, password);
        if (error) {
          setAuthError(error);
          return;
        }
        if (name.trim()) {
          // New user completing onboarding after email confirmation
          await completeOnboarding(name.trim(), characterIndex, pendingUseType, pendingSchoolRole, trimmedEmail);
        } else {
          // Returning user — reload existing profile from Supabase
          await reloadProfile();
        }
      }
    } catch (e: any) {
      setAuthError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      // Always stop the spinner — even if the component unmounts React ignores this safely
      setSaving(false);
    }
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

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => {
              setAuthMode('signin');
              setAuthError('');
              setStep('auth');
            }}
          >
            <Text style={styles.toggleAuthText}>Already have an account? Sign In</Text>
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
                source={require('../../assets/images/guys.png')}
                style={[styles.spriteImage, { transform: [{ translateX }, { translateY }] }]}
                transition={0}
              />
            </View>

            <TouchableOpacity onPress={handleNext} style={styles.arrowBtn}>
              <SymbolView name="chevron.right.circle.fill" size={40} tintColor="#38383a" />
            </TouchableOpacity>
          </View>

          <Text style={styles.avatarCounter}>{characterIndex + 1} / 9</Text>

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
  if (step === 'naming') {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.center}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.spriteContainer, styles.nameStepAvatar]}>
            <Image
              source={require('../../assets/images/guys.png')}
              style={[styles.spriteImage, { transform: [{ translateX }, { translateY }] }]}
              transition={0}
            />
          </View>

          <Text style={styles.stepTitle}>What's your name?</Text>
          <Text style={styles.stepSubtitle}>You'll earn Eco Points for every scan</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#8e8e93"
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={24}
            returnKeyType="done"
            onSubmitEditing={() => name.trim() && setStep('usetype')}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, !name.trim() && styles.disabledBtn]}
            disabled={!name.trim()}
            onPress={() => setStep('usetype')}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => setStep('selecting')}>
            <Text style={styles.backLinkText}>← Back</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Use type step ─────────────────────────────────────────────────────────────
  if (step === 'usetype') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.logo}>🏫</Text>
          <Text style={styles.stepTitle}>How will you use EcoScan?</Text>
          <Text style={styles.stepSubtitle}>Choose how you'll be using the app</Text>

          <View style={styles.roleButtonGroup}>
            <TouchableOpacity
              style={styles.roleBtn}
              onPress={() => goToAuth('personal', null)}
            >
              <Text style={styles.roleBtnIcon}>🌱</Text>
              <Text style={styles.roleBtnTitle}>Personal Use</Text>
              <Text style={styles.roleBtnSub}>Track your own eco-impact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleBtn}
              onPress={() => setStep('schoolrole')}
            >
              <Text style={styles.roleBtnIcon}>🎓</Text>
              <Text style={styles.roleBtnTitle}>School Use</Text>
              <Text style={styles.roleBtnSub}>For teachers &amp; students</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => setStep('naming')}>
            <Text style={styles.backLinkText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── School role step ──────────────────────────────────────────────────────────
  if (step === 'schoolrole') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.stepTitle}>What's your role?</Text>
          <Text style={styles.stepSubtitle}>This helps us tailor the experience for you</Text>

          <View style={styles.roleButtonGroup}>
            <TouchableOpacity
              style={styles.roleBtn}
              onPress={() => goToAuth('school', 'teacher')}
            >
              <Text style={styles.roleBtnIcon}>🧑‍🏫</Text>
              <Text style={styles.roleBtnTitle}>Teacher</Text>
              <Text style={styles.roleBtnSub}>I guide students in class</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleBtn}
              onPress={() => goToAuth('school', 'student')}
            >
              <Text style={styles.roleBtnIcon}>📚</Text>
              <Text style={styles.roleBtnTitle}>Student</Text>
              <Text style={styles.roleBtnSub}>I'm learning about eco-care</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => setStep('usetype')}>
            <Text style={styles.backLinkText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Auth step ─────────────────────────────────────────────────────────────────
  if (step === 'auth') {
    const isSignUp    = authMode === 'signup';
    const canSubmit   = email.trim().length > 0 && password.length >= 6 && !saving;
    const backStep: Step = pendingSchoolRole !== null ? 'schoolrole' : 'usetype';

    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.center}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.logo}>{isSignUp ? '🔐' : '👋'}</Text>
          <Text style={styles.stepTitle}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.stepSubtitle}>
            {isSignUp
              ? 'Secure your progress across devices'
              : 'Sign in to access your profile'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8e8e93"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={100}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#8e8e93"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            maxLength={72}
          />

          {authError ? (
            <Text style={styles.errorText}>{authError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, !canSubmit && styles.disabledBtn]}
            disabled={!canSubmit}
            onPress={handleAuthSubmit}
          >
            <Text style={styles.primaryBtnText}>
              {saving ? '…' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => {
              setAuthError('');
              setAuthMode(isSignUp ? 'signin' : 'signup');
            }}
          >
            <Text style={styles.toggleAuthText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : 'New here? Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Only show Back if we came from onboarding steps, not from welcome sign-in link */}
          {isSignUp && (
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => setStep(backStep)}
            >
              <Text style={styles.backLinkText}>← Back</Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return null;
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
  safe:   { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },

  logo:    { fontSize: 72, marginBottom: 8 },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1, marginBottom: 8 },
  tagline: { fontSize: 17, color: '#8e8e93', textAlign: 'center', lineHeight: 24, marginBottom: 36 },

  featureList: { width: '100%', gap: 14, marginBottom: 44 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  featureText: { fontSize: 16, color: '#ebebf5cc' },

  primaryBtn: {
    backgroundColor: '#30d158',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  disabledBtn:     { opacity: 0.4 },
  primaryBtnText:  { fontSize: 17, fontWeight: '700', color: '#fff' },

  stepTitle:    { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  stepSubtitle: { fontSize: 15, color: '#8e8e93', marginBottom: 36, textAlign: 'center' },

  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  arrowBtn:  { padding: 10 },

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
  nameStepAvatar: { marginBottom: 28, borderColor: '#0a84ff' },
  avatarCounter:  { color: '#8e8e93', fontSize: 14, marginBottom: 32 },

  input: {
    width: '100%',
    backgroundColor: '#1c1c1e',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 17,
    marginBottom: 12,
  },

  errorText: {
    color: '#ff453a',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },

  backLink:       { marginTop: 16, padding: 8 },
  backLinkText:   { color: '#8e8e93', fontSize: 15 },
  toggleAuthText: { color: '#0a84ff', fontSize: 15 },

  roleButtonGroup: { width: '100%', gap: 14, marginBottom: 8 },
  roleBtn: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38383a',
  },
  roleBtnIcon:  { fontSize: 36, marginBottom: 8 },
  roleBtnTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  roleBtnSub:   { fontSize: 13, color: '#8e8e93', textAlign: 'center' },
});
