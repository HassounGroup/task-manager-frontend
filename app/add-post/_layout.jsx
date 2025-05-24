import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useCreds } from "creds";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ProgressBar } from 'react-native-paper'; // Importing ProgressBar from react-native-paper
import { useAuth } from "../../contexts/authContext";

export default function CreatePostScreen({ navigation }) {
    const Creds = useCreds();
    const { userProfile, userToken } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [media, setMedia] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);  // State for tracking upload progress
    const router = useRouter();

    // ✅ Pick Media (Image or Video)
    const handlePickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            // allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            allowsMultipleSelection: true,
            selectionLimit: 3,
            quality: 0.5,
        });
        if (!result.cancelled) {
            setMedia(result.assets);
        }
    };

    // ✅ Submit Post
    const handleSubmit = async () => {
        if (!title.trim()) return Alert.alert("Title is required!");
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("userId", userProfile._id);

        // Attach Media
        media.forEach((item) => {
            formData.append("media", {
                uri: item.uri,
                type: item.type === "video" ? "video/mp4" : "image/jpeg",
                name: item.uri.split("/").pop(),
            });
        });

        try {
            setIsUploading(true);
            const response = await axios.post(`${Creds.BackendUrl}/app-api/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });
            Alert.alert("Success", "Post created!");
            router.back();
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Something went wrong");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View className="flex-1 p-4 bg-[#f3f4f6]">
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-10 left-4 p-0 rounded-full z-10"
            >
                <Ionicons name="arrow-back" size={27} color="black" />
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-black mb-4 mt-20">Create New Post</Text>

            <TextInput
                placeholder="Title"
                className="border border-gray-300 p-3 rounded-lg mb-4 text-base h-14"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                placeholder="Description"
                multiline
                className="border border-gray-300 p-3 rounded-lg mb-4 text-base h-14"
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity onPress={handlePickMedia} className="bg-[#e6560e] py-3 rounded-lg mb-4 justify-center items-center h-14">
                <Text className="text-white font-bold text-lg">Pick Media</Text>
            </TouchableOpacity>

            {media.length > 0 && (
                <View className="flex-row flex-wrap mb-4">
                    {media.map((item, idx) => (
                        <Image
                            key={idx}
                            source={{ uri: item.uri }}
                            className="w-20 h-20 rounded-lg m-1"
                        />
                    ))}
                </View>
            )}

            {isUploading && (
                <View className="mb-4">
                    <Text className="text-lg text-[#FF5733] text-center mb-2">Uploading...</Text>
                    <ProgressBar progress={uploadProgress / 100} color="#FF5733" className="h-2 rounded-lg" />
                </View>
            )}

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={isUploading}
                className={`bg-[#e6560e] py-3 rounded-lg justify-center items-center h-14 ${isUploading ? "bg-gray-300" : ""}`}
            >
                <Text className="text-white font-bold text-lg">
                    {isUploading ? "Uploading..." : "Create Post"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
