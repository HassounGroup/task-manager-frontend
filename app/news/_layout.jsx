import React, { useEffect, useState, useContext } from "react";
import { View, FlatList, TouchableOpacity, Text } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import PostCard from "../../components/PostCard";
import { AuthContext } from "../../contexts/authContext"; // Make sure this provides user info
import { useCreds } from "creds";

const PostsFeedScreen = ({ navigation }) => {
  const Creds = useCreds();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const { userProfile } = useContext(AuthContext); // should include _id and role

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${Creds.BackendUrl}/api/posts`);
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handledeletedPost = () => {
    fetchPosts();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f3f6" }}>
      <View className="h-12 bg-[#f3f4f6] flex items-start justify-center">
        <TouchableOpacity onPress={() => router.back()} className=" mt-2 ml-3">
          <Ionicons name="arrow-back" size={25} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        className="mt-2"
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={userProfile._id}
            userRole={userProfile.role}
            onPostDeleted={handledeletedPost}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Button to Create Post (Admin Only) */}
      {userProfile?.role === "admin" && (
        <TouchableOpacity className="absolute bottom-5 right-5 bg-orange-600 rounded-full p-4 elevation-md"
          onPress={() => router.push("/add-post")}
        >
          <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PostsFeedScreen;
