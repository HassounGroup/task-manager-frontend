import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/authContext";
import './global.css';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { userToken, authLoading} = useAuth();
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  useEffect(() => {
    if (!authLoading && !userToken) {
      router.replace("/signin");
    }
  }, [authLoading, userToken]);

  useEffect(() => {
    if (!authLoading) {
      SplashScreen.hideAsync();
    }
  }, [authLoading]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#e6560e" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  );

  // return (
  //     <SafeAreaProvider>
  //       <SafeAreaView
  //         style={{ flex: 1, backgroundColor: "#f3f4f6" }} // light gray
  //         edges={['top', 'bottom', 'left', 'right']} // covers entire screen
  //       >
  //         <Slot />
  //       </SafeAreaView>
  //     </SafeAreaProvider>
  // );
}

export default function LayoutWrapper() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
