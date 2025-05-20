import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/authContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import { useCreds } from 'creds';

if (Platform.OS === 'android') {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [reviewTask, setReviewTask] = useState({});
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expanded, setExpanded] = useState({});

  const [iosModalVisible, setIosModalVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [statusItems, setStatusItems] = useState([
    // { label: 'All Statuses', value: 'all' },
    { label: 'Not Started', value: 'not started' },
    { label: 'In Progress', value: 'in progress' },
    { label: 'Requested', value: 'requested' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
    { label: 'Completed', value: 'completed' },
  ]);

  const handleReviewInputChange = (key, value) => {
    setReviewTask((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key, value) => {
    setReviewTask((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not started':
        return 'text-gray-500';
      case 'in progress':
        return 'text-yellow-600';
      case 'completed':
      case 'approved':
        return 'text-green-600';
      case 'requested':
        return 'text-blue-600';
      case 'declined':
        return 'text-red-600';
      default:
        return 'text-black';
    }
  };

  useEffect(() => {
    if (!userToken) {
      setError('You are not logged in. Please log in to access this page.');
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [userToken, logout]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${Creds.BackendUrl}/api/tasks`, {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) setTasks(data);
      else if (data.message === 'Invalid or expired token') logout();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (id) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const response = await fetch(`${Creds.BackendUrl}/api/tasks/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${userToken}` },
            });
            if (response.ok) {
              setTasks((prev) => prev.filter((task) => task._id !== id));
              Alert.alert('Task deleted successfully');
            }
          } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to delete task');
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
    setReviewTask({ ...reviewTask, status, taskId, review: '', rating: 0 });
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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify(updatedTask),
      });
      const data = await response.json();
      if (response.ok) {
        setTasks((prev) => prev.map((task) => (task._id === data._id ? data : task)));
        setIsModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while updating the task');
    }
  };

  const handleCompleteTask = async (taskId, status, review, rating) => {
    let payload = {
      requestStatus: status, // status = 'approved' or 'declined'
      rating,
    };

    // Conditionally add the correct field
    if (status === 'approved') {
      payload.approveReview = review || 'No review provided';
    } else if (status === 'declined') {
      payload.declineReason = review || 'No reason provided';
    }

    console.log(payload);

    try {
      const response = await fetch(`${Creds.BackendUrl}/api/tasks/${taskId}/approve-reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setIsReviewModalVisible(false);
        fetchTasks(); // Refresh tasks list
      } else {
        Alert.alert('Error', data.message || 'Failed to update task');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while updating the task.');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.assignedTo.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' ||
      task.status === selectedStatus ||
      task.requestStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f3f4f6]">
        <ActivityIndicator size="large" color="#e6560e" />
        <Text className="mt-2 text-lg text-gray-500">Loading tasks...</Text>
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

  const handleDateConfirm = (selectedDate) => {
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
    setTimeout(() => setShowTimePicker(true), 300); // delay avoids rendering glitches
  };

  const handleTimeConfirm = (selectedDate) => {
    if (selectedDate) {
      const updated = new Date(deadline);
      updated.setHours(selectedDate.getHours());
      updated.setMinutes(selectedDate.getMinutes());
      setDeadline(updated);
    }
    setShowTimePicker(false);
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => router.back()} className="absolute left-5 top-5">
        <Ionicons name="arrow-back" size={25} color="black" />
      </TouchableOpacity>

      <Text className="mb-3 mt-12 text-center text-2xl font-bold">Manage Tasks</Text>

      <TextInput
        className="mb-2 rounded-lg border border-gray-300 p-3"
        placeholder="Search by Employee Name or Task Title"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View
        className={`mb-2 flex h-12 ${Platform.OS === 'ios' ? 'w-32' : 'w-48'} justify-center rounded-lg border-[1px] border-gray-300 bg-white`}>
        {Platform.OS === 'ios' ? (
          <>
            <TouchableOpacity onPress={() => setIosModalVisible(true)} className="">
              <Text
                className={`${selectedStatus && selectedStatus !== 'all' ? 'text-gray-800' : 'text-gray-400'} px-3 text-[1.03rem]`}>
                {selectedStatus === 'all'
                  ? 'All Status'
                  : statusItems.find((item) => item.value === selectedStatus)?.label ||
                    'All Status'}
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
                    selectedValue={selectedStatus}
                    onValueChange={(itemValue) => setSelectedStatus(itemValue)}>
                    <Picker.Item label="All Status" value="all" />
                    {statusItems.map((stat) => (
                      <Picker.Item key={stat.label} label={stat.label} value={stat.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(itemValue) => setSelectedStatus(itemValue)}
            className="h-10 w-full">
            <Picker.Item label="All Status" value="all" />
            <Picker.Item label="Not Started" value="not started" />
            <Picker.Item label="In Progress" value="in progress" />
            <Picker.Item label="Requested" value="requested" />
            <Picker.Item label="Approved" value="approved" />
            <Picker.Item label="Declined" value="declined" />
            <Picker.Item label="Completed" value="completed" />
          </Picker>
        )}
      </View>

      {error && <Text className="p-3 text-red-500">{error}</Text>}

      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isExpanded = expanded[item._id];

            return (
              <View className="mb-1 rounded-lg border border-gray-300 bg-white">
                <TouchableOpacity
                  onPress={() => toggleExpand(item._id)}
                  className="flex-row items-center justify-between p-3">
                  <View>
                    <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
                    <Text className="text-sm text-gray-600">
                      Assigned to: {item.assignedTo.fullName}
                    </Text>
                    <View className="flex-row">
                      <Text className="text-sm text-gray-600">Status: </Text>
                      <Text className={`text-sm ${getStatusColor(item.status)}`}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {item.status === 'not started' && (
                    <View className="mb-2 mr-20 rounded-full border-[2px] border-orange-200 bg-orange-500 px-1 py-0">
                      <Text className="text-white">New</Text>
                    </View>
                  )}

                  <Entypo
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="gray"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View className="rounded-md border-[1px] border-gray-200 bg-white p-3">
                    <Text className="text-lg font-semibold">{item.title}</Text>
                    <Text className="text-gray-600">{item.description}</Text>
                    <Text className="text-sm">Assigned to: {item.assignedTo.fullName}</Text>
                    <Text className="text-sm">Notes: {item.notes || 'No notes'}</Text>
                    <Text className="text-sm text-sky-600">
                      Assigned On: {new Date(item.createdAt).toLocaleString()}
                    </Text>
                    <Text className="text-sm text-red-600">
                      Deadline: {new Date(item.deadline).toLocaleString('en-GB', {day: '2-digit',month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true})}
                    </Text>

                    <View className="mt-2 flex-row items-center justify-between">
                      <Text className={`${getStatusColor(item.status)} font-bold`}>
                        Task status: {item.status}
                      </Text>

                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleEditTask(item)}
                          className="rounded-md bg-orange-500 px-3 py-2">
                          <Text className="text-white">Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDeleteTask(item._id)}
                          className="rounded-md bg-red-500 px-3 py-2">
                          <Text className="text-white">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="mt-3 rounded-md border-t-[1px] border-orange-300 bg-gray-100 px-3 py-1">
                      <View className="flex-row items-center justify-between">
                        <Text className={`${getStatusColor(item.requestStatus)} font-bold`}>
                          Admin status: {item.requestStatus}
                        </Text>

                        {item.requestStatus === 'requested' && (
                          <View className="flex-row gap-2">
                            <TouchableOpacity
                              onPress={() => handleReviewTask('approved', item._id)}
                              className="rounded-md bg-green-500 px-3 py-2">
                              <Text className="text-white">Accept</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleReviewTask('declined', item._id)}
                              className="rounded-md bg-red-500 px-3 py-2">
                              <Text className="text-white">Reject</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      <View className="mt-2 flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text
                            key={star}
                            className={`mr-1 text-2xl ${item.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </Text>
                        ))}
                      </View>

                      <Text className="mt-1 text-gray-600">
                        Admin review:{' '}
                        {item.requestStatus === 'approved'
                          ? item?.approveReview
                          : item?.declineReason || 'no review added'}
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
        <View className="flex-1 items-center justify-center bg-black/50 p-6">
          <View className="w-4/5 rounded-lg bg-white p-3">
            <Text className="mb-2 text-center text-2xl font-bold">Edit Task</Text>
            <Text className="mb-4 text-center text-gray-500">
              Make changes to the task details below
            </Text>

            <View className="mb-3">
              <Text className="mb-1 font-semibold text-gray-700">Title</Text>
              <TextInput
                value={editingTask?.title}
                onChangeText={(text) => setEditingTask({ ...editingTask, title: text })}
                placeholder="Task Title"
                className="mb-2 rounded border border-gray-300 p-2"
              />
            </View>

            <View className="mb-3">
              <Text className="mb-1 font-semibold text-gray-700">Description</Text>
              <TextInput
                value={editingTask?.description}
                onChangeText={(text) => setEditingTask({ ...editingTask, description: text })}
                placeholder="Task Description"
                multiline
                className="mb-2 rounded border border-gray-300 p-2"
              />
            </View>

            <View className="mb-3">
              <Text className="mb-1 font-semibold text-gray-700">Deadline</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="rounded-md bg-gray-100 p-3">
                <Text className="text-gray-600">
                  {deadline.toLocaleDateString()} -{' '}
                  {deadline.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
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

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="w-[45%] rounded-md bg-red-500 px-4 py-3">
                <Text className="text-center font-semibold text-white">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateTask}
                className="w-[45%] rounded-md bg-green-500 px-4 py-3">
                <Text className="text-center font-semibold text-white">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isReviewModalVisible} transparent={true}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-4/5 rounded-lg bg-white p-3">
            <Text className="mb-2 text-center text-2xl font-bold">
              {reviewTask.status === 'approved' ? 'Approve Task' : 'Reject Task'}
            </Text>

            <View className="mb-3">
              <Text className="mb-1 font-semibold text-gray-700">
                {reviewTask.status === 'approved' ? 'Review' : 'Reason'}
              </Text>
              <TextInput
                className="rounded-md border border-gray-300 p-3"
                placeholder={
                  reviewTask.status === 'approved' ? 'Review of Approval' : 'Reason of Rejecting'
                }
                value={reviewTask?.review}
                onChangeText={(text) => handleInputChange('review', text)}
              />
            </View>

            <View className="mb-3">
              <Text className="mb-1 font-semibold text-gray-700">Rating</Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleReviewInputChange('rating', star)}>
                    <Text
                      className={`mr-2 text-3xl ${reviewTask?.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setIsReviewModalVisible(false)}
                className="w-[45%] rounded-md bg-orange-400 px-4 py-3">
                <Text className="text-center font-semibold text-white">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  handleCompleteTask(
                    reviewTask.taskId,
                    reviewTask.status,
                    reviewTask.review,
                    reviewTask.rating
                  )
                }
                className={`${reviewTask.status === 'approved' ? 'bg-green-500' : 'bg-red-500'} w-[45%] rounded-md px-4 py-3`}>
                <Text className="text-center font-semibold text-white">
                  {reviewTask.status === 'approved' ? 'Approve' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
