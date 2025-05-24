import axios from "axios";
import { useCreds } from "creds";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/authContext";

export default function EditPostScreen({ route, navigation }) {
  const Creds = useCreds();
  const { postId } = route.params;
  const { userToken } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchPostDetails();
  }, []);

  // ✅ Fetch Post Details
  const fetchPostDetails = async () => {
    try {
      const response = await axios.get(`${Creds.BackendUrl}/app-api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const { title, description } = response.data;
      setTitle(title);
      setDescription(description);
    } catch (error) {
      console.error("Error fetching post details", error);
    }
  };

  // ✅ Update Post
  const handleUpdate = async () => {
    try {
      await axios.patch(
        `${Creds.BackendUrl}/app-api/posts/${postId}`,
        { title, description },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      Alert.alert("Success", "Post updated!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating post", error);
    }
  };

  // ✅ Delete Post
  const handleDelete = async () => {
    Alert.alert("Delete Post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${Creds.BackendUrl}/app-api/posts/${postId}`, {
              headers: { Authorization: `Bearer ${userToken}` },
            });
            Alert.alert("Deleted", "Post deleted!");
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting post", error);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-2xl font-bold text-orange-500 mb-4">Edit Post</Text>

      <TextInput
        className="border border-gray-300 p-3 rounded-md mb-3"
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="border border-gray-300 p-3 rounded-md mb-3"
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity onPress={handleUpdate} className="bg-green-500 p-4 rounded-lg">
        <Text className="text-white font-semibold text-center">Update Post</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} className="bg-red-500 p-4 rounded-lg mt-3">
        <Text className="text-white font-semibold text-center">Delete Post</Text>
      </TouchableOpacity>
    </View>
  );
}
