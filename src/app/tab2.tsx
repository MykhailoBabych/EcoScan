import { StyleSheet, Text, View } from "react-native";

export default function Tab2Screen() {
  return (
    <View style={[styles.container, { backgroundColor: "#007AFF" }]}>
      <Text style={styles.text}>Blue Tab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});
