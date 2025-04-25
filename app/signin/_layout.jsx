import { useState, useContext } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, Image } from "react-native";
import { AuthContext } from "../../contexts/authContext";
import { useRouter } from "expo-router";
import { useCreds } from "creds";

export default function SignIn() {
  const Creds = useCreds();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      const response = await fetch(`${Creds.BackendUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        await login(data.user, data.token);
        router.replace("/");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      // console.error(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View className="flex-1 justify-center px-5 bg-gray-100">
      
      {/* Logo */}
      <Image
        source={require("../../assets/icon.png")}
        width={24}
        height={24}
        className="w-24 h-24 self-center mb-5 rounded-full"
      /> 

      <Text className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome Back!</Text>
      <Text className="text-lg text-center text-gray-600 mb-6">Please sign in to continue</Text>

      {/* Username Input */}
      <TextInput
        placeholder="Username"
        placeholderTextColor="#aaa"
        onChangeText={setUsername}
        value={username}
        className="bg-white p-4 rounded-lg mb-3 border border-gray-300 text-base text-gray-900"
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        className="bg-white p-4 rounded-lg mb-3 border border-gray-300 text-base text-gray-900"
      />

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => router.push("/reset-password")} className="self-end mb-4">
        <Text className="text-orange-600 text-sm">Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity onPress={handleLogin} className="bg-orange-600 p-4 rounded-lg mt-3">
        <Text className="text-white text-lg font-bold text-center">Login</Text>
      </TouchableOpacity>
    </View>
  );
}
