import { Ionicons } from "@expo/vector-icons";
import { useCreds } from "creds";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/authContext";

export default function EditEmployeeScreen() {
  const Creds = useCreds();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { userToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobCategory: "",
    jobTitle: "",
    role: "",
  });

  // Fetch current employee details
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${Creds.BackendUrl}/app-api/users/${id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        const data = await response.json();
        if (response.ok) {
          setFormData({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            jobCategory: data.jobCategory,
            jobTitle: data.jobTitle,
            role: data.role,
          });
        } else {
          Alert.alert("Error", data.message || "Failed to fetch employee details.");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, userToken]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${Creds.BackendUrl}/app-api/users/update-user/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Employee updated successfully!");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Failed to update employee.");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6200ee" />
        <Text className="mt-2 text-lg text-gray-500">Loading employee details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 bg-gray-100">
      <TouchableOpacity onPress={() => router.back()} className="absolute top-5 left-2">
        <Ionicons name="arrow-back" size={27} color="black" />
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-gray-800 mt-20 text-center">Edit Employee</Text>
      <Text className="text-center text-sm text-gray-500 mb-6">
        Update the employee's details below. Make sure all information is accurate.
      </Text>

      {/* Full Name */}
      <View className="mb-3">
        <Text className="text-md font-semibold text-gray-800">Full Name</Text>
        <TextInput
          placeholder="Full Name"
          value={formData.fullName}
          onChangeText={(text) => handleChange("fullName", text)}
          className="p-4 bg-white rounded-lg border border-gray-300"
        />
      </View>

      {/* Email */}
      <View className="mb-3">
        <Text className="text-md font-semibold text-gray-800">Email Address</Text>
        <TextInput
          placeholder="Email"
          value={formData.email}
          keyboardType="email-address"
          onChangeText={(text) => handleChange("email", text)}
          className="p-4 bg-white rounded-lg border border-gray-300"
        />
      </View>

      {/* Phone */}
      <View className="mb-3">
        <Text className="text-md font-semibold text-gray-800">Phone Number</Text>
        <TextInput
          placeholder="Phone"
          value={formData.phone}
          keyboardType="phone-pad"
          onChangeText={(text) => handleChange("phone", text)}
          className="p-4 bg-white rounded-lg border border-gray-300"
        />
      </View>

      {/* Location */}
      <View className="mb-3">
        <Text className="text-md font-semibold text-gray-800">Location</Text>
        <TextInput
          placeholder="Location"
          value={formData.location}
          onChangeText={(text) => handleChange("location", text)}
          className="p-4 bg-white rounded-lg border border-gray-300"
        />
      </View>

      {/* Job Category */}
      <View className="mb-3">
        <Text className="text-md font-semibold text-gray-800">Job Category</Text>
        <TextInput
          placeholder="Job Category"
          value={formData.jobCategory}
          onChangeText={(text) => handleChange("jobCategory", text)}
          className="p-4 bg-white rounded-lg border border-gray-300"
        />
      </View>

      {/* Job Title */}
      <View className="mb-3">
        <Text className="text-md font-semibold text-gray-800">Job Title</Text>
        <TextInput
          placeholder="Job Title"
          value={formData.jobTitle}
          onChangeText={(text) => handleChange("jobTitle", text)}
          className="p-4 bg-white rounded-lg border border-gray-300"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-orange-600 p-4 rounded-lg mt-4 items-center"
      >
        <Text className="text-white text-lg font-semibold">Update Employee</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
