import { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/authContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreds } from "creds";

export default function SettingsScreen() {
  const Creds = useCreds();
  const router = useRouter();
  const { userToken, logout, userProfile } = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (userProfile) {
      // console.log("User Profile Loaded:", userProfile);
    }
  }, [userProfile]);

  const userRole = userProfile?.role || "employee"; // Adjust if needed

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <SafeAreaView className="flex-1">
    <View
      contentContainerStyle={{ paddingBottom: 30 }}
      className="flex-1 justify-center bg-gray-100 px-4"
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute -top-10 left-5 p-0 rounded-full"
      >
        <Ionicons name="arrow-back" size={25} color="black" />
      </TouchableOpacity>

      {/* <View className="items-center mt-12 flex-row justify-center gap-6">
        <Image
          source={{
            uri: userProfile?.profilePic
              ? `${Creds.BackendUrl}${userProfile.profilePic}`
              : "https://github.com/HassounGroup/Assets/blob/main/defualt.png?raw=true",
          }}
          className="w-24 h-24 rounded-full border-2 border-gray-600"
        />
        <View className="">
          <Text className="text-2xl font-bold text-gray-800 mt-2">
            {userProfile?.fullName || "User"}
          </Text>
          <Text className="text-lg text-gray-500">{userProfile?.jobTitle || "Employee"}</Text>
        </View>

      </View> */}

      <View>
        {/* Profile Info */}
        <TouchableOpacity
          className="flex-row items-center justify-between bg-white px-4 py-3 rounded-lg mb-2 min-h-16 mt-10"
          onPress={() => router.push("/user-profile")}
        >
          <View className="flex-row items-center">
            <Ionicons name="person-circle" size={22} color="#fffff" />
            <Text className="text-lg font-semibold ml-3">Profile Info</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={18} color="#fffff" />
        </TouchableOpacity>

        {/* Admin Options */}
        {userRole === "admin" && (
          <>
            <TouchableOpacity
              className="flex-row items-center justify-between bg-white px-4 py-3 rounded-lg mb-2 min-h-16"
              onPress={() => router.push("/manage-employees")}
            >
              <View className="flex-row items-center">
                <Ionicons name="people" size={21} color="#fffff" />
                <Text className="text-lg font-semibold ml-3">Manage Employees</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#fffff" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between bg-white px-4 py-3 rounded-lg mb-2 min-h-16"
              onPress={() => router.push("/manage-tasks")}
            >
              <View className="flex-row items-center">
                <Ionicons name="file-tray-full" size={21} color="#fffff" />
                <Text className="text-lg font-semibold ml-3">Manage Tasks</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#fffff" />
            </TouchableOpacity>

            {/* <TouchableOpacity
              className="flex-row items-center justify-between bg-white px-4 py-3 rounded-lg mb-2 min-h-16"
              onPress={() => router.push("/add-task")}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={22} color="#fffff" />
                <Text className="text-lg font-semibold ml-3">Assign New Task</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#fffff" />
            </TouchableOpacity> */}

            <TouchableOpacity
              className="flex-row items-center justify-between bg-white px-4 py-3 rounded-lg mb-2 min-h-16"
              onPress={() => router.push("/add-job-category")}
            >
              <View className="flex-row items-center">
                <Ionicons name="briefcase" size={20} color="#fffff" />
                <Text className="text-lg font-semibold ml-3">Add Job Category</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#fffff" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between bg-white px-4 py-3 rounded-lg mb-2 min-h-16"
              onPress={() => router.push("/add-location")}
            >
              <View className="flex-row items-center">
                <Ionicons name="earth" size={22} color="#fffff" />
                <Text className="text-lg font-semibold ml-3">Add Location</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#fffff" />
            </TouchableOpacity>
          </>
        )}

        {/* Change Password */}
        {/* <TouchableOpacity
          className="flex-row items-center justify-between bg-white px-4 py-3 rounded-lg mb-2 min-h-16"
          onPress={() => router.push("/change-password")}
        >
          <View className="flex-row items-center">
            <Ionicons name="lock-closed" size={24} color="#fffff" />
            <Text className="text-lg font-semibold ml-3">Change Password</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#fffff" />
        </TouchableOpacity> */}

        {/* Dark Mode Toggle */}
        {/* <View className="flex-row items-center justify-between bg-white px-4 py-2 rounded-lg mb-4">
          <Text className="text-lg font-semibold">Dark Mode</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View> */}

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-orange-600 px-4 py-3 rounded-lg flex-row items-center justify-center mt-6"
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text className="text-lg font-semibold text-white ml-3">Logout</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-col justify-center items-center mt-20">
      <Text className="text-gray-500 text-[0.7rem]">Hassoun Group ©2025</Text>
      <Text className="text-gray-500 text-[0.8rem]">Task manager application version 1.0</Text>
      {/* <Text className="text-gray-500 text-[0.6rem]">Developed by mohd mishab with ♥</Text> */}
      </View>
      
    </View>
    </SafeAreaView>
  );
}
