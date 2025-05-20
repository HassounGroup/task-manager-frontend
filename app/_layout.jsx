import './global.css';
import { useState, useEffect } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { AuthProvider } from "../contexts/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          router.push("/signin");
        } else {
          setIsAppReady(true);
        }
      } catch (error) {
        // Handle error
      } finally {
        setIsTokenChecked(true);
      }
    };

    loadToken();
  }, [router]);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn("Error preparing the app", error);
      } finally {
        await SplashScreen.hideAsync();
        setIsAppReady(true);
      }
    };

    if (isTokenChecked) {
      prepareApp();
    }
  }, [isTokenChecked]);

  if (!isAppReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#e6560e" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f3f4f6" }} // light gray
          edges={['top', 'bottom', 'left', 'right']} // covers entire screen
        >
          {/* <StatusBar
            animated={true}
            backgroundColor="white"
            barStyle="dark-content"
            showHideTransition="fade"
          /> */}
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
