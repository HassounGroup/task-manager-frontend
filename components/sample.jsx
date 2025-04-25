import { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/authContext";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ManageTasksScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const { userToken, logout, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [rating, setRating] = useState(0);
  const [reason, setReason] = useState("");  // State for reject reason

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
  }, [userToken]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://192.168.1.220:8000/api/tasks", {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      } else if (data.message === "Invalid or expired token") {
        logout();
      }
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
            const response = await fetch(`http://192.168.1.220:8000/api/tasks/${id}`, {
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

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    const updatedTask = {
      title: editingTask.title,
      description: editingTask.description,
      deadline: editingTask.deadline,
      status: editingTask.status,
    };

    try {
      const response = await fetch(`http://192.168.1.220:8000/api/tasks/${editingTask._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(updatedTask),
      });
      const data = await response.json();
      if (response.ok) {
        setTasks((prev) =>
          prev.map((task) => (task._id === data._id ? data : task))
        );
        setIsModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while updating the task");
    }
  };

  const handleInputChange = (field, value) => {
    setEditingTask({ ...editingTask, [field]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      setEditingTask({
        ...editingTask,
        deadline: selectedDate.toISOString().split("T")[0],
      });
    }
    setShowDatePicker(false);
  };

  const handleCompleteTask = (task, action) => {
    if (user.role === "admin") {
      const updatedTask = {
        ...task,
        status: action === "approve" ? "approved" : "declined",
        reason: action === "decline" ? reason : null,  // Add reason if declined
      };
      handleUpdateTask(updatedTask);
    } else {
      Alert.alert("Permission Denied", "You must be an admin to approve/reject this task.");
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.assignedTo.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTasks = filteredTasks.filter(
    (task) => task.status !== "approved" && task.status !== "declined"
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "approved"
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6200ee" />
        <Text className="text-gray-500 text-lg mt-2">Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => router.back()} className="absolute top-5 left-2">
        <Ionicons name="arrow-back" size={30} color="black" />
      </TouchableOpacity>

      <Text className="text-2xl font-bold mt-14 mb-4 text-center">Manage Tasks</Text>

      <TextInput
        className="p-3 border border-gray-300 rounded-lg mb-3"
        placeholder="Search by Employee Name or Task Title"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {error && <Text className="text-red-500 p-3">{error}</Text>}

      {/* --- Active Tasks --- */}
      <Text className="text-lg font-bold mt-4 mb-2 text-blue-700">Active Tasks</Text>
      {activeTasks.length > 0 ? (
        <FlatList
          data={activeTasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <TaskCard item={item} onEdit={handleEditTask} onDelete={handleDeleteTask} onComplete={handleCompleteTask} />}
        />
      ) : (
        <Text className="text-gray-500 text-center">No active tasks</Text>
      )}

      {/* --- Completed Tasks --- */}
      <Text className="text-lg font-bold mt-6 mb-2 text-green-700">Completed Tasks</Text>
      {completedTasks.length > 0 ? (
        <FlatList
          data={completedTasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <TaskCard item={item} />}
        />
      ) : (
        <Text className="text-gray-500 text-center">No completed tasks</Text>
      )}

      {/* --- Edit Task Modal --- */}
      <Modal visible={isModalVisible} transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-3 rounded-lg w-4/5">
            <Text className="text-2xl font-bold mb-2 text-center">Edit Task</Text>
            <Text className="text-gray-500 text-center mb-4">Make changes to the task details below</Text>

            <TextInput
              className="p-3 border border-gray-300 rounded-md mb-3"
              placeholder="Title"
              value={editingTask?.title}
              onChangeText={(text) => handleInputChange("title", text)}
            />
            <TextInput
              className="p-3 border border-gray-300 rounded-md mb-3"
              placeholder="Description"
              value={editingTask?.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-100 p-3 rounded-md mb-3"
            >
              <Text className="text-gray-600">
                {editingTask?.deadline
                  ? new Date(editingTask.deadline).toLocaleDateString()
                  : "Select Deadline"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                onChange={handleDateChange}
              />
            )}

            <View className="flex-row justify-between mt-3">
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
    </View>
  );
}

// Reusable task card component
function TaskCard({ item, onEdit, onDelete, onComplete }) {
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

  return (
    <View className="bg-white p-4 rounded-lg mb-2 shadow">
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

      <View className="flex-row justify-between mt-3 items-center">
        <Text className={`${getStatusColor(item.status)} font-bold text-left`}>
          Status: {item.status}
        </Text>

        {onEdit && onDelete && (
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => onEdit(item)} className="bg-orange-300 p-2 rounded-md">
              <Ionicons name="pencil" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item._id)} className="bg-red-500 p-2 rounded-md">
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
        {onComplete && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => onComplete(item, "approve")}
              className="bg-green-500 p-2 rounded-md"
            >
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onComplete(item, "decline")}
              className="bg-red-500 p-2 rounded-md"
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
