import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
} from "react-native";
// import Video from "react-native-video";
import { Video } from 'expo-av';
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import { useCreds } from "../creds";

const screenWidth = Dimensions.get("window").width;

const PostCard = ({ post, currentUserId, userRole, onPostDeleted }) => {
    const Creds = useCreds();
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const [isMuted, setIsMuted] = useState(true); // State to handle mute/unmute
    const [isVideoInView, setIsVideoInView] = useState(false);
    const videoRef = useRef(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // Track current media index
    const [isMenuVisible, setIsMenuVisible] = useState(false); // Track visibility of the admin menu

    const inputRef = useRef(null);

    useEffect(() => {
        if (commentModalVisible) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [commentModalVisible]);

    const toggleMute = () => {
        setIsMuted((prevState) => !prevState); // Toggle mute state
    };

    const handleViewableItemsChanged = (info) => {
        const isInView = info.isViewable; // Check if the item is in view
        setIsVideoInView(isInView);

        if (videoRef.current) {
            if (isInView) {
                videoRef.current.playAsync(); // Play video when in view
            } else {
                videoRef.current.pauseAsync(); // Pause video when out of view
            }
        }
    };

    useEffect(() => {
        if (post && post.likes && currentUserId) {
            const isLiked = post.likes.some(
                (like) => like._id?._id === currentUserId
            );
            setLiked(isLiked);
            setLikesCount(post.likes.length);
        }
    }, [post, currentUserId]);


    const handleLike = async () => {
        try {
            // Optimistically update UI
            const newLiked = !liked;
            setLiked(newLiked);
            setLikesCount((prev) => newLiked ? prev + 1 : prev - 1);

            // Send to backend
            const res = await axios.patch(`${Creds.BackendUrl}/api/posts/like/${post._id}`, {
                userId: currentUserId,
            });

            // Update from actual response to avoid mismatch
            // const updatedLikes = res.data.likes;
            // setLiked(updatedLikes.some((like) => like._id?._id === currentUserId));
            // setLikesCount(updatedLikes.length);
        } catch (error) {
            console.error("Error liking the post:", error);
        }
    };

    const handleDeletePost = async () => {
        try {
            await axios.delete(`${Creds.BackendUrl}/api/posts/${post._id}`);
            onPostDeleted()
            console.log("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting the post:", error);
        }
    };

    const renderMedia = (mediaUrl) => {
        const isVideo = mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".mov");
        return isVideo ? (
            <View className="relative w-[100%] h-[300px]"
                onLayout={(event) => {
                    const layout = event.nativeEvent.layout;
                    const isInView = layout.height > 0; // Check if the video is in view based on layout
                    setIsVideoInView(isInView);
                    if (isInView && videoRef.current) {
                        videoRef.current.playAsync();
                    } else if (!isInView && videoRef.current) {
                        videoRef.current.pauseAsync();
                    }
                }}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: `${Creds.BackendUrl}/${mediaUrl}` }}
                    style={{ width: screenWidth, height: 300 }}
                    useNativeControls={false}
                    resizeMode="cover"
                    shouldPlay={isVideoInView}
                    isLooping
                    isMuted={isMuted} // Set the mute state
                />
                <TouchableOpacity className="absolute bottom-5 right-5 bg-white rounded-full p-1 opacity-60" onPress={toggleMute}>
                    <Ionicons
                        name={isMuted ? 'volume-mute' : 'volume-high'} // Change icon based on mute state
                        size={20}
                        color="black"
                    />
                </TouchableOpacity>
            </View>

        ) : (
            <Image
                source={{ uri: `${Creds.BackendUrl}/${mediaUrl}` }}
                style={{ width: screenWidth, height: 300 }}
                resizeMode="cover"
            />
        );
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await axios.post(
                `${Creds.BackendUrl}/api/posts/comment/${post._id}`,
                {
                    userId: currentUserId,
                    comment: newComment,
                }
            );
            setComments(res.data.comments);
            setNewComment("");
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    return (
        <View className="mb-2 bg-white">
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                <Image
                    source={{ uri: `${Creds.BackendUrl}${post.userId?.profilePic}` }}
                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                />
                <View>
                    <Text style={{ fontWeight: "bold" }}>{post.userId?.fullName}</Text>
                    <Text className="text-gray-600 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                {userRole === 'admin' && (
                    <TouchableOpacity
                        style={{ position: 'absolute', right: 10 }}
                        onPress={() => setIsMenuVisible(!isMenuVisible)}
                    >
                        <Ionicons name="ellipsis-vertical" size={20} color="black" />
                    </TouchableOpacity>
                )}

            </View>

            {/* Media */}
            <FlatList
                data={post.media}
                horizontal
                keyExtractor={(item, index) => `${post._id}-${index}`}
                renderItem={({ item }) => renderMedia(item)}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
            />

            {isMenuVisible && userRole === 'admin' && (
                <View className="bg-gray-100 absolute top-10 right-5 px-3 py-2 rounded-lg mt-4">
                    <TouchableOpacity onPress={handleDeletePost} className="flex-row gap-2 items-center">
                        <Icon name="trash" color="red" size={15} />
                        <Text className="text-black">Delete Post</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Post Info */}
            <View style={{ padding: 10 }}>
                <TouchableOpacity onPress={handleLike}>
                    <Icon
                        name={liked ? "heart" : "heart-outline"}
                        size={25}
                        color={liked ? "red" : "black"}
                    />
                </TouchableOpacity>
                <Text>{likesCount} likes</Text>
                <Text style={{ fontWeight: "bold" }}>{post.title}</Text>
                <Text>{post.description}</Text>

                <TouchableOpacity onPress={() => setCommentModalVisible(true)}>
                    <Text style={{ color: "gray", marginTop: 5 }}>
                        View all {comments.length} comments
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Comments Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={commentModalVisible}
                onRequestClose={() => setCommentModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setCommentModalVisible(false)}>
                    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View
                                style={{
                                    height: "60%",
                                    backgroundColor: "#fff",
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    padding: 15,
                                }}
                            >
                                {/* Close Icon */}
                                <TouchableOpacity
                                    onPress={() => setCommentModalVisible(false)}
                                    style={{ position: "absolute", top: 10, right: 15, zIndex: 10 }}
                                >
                                    <Icon name="close" size={24} color="#333" />
                                </TouchableOpacity>

                                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                                    Comments
                                </Text>

                                <ScrollView className="mt-2">
                                    {comments.map((comment, index) => (
                                        <View key={index} className="mb-3 overflow-y-scroll">
                                            <Text className="font-bold">💬 {comment.fullName}</Text>
                                            <Text>{comment.comment}</Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                <KeyboardAvoidingView
                                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                                    keyboardVerticalOffset={80}
                                >
                                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                                        <TextInput
                                            ref={inputRef}
                                            placeholder="Add a comment..."
                                            value={newComment}
                                            onChangeText={setNewComment}
                                            style={{
                                                flex: 1,
                                                borderWidth: 1,
                                                borderColor: "#ccc",
                                                borderRadius: 20,
                                                paddingHorizontal: 15,
                                                paddingVertical: 8,
                                            }}
                                        />
                                        <TouchableOpacity
                                            onPress={handlePostComment}
                                            style={{ justifyContent: "center", marginLeft: 10 }}
                                        >
                                            <Icon name="send" size={24} color="#e6560e" />
                                        </TouchableOpacity>
                                    </View>
                                </KeyboardAvoidingView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default PostCard;
