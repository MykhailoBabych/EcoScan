import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useState } from 'react';

// Заданные вами оригинальные размеры кадра (341x512)
const ORIGINAL_WIDTH = 341;
const ORIGINAL_HEIGHT = 512;

// Во сколько раз визуально уменьшить окно
const SCALE = 2.8;

const DISPLAY_WIDTH = ORIGINAL_WIDTH / SCALE;
const DISPLAY_HEIGHT = ORIGINAL_HEIGHT / SCALE;
const FULL_IMAGE_WIDTH = DISPLAY_WIDTH * 3;
const FULL_IMAGE_HEIGHT = DISPLAY_HEIGHT * 3;

export default function Tab4Screen() {
  const [step, setStep] = useState('initial'); // 'initial' | 'selecting' | 'naming' | 'done'
  const [characterIndex, setCharacterIndex] = useState(0);
  const [name, setName] = useState('');

  const handleNext = () => {
    setCharacterIndex((prev) => (prev + 1) % 9);
  };

  const handlePrev = () => {
    setCharacterIndex((prev) => (prev - 1 + 9) % 9);
  };

  // Вычисляем ряд и колонку (сетка 3x3)
  const col = characterIndex % 3;
  const row = Math.floor(characterIndex / 3);

  // Избавляемся от отрицательного нуля (-0), который иногда может вызывать баги при рендере в React Native
  const translateX = -(col * DISPLAY_WIDTH) || 0;
  const translateY = -(row * DISPLAY_HEIGHT) || 0;

  return (
    <View style={[styles.container, { backgroundColor: '#FFCC00' }]}>
      {step === 'initial' && (
        <TouchableOpacity style={styles.button} onPress={() => setStep('selecting')}>
          <Text style={styles.buttonText}>Choose your character</Text>
        </TouchableOpacity>
      )}

      {step === 'selecting' && (
        <View style={styles.selectionContainer}>
          <Text style={styles.title}>Choose your character</Text>
          
          <View style={styles.row}>
            <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
              <Text style={styles.arrowText}>{"<"}</Text>
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
              <Text style={styles.arrowText}>{">"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={() => setStep('naming')}>
            <Text style={styles.confirmText}>Готово!</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'naming' && (
        <View style={styles.namingContainer}>
          <Text style={styles.title}>Как вас зовут?</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter your name" 
            value={name}
            onChangeText={setName}
            placeholderTextColor="#666"
          />
          <TouchableOpacity 
            style={[styles.confirmButton, !name.trim() && styles.disabledButton]} 
            disabled={!name.trim()}
            onPress={() => name.trim() && setStep('done')}
          >
            <Text style={styles.confirmText}>Продолжить</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'done' && (
        <View style={styles.profileContainer}>
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
          <Text style={styles.profileName}>{name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectionContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  arrowButton: {
    padding: 20,
  },
  arrowText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  spriteContainer: {
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    marginHorizontal: 10,
  },
  spriteImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FULL_IMAGE_WIDTH,
    height: FULL_IMAGE_HEIGHT,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#88c999',
  },
  confirmText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  namingContainer: {
    alignItems: 'center',
    width: '80%',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  profileContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
    marginTop: 10,
  },
});