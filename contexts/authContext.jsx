// authContext.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

// Create the AuthContext
export const AuthContext = createContext();

// Custom hook for accessing AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          setUserToken({token});
        }
        setAuthLoading(false);
      } catch (error) {
        console.error("Error loading token:", error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (user, token) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userProfile", JSON.stringify(user));
      setUserProfile(user);
      setUserToken(token);
      router.replace("/"); // Redirect after login
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      setUserToken(null);
      router.replace("/signin"); // Redirect after logout
    } catch (error) {
      console.error("Error removing token:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ userProfile, userToken, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
