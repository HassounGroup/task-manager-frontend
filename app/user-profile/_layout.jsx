import { useContext, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/authContext";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useCreds } from "creds";

export default function UserProfileScreen() {
    const Creds = useCreds();
    const router = useRouter();
    const { userProfile } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(userProfile?.profilePic || "");
    const [uploading, setUploading] = useState(false);

    const selectImageSource = () => {
        Alert.alert("Upload Profile Photo", "Choose an option", [
            { text: "Camera", onPress: () => pickImage("camera") },
            { text: "Gallery", onPress: () => pickImage("gallery") },
            { text: "Cancel", style: "cancel" }
        ]);
    };

    const pickImage = async (source) => {
        try {
            let result;
            if (source === "camera") {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.5,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.5,
                });
            }

            if (!result.canceled) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log("Image picking error:", error);
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        let filename = uri.split("/").pop();
        let formData = new FormData();
        formData.append("file", { uri, name: filename, type: "image/jpeg" });

        try {
            const response = await axios.post(
                `${Creds.BackendUrl}/api/profile/upload/${userProfile._id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            const fileUrl = response.data.user.profilePic;
            setProfileImage(fileUrl);
        } catch (error) {
            console.log("Upload Error:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to upload the image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }} className="flex-1 bg-gray-100">
            {/* Back Button */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-6 left-4 p-0 rounded-full z-10"
            >
                <Ionicons name="arrow-back" size={25} color="white" />
            </TouchableOpacity>

            {/* Cover Photo Section */}
            <View className="h-44 w-full bg-gray-800">
                {/* <Image
                    source={require("../../assets/background.jpg")}
                    className="w-full h-full"
                    resizeMode="cover"
                /> */}
            </View>

            {/* Profile Image Section */}
            <View className="items-center -mt-20">
                <TouchableOpacity onPress={selectImageSource}>
                    <View className="relative">
                        <Image
                            source={{ uri: profileImage ? `${Creds.BackendUrl}${profileImage}` : "https://github.com/HassounGroup/Assets/blob/main/defualt.png?raw=true" }}
                            className="w-32 h-32 rounded-full border-4 border-white shadow-md"
                        />
                        {uploading && (
                            <View className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                <ActivityIndicator size="large" color="#FFFFFF" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <Text className="mt-3 text-2xl font-bold text-gray-800">{userProfile.fullName}</Text>
                <TouchableOpacity
                    onPress={selectImageSource}
                    className="flex-row gap-2 items-center mt-2 bg-gray-800 px-4 py-2 rounded-md shadow-md"
                >
                    <Ionicons name="image" size={20} color="white" />
                    <Text className="text-white font-semibold">Change Profile Photo</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Info Section */}
            <View className="mt-6 px-3">
                {[
                    { label: "Full Name", value: userProfile.fullName },
                    { label: "Username", value: userProfile.username },
                    { label: "Job Category", value: userProfile.jobCategory },
                    { label: "Job Title", value: userProfile.jobTitle },
                    { label: "Location", value: userProfile.location },
                ].map((item, index) => (
                    <View
                        key={index}
                        className="bg-white py-2 px-4 rounded-lg mb-2 shadow h-16"
                    >
                        <Text className="text-gray-500 text-sm">{item.label}</Text>
                        <Text className="text-lg font-semibold text-gray-800">{item.value || "Not specified"}</Text>
                    </View>
                ))}
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
                className="bg-white p-4 rounded-lg shadow flex-row justify-between items-center mx-3 min-h-16"
                onPress={() => router.push("/change-password")}
            >
                <Text className="text-lg font-semibold text-gray-800">Change Password</Text>
                <Ionicons name="create" size={24} color="black" />
            </TouchableOpacity>
        </ScrollView>
    );
}
