import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useAuth } from "../../contexts/authContext";
import { useCreds } from "creds";

const AddTaskScreen = () => {
  const Creds = useCreds();
  const router = useRouter();
  const { userProfile, userToken } = useAuth();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${Creds.BackendUrl}/api/users`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          const filteredEmployees = data.filter((user) => user.role === "employee" || user.role === "admin");
          setEmployees(filteredEmployees);
        }
      } catch (error) {
        console.error("💥 Fetch Error:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Handle Date Change
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  // Assign Task
  const handleAssignTask = async () => {
    if (!taskTitle || !taskDescription || !selectedEmployee || !deadline) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    console.log(deadline);

    try {
      const response = await fetch(`${Creds.BackendUrl}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          assignedTo: selectedEmployee,
          assignedBy: userProfile.username,
          deadline: deadline,
          status: "new task",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Task Assigned Successfully!");
        setTaskTitle("");
        setTaskDescription("");
        setSelectedEmployee("");
        setDeadline(new Date());
      } else {
        Alert.alert("Error", data.message || "Failed to assign task.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-3">
      <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4">
        <Ionicons name="arrow-back" size={30} color="black" />
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-orange-600 text-center mt-20">Add New Task</Text>
      <Text className="text-center text-gray-600 mt-2 text-sm">
        Create and assign tasks to employees with a deadline.
      </Text>

      <View className="bg-white p-3 rounded-lg shadow-md mt-5">
        <Text className="text-orange-600 font-semibold mb-2">Task Title</Text>
        <TextInput
          className="p-3 border border-gray-300 rounded-lg text-gray-700"
          placeholder="Enter task title"
          value={taskTitle}
          onChangeText={setTaskTitle}
        />
      </View>

      <View className="bg-white p-3 rounded-lg shadow-md mt-3">
        <Text className="text-orange-600 font-semibold mb-2">Task Description</Text>
        <TextInput
          className="p-3 border border-gray-300 rounded-lg text-gray-700 h-32"
          placeholder="Enter task description"
          multiline
          numberOfLines={4}
          value={taskDescription}
          onChangeText={setTaskDescription}
        />
      </View>

      <View className="bg-white p-3 rounded-lg shadow-md mt-3">
        <Text className="text-orange-600 font-semibold mb-2">Assign To</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedEmployee(value)}
          items={employees.map((emp) => ({
            label: emp.fullName,
            value: emp._id,
          }))}
          placeholder={{
            label: "Select an employee...",
            value: null,
          }}
        />
      </View>

      {/* <View className="bg-white p-3 rounded-lg shadow-md mt-3">
        <Text className="text-orange-600 font-semibold mb-2">Deadline</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} className="p-4 bg-gray-100 rounded-lg">
          <Text className="text-gray-700">{deadline.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}
      </View> */}

      <View className="bg-white p-3 rounded-lg shadow-md mt-3">
        <Text className="text-orange-600 font-semibold mb-2">Deadline</Text>

        {/* Date Picker Trigger */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)} className="p-4 bg-gray-100 rounded-lg mb-2">
          <Text className="text-gray-700">
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

      <TouchableOpacity className="bg-orange-600 p-4 rounded-lg flex-row justify-center items-center mt-6" onPress={handleAssignTask}>
        <Feather name="check-circle" size={20} color="white" />
        <Text className="text-white text-lg font-bold ml-2">Assign Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddTaskScreen;
