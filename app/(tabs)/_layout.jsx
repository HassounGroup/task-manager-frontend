import { useEffect, useState, useContext } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { AuthContext } from "../../contexts/authContext";
import { useCreds } from "creds";

export default function TabLayout() {
  const Creds = useCreds();
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { userProfile } = useContext(AuthContext);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (userProfile) {
          // setUserToken(token);
        } else {
          router.replace("/signin"); // Redirect to login if no token
        }
      } catch (error) {
        // console.error("Error checking auth:", error);
        router.replace("/signin"); // On error, redirect to login
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e6560e" />
      </View>
    );
  }

  // Render top bar with logo and user details
  const renderHeader = () => (
    <View className="flex-row justify-between items-center px-4 py-4 bg-white/60 drop-shadow-md">
      <TouchableOpacity
        onPress={() => router.push("/news")}
      >
        <Ionicons name="notifications" size={24} color={"#e6560e"} />
      </TouchableOpacity>

      {/* <Image
        source={require("../../assets/Hassoun.png")} // Replace with your logo path
        style={styles.logo}
      /> */}
      <View className="flex-row items-center">
        <Text className="text-black font-bold text-xl">{userProfile?.username || "User"}</Text>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
        >
          {userProfile?.profilePic ? (
            <Image
              source={{ uri: `${Creds.BackendUrl}${userProfile?.profilePic}` }}
              className="w-10 h-10 rounded-full ml-3 border border-orange-600"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-orange-600 justify-center content-center ml-2">
              <Text className="text-white font-bold text-center text-2xl">
                {userProfile?.username?.[0].toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {renderHeader()}
      <Tabs
        // initialRouteName="tasks"
        screenOptions={{
          tabBarActiveTintColor: "#e6560e",
          tabBarStyle: { backgroundColor: "#f8f9fa", height: 60 },
          headerShown: false,

        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "My Tasks",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="todo"
          options={{
            title: "To-Do",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkbox-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: "contain",
  },
});
