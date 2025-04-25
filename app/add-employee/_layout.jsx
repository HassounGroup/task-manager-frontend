import { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/authContext";
import { Feather } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import { useCreds } from "creds";

export default function AddEmployeeScreen() {
    const Creds = useCreds();
    const { userToken } = useContext(AuthContext); // Use the token from context
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [reEnterPassword, setReEnterPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [location, setLocation] = useState("");
    const [jobCategory, setJobCategory] = useState("");
    const [jobTitle, setJobTitle] = useState("");

    const [locations, setLocations] = useState([]);  // To store locations from backend
    const [jobCategories, setJobCategories] = useState([]); // To store job categories from backend

    // Fetch job categories and locations when the component loads
    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobCategoryResponse = await fetch(`${Creds.BackendUrl}/api/job-categories`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                    },
                });
                const jobCategoryData = await jobCategoryResponse.json();
                setJobCategories(jobCategoryData);

                const locationResponse = await fetch(`${Creds.BackendUrl}/api/locations`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                    },
                });
                const locationData = await locationResponse.json();
                setLocations(locationData);
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Failed to fetch job categories or locations");
            }
        };

        fetchData();
    }, [userToken]);

    const handleAddEmployee = async () => {
        if (!email || !username || !password || !reEnterPassword || !fullName || !location || !jobCategory || !jobTitle) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        if (password !== reEnterPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        try {
            const response = await fetch(`${Creds.BackendUrl}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`, // Add token for authorization
                },
                body: JSON.stringify({
                    email,
                    phone,
                    username,
                    password,
                    fullName,
                    role: "employee",
                    location,
                    jobCategory,
                    jobTitle,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Employee added successfully");
                router.replace("/manage-employees"); // Navigate back to manage employees screen
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong");
        }
    };

    return (
        <View className="flex-1 justify-center p-5">
            <TouchableOpacity onPress={() => router.back()} className="absolute top-8 left-4 p-3">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text className="text-2xl font-bold mb-5 text-center">Add New Employee</Text>

            <TextInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                className="w-full p-4 mb-2 border border-gray-300 rounded-lg text-base text-gray-900"
            />
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                className="w-full p-4 mb-2 border border-gray-300 rounded-lg text-base text-gray-900"
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                className="w-full p-4 mb-2 border border-gray-300 rounded-lg text-base text-gray-900"
            />
            <TextInput
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={15}
                className="w-full p-4 mb-2 border border-gray-300 rounded-lg text-base text-gray-900"
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="w-full p-4 mb-2 border border-gray-300 rounded-lg text-base text-gray-900"
            />
            <TextInput
                placeholder="Re-enter Password"
                secureTextEntry
                value={reEnterPassword}
                onChangeText={setReEnterPassword}
                className="w-full p-4 mb-2 border border-gray-300 rounded-lg text-base text-gray-900"
            />

            {/* Dropdown for Location */}
            <View className="w-full p-0 mb-2 border border-gray-300 rounded-lg bg-gray-100">
                <RNPickerSelect
                    onValueChange={(value) => setLocation(value)}
                    items={locations.map((loc) => ({
                        label: loc.name,
                        value: loc.name,
                    }))}
                    placeholder={{ label: "Select Job Location", value: null }}
                    style={{
                        inputIOS: { fontSize: 16, color: "#374151" },
                        inputAndroid: { fontSize: 16, color: "#374151" },
                        placeholder: { color: "#9CA3AF" },
                    }}
                />
            </View>


            {/* Dropdown for Job Category */}
            <View className="w-full p-0 mb-2 border border-gray-300 rounded-lg bg-gray-100">
                <RNPickerSelect
                    onValueChange={(value) => setJobCategory(value)}
                    items={jobCategories.map((category) => ({
                        label: category.name,
                        value: category.name,
                    }))}
                    placeholder={{ label: "Select Job Category", value: null }}
                    style={{
                        inputIOS: { fontSize: 16, color: "#374151" },
                        inputAndroid: { fontSize: 16, color: "#374151" },
                        placeholder: { color: "#9CA3AF" },
                    }}
                />
            </View>

            <TextInput
                placeholder="Job Title"
                value={jobTitle}
                onChangeText={setJobTitle}
                className="w-full p-4 mb-2 border border-gray-300 rounded-lg text-base text-gray-900"
            />

            <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                className="bg-orange-600 p-4 rounded-lg mt-3 shadow-lg shadow-black"
                onPress={handleAddEmployee}
            >
                <Feather name="check-circle" size={20} color="white" />
                <Text className="ml-2 text-white font-bold text-lg">Add Employee</Text>
            </TouchableOpacity>
        </View>
    );
}
