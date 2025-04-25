import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useAuth } from "../../contexts/authContext";
import { Feather, Entypo } from "@expo/vector-icons";
import { useCreds } from "creds";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

if (Platform.OS === "android") {
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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${Creds.BackendUrl}/api/tasks/assigned/${userProfile._id}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      } else {
        console.error("Failed to fetch tasks:", data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
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
      const response = await fetch(
        `${Creds.BackendUrl}/api/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(updatedTasks[taskId]),
        }
      );
      if (response.ok) {
        fetchTasks();
        toggleEdit(taskId);
      } else {
        console.error("Failed to update task.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const requestTaskApproval = async (taskId) => {
    try {
      const res = await fetch(
        `${Creds.BackendUrl}/api/tasks/${taskId}/request-approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ requestStatus: "requested" }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchTasks();
      } else {
        console.error("Failed to request approval:", data);
      }
    } catch (error) {
      console.error("Error requesting approval:", error);
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
      case "not started":
        return "text-gray-500";
      case "in progress":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      default:
        return "text-black";
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
    const isApproved = item.requestStatus === "approved";
    const isDeclined = item.requestStatus === "declined";
    const isExpanded = expanded[item._id];

    return (
      <View
        key={item._id}
        className="bg-white mb-1 rounded-lg border border-gray-300"
      >
        {/* Top: Compact Header */}
        <TouchableOpacity
          onPress={() => toggleExpand(item._id)}
          className="p-3 flex-row justify-between items-center"
        >
          <View>
            <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
            <Text className="text-sm text-gray-600">
              Assigned: {new Date(item.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: true })}
            </Text>
          </View>
          {item.status === "not started" ? <View className="mr-20 mb-6 bg-orange-500 px-1 py-0 rounded-full float-end border-[2px] border-orange-200">
            <Text className="text-white">New</Text>
          </View> : null}
          <Entypo
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={22}
            color="gray"
          />
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View className="px-3 pb-3 pt-1 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <Text className="text-gray-700 mb-1">{item.description}</Text>
            <Text className="text-sm text-gray-500">
              Assigned by: {item.assignedBy}
            </Text>
            <Text className="text-sm text-red-500 font-medium">
              Deadline: {new Date(item.deadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: true })}
            </Text>

            <View className="flex-row items-center justify-between mt-2">
              <Text className="font-semibold text-gray-700">My status:</Text>
              {editMode[item._id] ? (
                <View
                  className={`${getStatusColor(item.status)} bg-gray-200 w-[70%] rounded-lg font-bold`}
                >
                  <RNPickerSelect
                    onValueChange={(value) => handleChange(item._id, "status", value)}
                    items={[
                      { label: "Not Started", value: "not started" },
                      { label: "In Progress", value: "in progress" },
                      { label: "Completed", value: "completed" },
                    ]}
                    value={updatedTasks[item._id]?.status || item.status}
                    style={{
                      inputAndroid: {
                        fontSize: 14,
                        fontWeight: "bold",
                      },
                    }}
                  />
                </View>
              ) : (
                <Text className={`${getStatusColor(item.status)} font-semibold text-lg`}>
                  {item.status}
                </Text>
              )}
            </View>

            <Text className="font-semibold text-gray-700 mt-2">Notes:</Text>
            {editMode[item._id] ? (
              <TextInput
                className="bg-gray-200 p-2 rounded-lg border border-gray-300 text-gray-700"
                placeholder="Add notes..."
                value={updatedTasks[item._id]?.notes || item.notes}
                onChangeText={(text) => handleChange(item._id, "notes", text)}
                multiline={true}
              />
            ) : (
              <Text className="text-gray-600 mt-1 bg-gray-100 p-1 rounded-md">
                {item.notes || "No notes added"}
              </Text>
            )}

            {/* Request Status Section */}
            <View className="mt-3">
              {item.requestStatus === "requested" && (
                <Text className="text-orange-500 font-medium text-center">
                  🟠 Requested for approval
                </Text>
              )}
              {item.requestStatus === "approved" && (
                <Text className="text-green-600 font-medium text-center">
                  ✅ Task Approved
                </Text>
              )}
              {item.requestStatus === "declined" && (
                <Text className="text-red-600 font-medium text-center">
                  ❌ Task Declined
                </Text>
              )}

              {isApproved && (
                <>
                  <Text className="text-green-600 font-semibold mt-2">
                    Admin Review: {item.approveReview}
                  </Text>
                  <View className="flex-row items-center gap-3 mb-2">
                    <Text className="text-gray-700 font-semibold">Rating:</Text>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        className={`text-2xl ${item?.rating >= star ? "text-yellow-400" : "text-gray-300"
                          }`}
                      >
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
                      <Text className="text-red-600 font-semibold mt-2">
                        Decline Reason: {item.declineReason}
                      </Text>
                    </>
                  )}

                  <TouchableOpacity
                    className="bg-orange-600 mt-3 p-2 rounded-md flex-row justify-center items-center gap-2"
                    onPress={() =>
                      editMode[item._id] ? saveTask(item._id) : toggleEdit(item._id)
                    }
                  >
                    <Feather
                      name={editMode[item._id] ? "check" : "edit"}
                      size={18}
                      color="white"
                    />
                    <Text className="text-white font-semibold">
                      {editMode[item._id] ? "Save" : "Edit"}
                    </Text>
                  </TouchableOpacity>

                  {!editMode[item._id] &&
                    item.status === "completed" &&
                    item.requestStatus === "none" && (
                      <TouchableOpacity
                        className="bg-orange-600 mt-2 p-2 rounded-md"
                        onPress={() => requestTaskApproval(item._id)}
                      >
                        <Text className="text-white text-center font-semibold">
                          Submit for Approval
                        </Text>
                      </TouchableOpacity>
                    )}

                  {!editMode[item._id] &&
                    item.status === "completed" &&
                    item.requestStatus === "declined" && (
                      <TouchableOpacity
                        className="bg-orange-600 mt-2 p-2 rounded-md"
                        onPress={() => requestTaskApproval(item._id)}
                      >
                        <Text className="text-white text-center font-semibold">
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

  const ongoingTasks = tasks.filter(
    (task) => task.requestStatus !== "approved"
  );
  const completedTasks = tasks.filter(
    (task) => task.requestStatus === "approved"
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <ScrollView className="flex-1 bg-gray-100 p-3">
        {tasks.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10 text-lg">
            You don't have any assigned tasks!
          </Text>
        ) : (
          <>
            {ongoingTasks.length > 0 && (
              <View>
                <Text className="text-xl font-bold text-gray-800 mb-2">Ongoing Tasks</Text>
                {ongoingTasks.map(renderTask)}
              </View>
            )}

            {completedTasks.length > 0 && (
              <View className="mt-6 mb-5">
                <Text className="text-xl font-bold text-green-700 mb-2">
                  Completed Tasks
                </Text>
                {completedTasks.map((task) => (
                  <View key={task._id}>{renderTask(task)}</View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
      {/* Floating Button to Create Post (Admin Only) */}
      {userProfile?.role === "admin" && (
        <TouchableOpacity className="absolute bottom-5 right-5 bg-orange-600 rounded-full p-4 elevation-md"
          onPress={() => router.push("/add-task")}
        >
          <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MyTasksScreen;
