import { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreds } from "creds";

export default function ResetPassword() {
    const Creds = useCreds();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [usernameExists, setUsernameExists] = useState(null); // true, false, or null
    const [loading, setLoading] = useState(false);

    // Function to check if username exists
    const checkUsername = async (typedUsername) => {
        if (typedUsername.trim().length === 0) {
            setUsernameExists(null);
            setEmail("");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${Creds.BackendUrl}/api/users/check-username/${typedUsername}`);
            const data = await response.json();

            if (response.ok && data.exists) {
                setUsernameExists(true);
                setEmail(data.email);
            } else {
                setUsernameExists(false);
                setEmail("");
            }
        } catch (error) {
            console.error("Error checking username:", error);
            setUsernameExists(false);
            setEmail(""); // Clear email on error
        } finally {
            setLoading(false);
        }
    };

    // Trigger username check instantly on typing
    useEffect(() => {
        if (username) {
            checkUsername(username);
        } else {
            setUsernameExists(null);
            setEmail("");
        }
    }, [username]);

    // Function to generate a random password
    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handleResetPassword = async () => {
        if (!username || !email) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (usernameExists === false) {
            Alert.alert("Error", "Username does not exist.");
            return;
        }

        try {
            const new_password = await generatePassword();
            const response = await fetch(`${Creds.BackendUrl}/api/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, to_email: email, new_password }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "New password sent to your email.");
                router.replace("/signin");
            } else {
                Alert.alert("Error", data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            Alert.alert("Error", `Failed to reset password. ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center px-5 bg-gray-100">
            <TouchableOpacity onPress={() => router.back()} className="absolute top-8 left-2 p-5">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text className="text-3xl font-bold mb-5 text-center">Reset Password</Text>

            <TextInput
                placeholder="Username"
                onChangeText={setUsername}
                value={username}
                className="bg-white p-4 rounded-lg mb-3 border border-gray-300 text-base text-gray-900"
            />

            {usernameExists !== null && (
                <View className="flex-row justify-between items-center mb-3">
                    <Text className={`text-left ${usernameExists ? "text-green-600" : "text-red-600"}`}>
                        {usernameExists ? "Username exists." : "Username does not exist."}
                    </Text>
                    <Image
                        source={
                            usernameExists
                                ? require("../../assets/green-tick.png")
                                : require("../../assets/red-cross.png")
                        }
                        className="w-5 h-5"
                    />
                </View>
            )}

            <TextInput
                placeholder="Email"
                value={email}
                className="bg-white p-4 rounded-lg mb-3 border border-gray-300 text-base text-gray-900"
                editable={false} // Show fetched email
            />

            <TouchableOpacity
                onPress={handleResetPassword}
                className={`bg-orange-600 p-4 rounded-lg mt-3 ${(!usernameExists || loading) ? "opacity-50" : ""}`}
                disabled={!usernameExists || loading}
            >
                <Text className="text-white text-lg font-bold text-center">
                    {loading ? "Checking..." : "Send Reset Link"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
