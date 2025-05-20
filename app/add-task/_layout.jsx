import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '../../contexts/authContext';
import { useCreds } from 'creds';

const AddTaskScreen = () => {
  const Creds = useCreds();
  const router = useRouter();
  const { userProfile, userToken } = useAuth();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [iosModalVisible, setIosModalVisible] = useState(false);

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${Creds.BackendUrl}/api/users`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          const filteredEmployees = data.filter(
            (user) => user.role === 'employee' || user.role === 'admin'
          );
          setEmployees(filteredEmployees);
        }
      } catch (error) {
        console.error('💥 Fetch Error:', error);
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
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    console.log(deadline);

    try {
      const response = await fetch(`${Creds.BackendUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          assignedTo: selectedEmployee,
          assignedBy: userProfile.username,
          deadline: deadline,
          status: 'new task',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Task Assigned Successfully!');
        setTaskTitle('');
        setTaskDescription('');
        setSelectedEmployee('');
        setDeadline(new Date());
        router.push("/")
      } else {
        Alert.alert('Error', data.message || 'Failed to assign task.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-3">
      <TouchableOpacity onPress={() => router.back()} className="absolute left-4 top-4">
        <Ionicons name="arrow-back" size={25} color="black" />
      </TouchableOpacity>
      <Text className="mt-20 text-center text-2xl font-bold text-orange-600">Add New Task</Text>
      <Text className="mt-2 text-center text-sm text-gray-600">
        Create and assign tasks to employees with a deadline.
      </Text>

      <View className="mt-5 rounded-lg bg-white p-3">
        <Text className="mb-2 font-semibold text-orange-600">Task Title</Text>
        <TextInput
          className="rounded-lg border border-gray-300 p-3 text-gray-700"
          placeholder="Enter task title"
          value={taskTitle}
          onChangeText={setTaskTitle}
        />
      </View>

      <View className="mt-3 rounded-lg bg-white p-3">
        <Text className="mb-2 font-semibold text-orange-600">Task Description</Text>
        <TextInput
          className="h-32 rounded-lg border border-gray-300 p-3 text-gray-700"
          placeholder="Enter task description"
          multiline
          numberOfLines={4}
          value={taskDescription}
          onChangeText={setTaskDescription}
        />
      </View>

      <View className="mt-3 rounded-lg bg-white p-3">
        <Text className="mb-2 font-semibold text-orange-600">Assign To</Text>

        {Platform.OS === 'ios' ? (
          <>
            <TouchableOpacity
              onPress={() => setIosModalVisible(true)}
              className="flex h-14 w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3">
              <Text className={selectedEmployee ? 'text-gray-800' : 'text-gray-400'}>
                {selectedEmployee
                  ? employees.find((item) => item._id === selectedEmployee)?.fullName ||
                    'Employee not found'
                  : 'Select an employee...'}
              </Text>
            </TouchableOpacity>

            <Modal visible={iosModalVisible} animationType="slide" transparent={true}>
              <View className="bg-trasparent flex-1 justify-end">
                <View className="rounded-t-3xl bg-white p-1">
                  <View className="mb-1 flex-row justify-end">
                    <TouchableOpacity
                      onPress={() => setIosModalVisible(false)}
                      className="px-5 pt-3">
                      <Text className="text-[1rem] font-semibold text-blue-600">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <Picker
                    selectedValue={selectedEmployee}
                    onValueChange={(itemValue) => setSelectedEmployee(itemValue)}>
                    <Picker.Item label="Select an employee.." value="select" />
                    {employees.map((emp) => (
                      <Picker.Item key={emp._id} label={emp.fullName} value={emp._id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <RNPickerSelect
            onValueChange={(value) => setSelectedEmployee(value)}
            items={employees.map((emp) => ({
              label: emp.fullName,
              value: emp._id,
            }))}
            placeholder={{
              label: 'Select an employee...',
              value: null,
            }}
          />
        )}
      </View>

      <View className="mt-3 rounded-lg bg-white p-3">
        <Text className="mb-2 font-semibold text-orange-600">Deadline</Text>

        {/* Date Picker Trigger */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="mb-2 rounded-lg bg-gray-100 p-4">
          <Text className="text-gray-700">
            {deadline.toLocaleDateString()} -{' '}
            {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </TouchableOpacity>

        <DateTimePickerModal
          className="mb-5"
          isVisible={showDatePicker}
          mode="date"
          display="inline"
          theme="dark"
          date={deadline}
          onConfirm={(selectedDate) => {
            if (selectedDate) {
              const updated = new Date(deadline);
              updated.setFullYear(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
              );
              setDeadline(updated);
            }
            setShowDatePicker(false);
            setTimeout(() => {
              setShowTimePicker(true);
            }, 500);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          display="spinner"
          date={deadline}
          onConfirm={(selectedDate) => {
            if (selectedDate) {
              const updated = new Date(deadline);
              updated.setHours(selectedDate.getHours());
              updated.setMinutes(selectedDate.getMinutes());
              setDeadline(updated);
            }
            setShowTimePicker(false);
          }}
          onCancel={() => setShowTimePicker(false)}
        />
      </View>

      <TouchableOpacity
        className="mt-6 flex-row items-center justify-center rounded-lg bg-orange-600 p-4"
        onPress={handleAssignTask}>
        <Feather name="check-circle" size={20} color="white" />
        <Text className="ml-2 text-lg font-bold text-white">Assign Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddTaskScreen;
