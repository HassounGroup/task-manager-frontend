import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCreds } from "creds";

export default function AddLocationScreen() {
    const Creds = useCreds();
    const [location, setLocation] = useState("");
    const router = useRouter();

    const handleAddCategory = () => {
        if (location.trim() === "") {
            alert("Please enter a category name");
            return;
        }

        // Make an API call to save the category in the database
        fetch(`http://192.168.1.220:8000/api/locations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: location }),
        })
            .then(response => {
                if (!response.ok) {
                    // If response is not ok, throw an error with the status code
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Check if the data is valid, then navigate to the settings page
                if (data._id) {
                    alert("Job Location added successfully");
                    router.push("/settings"); // Navigate to settings page
                } else {
                    alert("Failed to add job Location");
                }
            })
            .catch(error => {
                console.error("Error adding Location:", error);
                alert("Error adding Location: " + error.message);
            });
    };

    return (
        <View className="flex-1 justify-center items-center p-5">
            <TouchableOpacity onPress={() => router.back()} className="absolute top-10 left-5 p-2">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-orange-600">Add Location</Text>
            <Text className="text-sm text-gray-500 mb-12">
                Enter the name of the new job/office location.
            </Text>
            <TextInput
                className="w-full p-3 border border-gray-300 rounded-md mb-5 min-h-14"
                placeholder="Enter category name"
                value={location}
                onChangeText={setLocation}
            />
            <TouchableOpacity
                className="bg-orange-600 flex-row justify-center items-center p-4 rounded-md w-full"
                onPress={handleAddCategory}
            >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text className="text-white ml-3 text-lg">Add Category</Text>
            </TouchableOpacity>
        </View>
    );
}
