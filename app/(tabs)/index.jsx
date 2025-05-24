import { Entypo, Feather } from '@expo/vector-icons';
import { useCreds } from 'creds';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/authContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MyTasksScreen = () => {
  const router = useRouter();
  const Creds = useCreds();
  const { userProfile, userToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [expanded, setExpanded] = useState({});
  const [updatedTasks, setUpdatedTasks] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const [openStatus, setOpenStatus] = useState(false);
  const [statusItems, setStatusItems] = useState([
    { label: 'Not Started', value: 'not started' },
    { label: 'In Progress', value: 'in progress' },
    { label: 'Completed', value: 'completed' },
  ]);
  const [statusValues, setStatusValues] = useState({});

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

 useEffect(() => {
  if (!userProfile || !userProfile._id) {
    router.replace('/signin');
    return;
  }
  fetchTasks();
}, [userProfile]);


  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${Creds.BackendUrl}/app-api/tasks/assigned/${userProfile._id}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks:', data.message);
        router.replace('/signin');
      }
    } catch (error) {
      // console.error('Fetch error:', error);
      if (error) {
        router.replace('/signin');
      }
    }
  };

  const toggleEdit = (taskId) => {
    setEditMode((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
    if (editMode[taskId]) {
      setUpdatedTasks({});
    }
  };

  const saveTask = async (taskId) => {
    if (!updatedTasks[taskId]) return toggleEdit(taskId);

    try {
      const response = await fetch(`${Creds.BackendUrl}/app-api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(updatedTasks[taskId]),
      });
      if (response.ok) {
        fetchTasks();
        toggleEdit(taskId);
      } else {
        console.error('Failed to update task.');
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const requestTaskApproval = async (taskId) => {
    try {
      const res = await fetch(`${Creds.BackendUrl}/app-api/tasks/${taskId}/request-approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ requestStatus: 'requested' }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchTasks();
      } else {
        console.error('Failed to request approval:', data);
      }
    } catch (error) {
      console.error('Error requesting approval:', error);
    }
  };

  const handleChange = (taskId, field, value) => {
    setUpdatedTasks((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], [field]: value },
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not started':
        return 'text-gray-500';
      case 'in progress':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      default:
        return 'text-black';
    }
  };

  const toggleExpand = (taskId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const renderTask = (item) => {
    const isApproved = item.requestStatus === 'approved';
    const isDeclined = item.requestStatus === 'declined';
    const isExpanded = expanded[item._id];

    return (
      <View key={item._id} className="mb-1 rounded-lg border border-gray-300 bg-white">
        {/* Top: Compact Header */}
        <TouchableOpacity
          onPress={() => toggleExpand(item._id)}
          className="flex-row items-center justify-between p-3">
          <View>
            <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
            <Text className="text-sm text-gray-600">
              Assigned:{' '}
              {new Date(item.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
                hour12: true,
              })}
            </Text>
          </View>
          {item.status === 'not started' ? (
            <View className="float-end mb-6 mr-20 rounded-full border-[2px] border-orange-200 bg-orange-500 px-1 py-0">
              <Text className="text-white">New</Text>
            </View>
          ) : null}
          <Entypo name={isExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="gray" />
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View className="rounded-b-lg border-t border-gray-200 bg-gray-50 px-3 pb-3 pt-1">
            <Text className="mb-1 text-gray-700">{item.description}</Text>
            <Text className="text-sm text-gray-500">Assigned by: {item.assignedBy}</Text>
            <Text className="text-sm font-medium text-red-500">
              Deadline:{' '}
              {new Date(item.deadline).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
                hour12: true,
              })}
            </Text>

            <View className="mb-2 mt-2">
              <Text className="mb-1 font-semibold text-gray-700">My status:</Text>

              {editMode[item._id] ? (
                <DropDownPicker
                  open={openStatus}
                  value={statusValues[item._id] || item.status}
                  items={statusItems}
                  listMode="SCROLLVIEW"
                  setOpen={() => {
                    // Close other dropdowns if you're rendering in a list
                    setOpenStatus((prev) => !prev);
                  }}
                  setValue={(callback) => {
                    const value = callback(statusValues[item._id] || item.status);
                    setStatusValues((prev) => ({ ...prev, [item._id]: value }));
                    handleChange(item._id, 'status', value); // your handler
                  }}
                  setItems={setStatusItems}
                  style={{
                    backgroundColor: '#E5E7EB', // Tailwind bg-gray-200
                    borderColor: 'transparent',
                    height: 40,
                  }}
                  containerStyle={{ zIndex: 1000 }} // Important for dropdown stacking
                  dropDownContainerStyle={{
                    backgroundColor: '#E5E7EB',
                    borderColor: 'transparent',
                    zIndex: 999,
                  }}
                />
              ) : (
                <Text className={`${getStatusColor(item.status)} text-lg font-semibold`}>
                  {item.status}
                </Text>
              )}
            </View>

            <Text className="mt-2 font-semibold text-gray-700">Notes:</Text>
            {editMode[item._id] ? (
              <TextInput
                className="rounded-lg border border-gray-300 bg-gray-200 p-2 text-gray-700"
                placeholder="Add notes..."
                value={updatedTasks[item._id]?.notes || item.notes}
                onChangeText={(text) => handleChange(item._id, 'notes', text)}
                multiline={true}
              />
            ) : (
              <Text className="mt-1 rounded-md bg-gray-100 p-1 text-gray-600">
                {item.notes || 'No notes added'}
              </Text>
            )}

            {/* Request Status Section */}
            <View className="mt-3">
              {item.requestStatus === 'requested' && (
                <Text className="text-center font-medium text-orange-500">
                  🟠 Requested for approval
                </Text>
              )}
              {item.requestStatus === 'approved' && (
                <Text className="text-center font-medium text-green-600">✅ Task Approved</Text>
              )}
              {item.requestStatus === 'declined' && (
                <Text className="text-center font-medium text-red-600">❌ Task Declined</Text>
              )}

              {isApproved && (
                <>
                  <Text className="mt-2 font-semibold text-green-600">
                    Admin Review: {item.approveReview}
                  </Text>
                  <View className="mb-2 flex-row items-center gap-3">
                    <Text className="font-semibold text-gray-700">Rating:</Text>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        className={`text-2xl ${
                          item?.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                        }`}>
                        ★
                      </Text>
                    ))}
                  </View>
                </>
              )}

              {!isApproved && (
                <>
                  {isDeclined && (
                    <>
                      <Text className="mt-2 font-semibold text-red-600">
                        Decline Reason: {item.declineReason}
                      </Text>
                    </>
                  )}

                  <TouchableOpacity
                    className="mt-3 flex-row items-center justify-center gap-2 rounded-md bg-orange-600 p-2"
                    onPress={() =>
                      editMode[item._id] ? saveTask(item._id) : toggleEdit(item._id)
                    }>
                    <Feather name={editMode[item._id] ? 'check' : 'edit'} size={18} color="white" />
                    <Text className="font-semibold text-white">
                      {editMode[item._id] ? 'Save' : 'Edit'}
                    </Text>
                  </TouchableOpacity>

                  {!editMode[item._id] &&
                    item.status === 'completed' &&
                    item.requestStatus === 'none' && (
                      <TouchableOpacity
                        className="mt-2 rounded-md bg-orange-600 p-2"
                        onPress={() => requestTaskApproval(item._id)}>
                        <Text className="text-center font-semibold text-white">
                          Submit for Approval
                        </Text>
                      </TouchableOpacity>
                    )}

                  {!editMode[item._id] &&
                    item.status === 'completed' &&
                    item.requestStatus === 'declined' && (
                      <TouchableOpacity
                        className="mt-2 rounded-md bg-orange-600 p-2"
                        onPress={() => requestTaskApproval(item._id)}>
                        <Text className="text-center font-semibold text-white">
                          ReSubmitt for Approval
                        </Text>
                      </TouchableOpacity>
                    )}
                </>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const ongoingTasks = tasks.filter((task) => task.requestStatus !== 'approved');
  const completedTasks = tasks.filter((task) => task.requestStatus === 'approved');

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <ScrollView
        className="flex-1 bg-gray-50 p-3"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {tasks.length === 0 ? (
          <Text className="mt-10 text-center text-lg text-gray-500">
            You don't have any assigned tasks!
          </Text>
        ) : (
          <>
            {ongoingTasks.length > 0 && (
              <View>
                <Text className="mb-2 text-xl font-bold text-gray-800">Ongoing Tasks</Text>
                {ongoingTasks.map(renderTask)}
              </View>
            )}

            {completedTasks.length > 0 && (
              <View className="mb-5 mt-6">
                <Text className="mb-2 text-xl font-bold text-green-700">Completed Tasks</Text>
                {completedTasks.map((task) => (
                  <View key={task._id}>{renderTask(task)}</View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
      {/* Floating Button to Create Post (Admin Only) */}
      {userProfile?.role === 'admin' && (
        <TouchableOpacity
          className="elevation-md absolute bottom-5 right-5 rounded-full bg-orange-600 p-4"
          onPress={() => router.push('/add-task')}>
          <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MyTasksScreen;
