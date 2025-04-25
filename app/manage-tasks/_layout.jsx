import { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, Platform, LayoutAnimation, UIManager } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/authContext";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { useCreds } from "creds";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


export default function ManageTasksScreen() {
  const Creds = useCreds();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const router = useRouter();
  const { userToken, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [deadline, setDeadline] = useState(new Date());
  // const [newDeadline, setNewDeadline] = useState()
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [reviewTask, setReviewTask] = useState({});
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expanded, setExpanded] = useState({});



  const handleReviewInputChange = (key, value) => {
    setReviewTask((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key, value) => {
    setReviewTask((prev) => ({ ...prev, [key]: value }));
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "not started":
        return "text-gray-500";
      case "in progress":
        return "text-yellow-600";
      case "completed":
      case "approved":
        return "text-green-600";
      case "requested":
        return "text-blue-600";
      case "declined":
        return "text-red-600";
      default:
        return "text-black";
    }
  };

  useEffect(() => {
    if (!userToken) {
      setError("You are not logged in. Please log in to access this page.");
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [userToken, logout]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${Creds.BackendUrl}/api/tasks`, {
        headers: { Authorization: `Bearer ${userToken}`, "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) setTasks(data);
      else if (data.message === "Invalid or expired token") logout();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (id) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const response = await fetch(`${Creds.BackendUrl}/api/tasks/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${userToken}` },
            });
            if (response.ok) {
              setTasks((prev) => prev.filter((task) => task._id !== id));
              Alert.alert("Task deleted successfully");
            }
          } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleReviewTask = (status, taskId) => {
    setReviewTask({ ...reviewTask, status, taskId, review: "", rating: 0 });
    setIsReviewModalVisible(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    const updatedTask = {
      title: editingTask.title,
      description: editingTask.description,
      deadline,
    };

    try {
      const response = await fetch(`${Creds.BackendUrl}/api/tasks/${editingTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
        body: JSON.stringify(updatedTask),
      });
      const data = await response.json();
      if (response.ok) {
        setTasks((prev) => prev.map((task) => (task._id === data._id ? data : task)));
        setIsModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while updating the task");
    }
  };

  const handleCompleteTask = async (taskId, status, review, rating) => {
    let payload = {
      requestStatus: status, // status = 'approved' or 'declined'
      rating,
    };

    // Conditionally add the correct field
    if (status === "approved") {
      payload.approveReview = review || "No review provided";
    } else if (status === "declined") {
      payload.declineReason = review || "No reason provided";
    }

    console.log(payload);

    try {
      const response = await fetch(`${Creds.BackendUrl}/api/tasks/${taskId}/approve-reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setIsReviewModalVisible(false);
        fetchTasks(); // Refresh tasks list
      } else {
        Alert.alert("Error", data.message || "Failed to update task");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while updating the task.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.assignedTo.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus || task.requestStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#e6560e" />
        <Text className="text-gray-500 text-lg mt-2">Loading tasks...</Text>
      </View>
    );
  }

  const toggleExpand = (taskId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => router.back()} className="absolute top-5 left-2">
        <Ionicons name="arrow-back" size={30} color="black" />
      </TouchableOpacity>

      <Text className="text-2xl font-bold mt-12 mb-3 text-center">Manage Tasks</Text>

      <TextInput
        className="p-3 border border-gray-300 rounded-lg mb-2"
        placeholder="Search by Employee Name or Task Title"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View className="border-[1px] mb-2 rounded-lg bg-white border-gray-300 w-48 h-10 flex justify-center">
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(itemValue) => setSelectedStatus(itemValue)}
          className=""
        >
          <Picker.Item label="All Statuses" value="all" />
          <Picker.Item label="Not Started" value="not started" />
          <Picker.Item label="In Progress" value="in progress" />
          <Picker.Item label="Requested" value="requested" />
          <Picker.Item label="Approved" value="approved" />
          <Picker.Item label="Declined" value="declined" />
          <Picker.Item label="Completed" value="completed" />
        </Picker>
      </View>



      {error && <Text className="text-red-500 p-3">{error}</Text>}


      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isExpanded = expanded[item._id];

            return (
              <View className="bg-white mb-1 rounded-lg border border-gray-300">
                <TouchableOpacity
                  onPress={() => toggleExpand(item._id)}
                  className="p-3 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
                    <Text className="text-sm text-gray-600">Assigned to: {item.assignedTo.fullName}</Text>
                    <View className="flex-row">
                      <Text className="text-sm text-gray-600">Status: </Text>
                      <Text className={`text-sm ${getStatusColor(item.status)}`}>{item.status}</Text>
                    </View>
                  </View>

                  {item.status === "not started" && (
                    <View className="mr-20 mb-2 bg-orange-500 px-1 py-0 rounded-full border-[2px] border-orange-200">
                      <Text className="text-white">New</Text>
                    </View>
                  )}

                  <Entypo
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={22}
                    color="gray"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View className="p-3 bg-white rounded-md border-[1px] border-gray-200">
                    <Text className="text-lg font-semibold">{item.title}</Text>
                    <Text className="text-gray-600">{item.description}</Text>
                    <Text className="text-sm">Assigned to: {item.assignedTo.fullName}</Text>
                    <Text className="text-sm">Notes: {item.notes || "No notes"}</Text>
                    <Text className="text-sm text-sky-600">
                      Assigned On: {new Date(item.createdAt).toLocaleString()}
                    </Text>
                    <Text className="text-sm text-red-600">
                      Deadline: {new Date(item.deadline).toLocaleString()}
                    </Text>

                    <View className="flex-row justify-between mt-2 items-center">
                      <Text className={`${getStatusColor(item.status)} font-bold`}>
                        Task status: {item.status}
                      </Text>

                      <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => handleEditTask(item)} className="bg-orange-500 px-3 py-2 rounded-md">
                          <Text className="text-white">Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleDeleteTask(item._id)} className="bg-red-500 px-3 py-2 rounded-md">
                          <Text className="text-white">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="bg-gray-100 px-3 py-1 rounded-md mt-3 border-t-[1px] border-orange-300">
                      <View className="flex-row justify-between items-center">
                        <Text className={`${getStatusColor(item.requestStatus)} font-bold`}>
                          Admin status: {item.requestStatus}
                        </Text>

                        {item.requestStatus === "requested" && (
                          <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => handleReviewTask("approved", item._id)} className="bg-green-500 px-3 py-2 rounded-md">
                              <Text className="text-white">Accept</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleReviewTask("declined", item._id)} className="bg-red-500 px-3 py-2 rounded-md">
                              <Text className="text-white">Reject</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      <View className="flex-row mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text key={star} className={`text-2xl mr-1 ${item.rating >= star ? "text-yellow-400" : "text-gray-300"}`}>★</Text>
                        ))}
                      </View>

                      <Text className="text-gray-600 mt-1">
                        Admin review: {item.requestStatus === "approved" ? item?.approveReview : item?.declineReason || "no review added"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />

      ) : (
        <Text>No tasks found</Text>
      )}



      <Modal visible={isModalVisible} transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 p-6">
          <View className="bg-white p-3 rounded-lg w-4/5">
            <Text className="text-2xl font-bold mb-2 text-center">Edit Task</Text>
            <Text className="text-gray-500 text-center mb-4">Make changes to the task details below</Text>

            <View className="mb-3">
              <Text className="text-gray-700 font-semibold mb-1">Title</Text>
              <TextInput
                value={editingTask?.title}
                onChangeText={(text) => setEditingTask({ ...editingTask, title: text })}
                placeholder="Task Title"
                className="border border-gray-300 p-2 rounded mb-2"
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 font-semibold mb-1">Description</Text>
              <TextInput
                value={editingTask?.description}
                onChangeText={(text) => setEditingTask({ ...editingTask, description: text })}
                placeholder="Task Description"
                multiline
                className="border border-gray-300 p-2 rounded mb-2"
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 font-semibold mb-1">Deadline</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-gray-100 p-3 rounded-md"
              >
                <Text className="text-gray-600">
                  {deadline.toLocaleDateString()} - {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={deadline}
                onConfirm={(event, selectedDate) => {
                  if (selectedDate) {
                    const currentDate = new Date(selectedDate);
                    const updated = new Date(deadline);
                    updated.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                    setDeadline(updated);
                  }
                  setShowDatePicker(false);
                  setShowTimePicker(true);
                }}
                onCancel={() => {
                  setShowDatePicker(false);
                }}
                is24Hour={false}
              />

              <DateTimePickerModal
                isVisible={showTimePicker}
                mode="time"
                date={deadline}
                onConfirm={(event, selectedDate) => {
                  if (selectedDate) {
                    const currentTime = new Date(selectedTime);
                    const updated = new Date(deadline);
                    updated.setHours(currentTime.getHours());
                    updated.setMinutes(currentTime.getMinutes());
                    setDeadline(updated);
                  }
                  setShowTimePicker(false);
                }}
                onCancel={() => {
                  setShowTimePicker(false);
                }}
                is24Hour={false}
              />
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="bg-red-500 px-4 py-3 rounded-md w-[45%]"
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateTask}
                className="bg-green-500 px-4 py-3 rounded-md w-[45%]"
              >
                <Text className="text-white text-center font-semibold">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isReviewModalVisible} transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-3 rounded-lg w-4/5">
            <Text className="text-2xl font-bold mb-2 text-center">{reviewTask.status === "approved" ? "Approve Task" : "Reject Task"}</Text>

            <View className="mb-3">
              <Text className="text-gray-700 font-semibold mb-1">{reviewTask.status === "approved" ? "Review" : "Reason"}</Text>
              <TextInput
                className="p-3 border border-gray-300 rounded-md"
                placeholder={reviewTask.status === "approved" ? "Review of Approval" : "Reason of Rejecting"}
                value={reviewTask?.review}
                onChangeText={(text) => handleInputChange("review", text)}
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 font-semibold mb-1">Rating</Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleReviewInputChange("rating", star)}
                  >
                    <Text className={`text-3xl mr-2 ${reviewTask?.rating >= star ? "text-yellow-400" : "text-gray-300"}`}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>


            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setIsReviewModalVisible(false)}
                className="bg-orange-400 px-4 py-3 rounded-md w-[45%]"
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCompleteTask(reviewTask.taskId, reviewTask.status, reviewTask.review, reviewTask.rating)}
                className={`${reviewTask.status === "approved" ? "bg-green-500" : "bg-red-500"} px-4 py-3 rounded-md w-[45%]`}
              >
                <Text className="text-white text-center font-semibold">{reviewTask.status === "approved" ? "Approve" : "Reject"}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}
