import { Image, View, StyleSheet } from 'react-native';

const ORIGINAL_WIDTH = 341;
const ORIGINAL_HEIGHT = 512;
const SCALE = 2.8;
const DISPLAY_WIDTH = ORIGINAL_WIDTH / SCALE;
const DISPLAY_HEIGHT = ORIGINAL_HEIGHT / SCALE;

type Props = {
  characterIndex: number;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
};

export function Avatar({
  characterIndex,
  size = DISPLAY_WIDTH,
  borderColor = '#0a84ff',
  borderWidth = 3,
}: Props) {
  const col = characterIndex % 3;
  const row = Math.floor(characterIndex / 3);

  // Scale sprite proportionally to requested size
  const scale = size / DISPLAY_WIDTH;
  const spriteW = DISPLAY_WIDTH * 3 * scale;
  const spriteH = DISPLAY_HEIGHT * 3 * scale;
  const translateX = -(col * DISPLAY_WIDTH * scale);
  const translateY = -(row * DISPLAY_HEIGHT * scale);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          borderWidth,
        },
      ]}
    >
      <Image
        source={require('../../assets/images/guys.png')}
        style={{
          position: 'absolute',
          width: spriteW,
          height: spriteH,
          left: translateX,
          top: translateY,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
  },
});
