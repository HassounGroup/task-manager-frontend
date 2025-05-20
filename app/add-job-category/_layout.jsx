import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCreds } from "creds";

export default function AddJobCategoryScreen() {
    const Creds = useCreds();
    const [categoryName, setCategoryName] = useState("");
    const router = useRouter();

    const handleAddCategory = () => {
        if (categoryName.trim() === "") {
            alert("Please enter a category name");
            return;
        }

        // Make an API call to save the category in the database
        fetch(`${Creds.BackendUrl}/api/job-categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: categoryName }),
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
                    alert("Job category added successfully");
                    router.push("/settings"); // Navigate to settings page
                } else {
                    alert("Failed to add job category");
                }
            })
            .catch(error => {
                console.error("Error adding category:", error);
                alert("Error adding category: " + error.message);
            });
    };

    return (
        <View className="flex-1 justify-center items-center p-5">
            <TouchableOpacity onPress={() => router.back()} className="absolute top-5 left-4 p-2">
                <Ionicons name="arrow-back" size={25} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-orange-600">Add Job Category</Text>
            <Text className="text-sm text-gray-500 mb-12">
                Please enter a unique and descriptive Job category name
            </Text>
            <TextInput
                className="w-full p-3 border border-gray-300 rounded-md mb-5 min-h-14"
                placeholder="Enter category name"
                value={categoryName}
                onChangeText={setCategoryName}
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
