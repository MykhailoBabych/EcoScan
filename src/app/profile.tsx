import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useProfile } from '@/contexts/ProfileContext';

const ORIGINAL_WIDTH = 341;
const ORIGINAL_HEIGHT = 512;

const SCALE = 2.8;

const DISPLAY_WIDTH = ORIGINAL_WIDTH / SCALE;
const DISPLAY_HEIGHT = ORIGINAL_HEIGHT / SCALE;
const FULL_IMAGE_WIDTH = DISPLAY_WIDTH * 3;
const FULL_IMAGE_HEIGHT = DISPLAY_HEIGHT * 3;

const CIRCLE_SIZE = DISPLAY_WIDTH;

export default function ProfileScreen() {
  const { 
    step, setStep, 
    characterIndex, setCharacterIndex, 
    name, setName 
  } = useProfile();

  const handleNext = () => {
    setCharacterIndex((characterIndex + 1) % 9);
  };

  const handlePrev = () => {
    setCharacterIndex((characterIndex - 1 + 9) % 9);
  };

  const col = characterIndex % 3;
  const row = Math.floor(characterIndex / 3);

  const translateX = -(col * DISPLAY_WIDTH) || 0;
  const translateY = -(row * DISPLAY_HEIGHT) || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {step === 'initial' && (
          <View style={styles.centerContainer}>
            <SymbolView name="person.crop.circle.badge.plus" size={80} tintColor="#0a84ff" style={{marginBottom: 20}} />
            <TouchableOpacity style={styles.button} onPress={() => setStep('selecting')}>
              <Text style={styles.buttonText}>Choose Your Character</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'selecting' && (
          <View style={styles.centerContainer}>
            <Text style={styles.title}>Select Avatar</Text>
            
            <View style={styles.row}>
              <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
                <SymbolView name="chevron.left.circle.fill" size={40} tintColor="#38383a" />
              </TouchableOpacity>

              <View style={styles.spriteContainer}>
                <Image 
                  source={require('@/assets/images/guys.png')} 
                  style={[
                    styles.spriteImage, 
                    { 
                      left: translateX,
                      top: translateY 
                    }
                  ]} 
                />
              </View>

              <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
                <SymbolView name="chevron.right.circle.fill" size={40} tintColor="#38383a" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => setStep('naming')}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'naming' && (
          <View style={styles.centerContainer}>
            <Text style={styles.title}>What's your name?</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your name" 
              value={name}
              onChangeText={setName}
              placeholderTextColor="#8e8e93"
              autoFocus
            />
            <TouchableOpacity 
              style={[styles.button, !name.trim() && styles.disabledButton]} 
              disabled={!name.trim()}
              onPress={() => name.trim() && setStep('done')}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'done' && (
          <View style={styles.centerContainer}>
            <View style={styles.profileCard}>
              <View style={[styles.spriteContainer, { marginBottom: 20, borderWidth: 4 }]}>
                <Image 
                  source={require('@/assets/images/guys.png')} 
                  style={[
                    styles.spriteImage, 
                    { 
                      left: translateX,
                      top: translateY 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileStatus}>Ready to scan!</Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#0a84ff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#0a84ff50',
  },
  buttonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
  },
  arrowButton: {
    padding: 10,
  },
  spriteContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
    borderWidth: 3,
    borderColor: '#0a84ff',
    marginHorizontal: 20,
  },
  spriteImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FULL_IMAGE_WIDTH,
    height: FULL_IMAGE_HEIGHT,
  },
  input: {
    width: '100%',
    backgroundColor: '#1c1c1e',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 17,
    marginBottom: 10,
  },
  profileCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  profileStatus: {
    fontSize: 15,
    color: '#8e8e93',
  },
});