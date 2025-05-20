import { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/authContext";
import { useCreds } from "creds";

export default function ManageEmployeesScreen() {
  const Creds = useCreds();
  const router = useRouter();
  const { userToken, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userToken) {
      setError("You are not logged in. Please log in to access this page.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("🚀 Fetching Employees...");
        const response = await fetch(`${Creds.BackendUrl}/api/users`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (response.ok) {
          if (Array.isArray(data)) {
            setEmployees(data.filter((user) => user.role === "employee"));
          } else {
            console.error("⚠️ Data is not an array:", data);
          }
        } else {
          console.error("❌ Error Response:", data);
          if (data.message === "Invalid or expired token") {
            logout(); // Log out on token expiry
          }
        }
      } catch (error) {
        console.error("💥 Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userToken, logout]);

  const goToAddEmployee = () => {
    router.push("/add-employee");
  };

  const handleDeleteEmployee = (id) => {
    Alert.alert("Delete Employee", "Are you sure you want to delete this employee?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const response = await fetch(`${Creds.BackendUrl}/api/users/delete-user/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${userToken}` },
            });
            if (response.ok) {
              setEmployees(employees.filter((employee) => employee._id !== id));
            } else {
              console.error("Failed to delete employee", await response.text());
            }
          } catch (error) {
            console.error("Failed to delete employee", error);
          }
        },
      },
    ]);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.jobCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f3f4f6]">
        <ActivityIndicator size="large" color="#e6560e" />
        <Text className="mt-2 text-lg text-gray-500">Loading employees...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <TouchableOpacity onPress={() => router.back()} className="absolute top-5 left-5">
        <Ionicons name="arrow-back" size={25} color="black" />
      </TouchableOpacity>

      <Text className="text-2xl font-bold text-gray-800 mb-2 mt-14 text-center">Manage Employees</Text>
      <Text className="text-center text-sm text-gray-500 mb-3">
        Add/Edit/Delete employee's and employee details here
      </Text>

      <TouchableOpacity onPress={goToAddEmployee} className="flex-row bg-orange-600 p-3 rounded-lg mb-3 gap-4 justify-center items-center">
        <Ionicons name="person-add" size={18} color="white" />
        <Text className="text-white text-lg font-semibold">Add New Employee</Text>
      </TouchableOpacity>

      <TextInput
        style={{ padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 12 }}
        placeholder="Search by username or email or fullname.."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {error && (
        <View className="bg-red-500 p-4 rounded-lg mb-5 items-center">
          <Text className="text-white text-lg font-semibold">{error}</Text>
          <TouchableOpacity onPress={() => router.push("/signin")} className="mt-3 bg-white p-3 rounded-lg">
            <Text className="text-blue-600 font-semibold">Go to Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredEmployees.length > 0 ? (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-lg mb-2 shadow-sm flex-row justify-between">
              <View className="">
              <Text className="text-xl font-semibold text-gray-800">{item.fullName}</Text>
              <Text className="text-sm text-gray-600">Username: {item.username}</Text>
              <Text className="text-sm text-gray-600">Email: {item.email}</Text>
              <Text className="text-sm text-gray-600">Phone: {item.phone}</Text>
              <Text className="text-sm text-gray-600">Job Category: {item.jobCategory}</Text>
              <Text className="text-sm text-gray-600">Job Title: {item.jobTitle}</Text>
              <Text className="text-sm text-gray-600">Place: {item.location}</Text>
              </View>
             

              <View className="flex-coloumn justify-end mt-4 gap-2">
                <TouchableOpacity
                  onPress={() => router.push(`/edit-employee/${item._id}`)}
                  className="bg-orange-600 py-2 px-4 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteEmployee(item._id)} className="bg-red-500 py-2 px-4 rounded-lg">
                  <Text className="text-white font-semibold text-center">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text className="text-center text-lg text-gray-500">No employees found</Text>
      )}
    </View>
  );
}
