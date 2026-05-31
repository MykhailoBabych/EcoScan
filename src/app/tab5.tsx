import { View, Text, StyleSheet } from 'react-native';

export default function Tab5Screen() {
  return (
    <View style={[styles.container, { backgroundColor: '#AF52DE' }]}>
      <Text style={styles.text}>Purple Tab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});