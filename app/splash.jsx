import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  useEffect(() => {
    setTimeout(() => {
      router.replace("/"); // Navigate to Home after 3 seconds
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to TaskManager</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
