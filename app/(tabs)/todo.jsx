import { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import axios from "axios";
import { useAuth } from "../../contexts/authContext";
import { useCreds } from "creds";

export default function ToDoScreen() {
  const Creds = useCreds();
  const { userProfile, userToken } = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [updatedTodo, setUpdatedTodo] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch Todos from Database
  const fetchTodos = async () => {
    try {
      const response = await axios.get(
        `${Creds.BackendUrl}/api/todos/${userProfile._id}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Add New To-Do
  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return;
    try {
      const response = await axios.post(
        `${Creds.BackendUrl}/api/todos`,
        { title: newTodo, userId: userProfile._id },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setTodos([response.data, ...todos]);
      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Update Todo
  const handleUpdate = async (id) => {
    if (updatedTodo.trim() === "") return;
    try {
      await axios.patch(
        `${Creds.BackendUrl}/api/todos/${id}`,
        { title: updatedTodo },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setEditingId(null);  // Close editing mode
      setUpdatedTodo("");
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Mark as Done
  const toggleComplete = async (id, completed) => {
    try {
      await axios.patch(
        `${Creds.BackendUrl}/api/todos/${id}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      fetchTodos();
    } catch (error) {
      console.error("Error marking as done:", error);
    }
  };

  // Delete Todo
  const handleDelete = (id) => {
    Alert.alert("Delete To-Do", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await axios.delete(
              `${Creds.BackendUrl}/api/todos/${id}`,
              { headers: { Authorization: `Bearer ${userToken}` } }
            );
            fetchTodos();  // Refresh todos after delete
          } catch (error) {
            console.error("Error deleting todo:", error);
            Alert.alert("Error", "There was an error deleting the to-do. Please try again.");
          }
        },
      },
    ]);
  };

  // Render Swipeable Actions for Left (Edit) and Right (Delete)
  const renderLeftActions = (id) => (
    <View className="bg-orange-600 w-full justify-start items-center -mr-[20rem] rounded-l-md h-auto mb-2 flex-row">
      <TouchableOpacity className="ml-5"
        onPress={() => {
          setEditingId(id); // Start editing mode
          setUpdatedTodo(todos.find(todo => todo._id === id)?.title || "");
        }}
      >
        <Feather name="edit-2" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderRightActions = (id) => (
    <View className="bg-red-600 w-full justify-end items-center -ml-[20rem] rounded-r-md h-auto flex-row mb-2">
      <TouchableOpacity className="mr-5" onPress={() => handleDelete(id)}>
        <Feather name="trash-2" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-gray-50 p-3">
        {/* <Text className="text-2xl font-bold text-center mb-4 text-orange-600">
          To-Do List
        </Text> */}

        {/* Input Box */}
        <View className="flex-row items-center bg-white p-2 rounded-lg mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-md p-[10px] mr-1 h-12"
            placeholder="Type to Add new to-do"
            value={newTodo}
            onChangeText={setNewTodo}
          />
          <TouchableOpacity
            onPress={handleAddTodo}
            className="bg-orange-500 w-12 h-12 rounded-lg items-center justify-center"
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* To-Do List */}
        <FlatList
          data={todos}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Swipeable
              renderLeftActions={() => renderLeftActions(item._id)}
              renderRightActions={() => renderRightActions(item._id)}
            >
              <View className="bg-white p-3 rounded-lg mb-2 flex-row items-center justify-between">
                
                {/* Edit Mode or Text */}
                {editingId === item._id ? (
                  <TextInput
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    value={updatedTodo}
                    onChangeText={setUpdatedTodo}
                    onBlur={() => handleUpdate(item._id)}
                  />
                ) : (
                  <Text
                    className={`flex-1 text-lg ${
                      item.completed ? "line-through text-gray-400" : "text-black"
                    }`}
                  >
                    {item.title}
                  </Text>
                )}

                {/* Check Button on Right */}
                <TouchableOpacity
                  onPress={() => toggleComplete(item._id, item.completed)}
                >
                  <Feather
                    name="check-circle"
                    size={28}
                    color={item.completed ? "#4CAF50" : "#bbb"}
                  />
                </TouchableOpacity>
              </View>
            </Swipeable>
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No to-dos yet. Add something!
            </Text>
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}
