import { Feather, Ionicons } from '@expo/vector-icons';
import { useCreds } from 'creds';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../contexts/authContext';

export default function AddEmployeeScreen() {
  const Creds = useCreds();
  const { userToken } = useContext(AuthContext);
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [locations, setLocations] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);

  const [iosLocModalVisible, setIosLocModalVisible] = useState(false);
  const [iosJobModalVisible, setIosJobModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobCategoryResponse = await fetch(`${Creds.BackendUrl}/api/job-categories`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        const jobCategoryData = await jobCategoryResponse.json();
        setJobCategories(jobCategoryData);

        const locationResponse = await fetch(`${Creds.BackendUrl}/api/locations`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        const locationData = await locationResponse.json();
        setLocations(locationData);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch job categories or locations');
      }
    };

    fetchData();
  }, [userToken]);

  const handleAddEmployee = async () => {
    if (
      !email ||
      !username ||
      !password ||
      !reEnterPassword ||
      !fullName ||
      !location ||
      !jobCategory ||
      !jobTitle
    ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== reEnterPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${Creds.BackendUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          email,
          phone,
          username,
          password,
          fullName,
          role: 'employee',
          location,
          jobCategory,
          jobTitle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Employee added successfully');
        router.replace('/manage-employees');
      } else {
        Alert.alert('Error', data.message || 'Failed to add employee');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, paddingTop: 65 }}>
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 top-8 z-10 p-3">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="mb-6 text-center text-2xl font-bold">Add New Employee</Text>

        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          className="mb-3 w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
        />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          className="mb-3 w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          className="mb-3 w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
        />
        <TextInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={15}
          className="mb-3 w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
        />
        {/* <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="mb-3 w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
        /> */}
        {/* Password Input */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          className="mb-3 w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
        />
        <TextInput
          placeholder="Re-enter Password"
          secureTextEntry
          value={reEnterPassword}
          onChangeText={setReEnterPassword}
          className="mb-3 w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
        />

        {/* Location Picker */}
        <View className="mb-3 w-full">
          {Platform.OS === 'ios' ? (
            <>
              <TouchableOpacity
                onPress={() => setIosLocModalVisible(true)}
                className="flex h-14 w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3">
                <Text className={location ? 'text-gray-800' : 'text-gray-400'}>
                  {location || 'Select Job Location'}
                </Text>
              </TouchableOpacity>

              <Modal visible={iosLocModalVisible} animationType="slide" transparent={true}>
                <View className="bg-trasparent flex-1 justify-end">
                  <View className="rounded-t-3xl bg-white p-1">
                    <View className="mb-1 flex-row justify-end">
                      <TouchableOpacity
                        onPress={() => setIosLocModalVisible(false)}
                        className="px-5 pt-3">
                        <Text className="text-[1rem] font-semibold text-blue-600">Done</Text>
                      </TouchableOpacity>
                    </View>
                    <Picker
                      selectedValue={location}
                      onValueChange={(itemValue) => setLocation(itemValue)}>
                      <Picker.Item label="Select Job Location" value="" />
                      {locations.map((loc) => (
                        <Picker.Item key={loc.name} label={loc.name} value={loc.name} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <View className="rounded-xl border border-gray-300 bg-white px-2 py-1">
              <RNPickerSelect
                onValueChange={(value) => setLocation(value)}
                items={locations.map((loc) => ({
                  label: loc.name,
                  value: loc.name,
                }))}
                placeholder={{ label: 'Select Job Location', value: null }}
                useNativeAndroidPickerStyle={false}
                style={{
                  inputAndroid: {
                    fontSize: 16,
                    paddingHorizontal: 10,
                    color: '#374151',
                  },
                  placeholder: {
                    color: '#9CA3AF',
                  },
                }}
              />
            </View>
          )}
        </View>

        {/* Job Picker */}
        <View className="mb-3 w-full">
          {Platform.OS === 'ios' ? (
            <>
              <TouchableOpacity
                onPress={() => setIosJobModalVisible(true)}
                className="flex h-14 w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3">
                <Text className={jobCategory ? 'text-gray-800' : 'text-gray-400'}>
                  {jobCategory || 'Select Job Category'}
                </Text>
              </TouchableOpacity>

              <Modal visible={iosJobModalVisible} animationType="slide" transparent={true}>
                <View className="bg-trasparent flex-1 justify-end">
                  <View className="rounded-t-3xl bg-white p-1">
                    <View className="mb-1 flex-row justify-end">
                      <TouchableOpacity
                        onPress={() => setIosJobModalVisible(false)}
                        className="px-5 pt-3">
                        <Text className="text-[1rem] font-semibold text-blue-600">Done</Text>
                      </TouchableOpacity>
                    </View>
                    <Picker
                      selectedValue={jobCategory}
                      onValueChange={(itemValue) => setJobCategory(itemValue)}>
                      <Picker.Item label="Select Job Category" value="" />
                      {jobCategories.map((cat) => (
                        <Picker.Item key={cat.name} label={cat.name} value={cat.name} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <View className="rounded-xl border border-gray-300 bg-white px-2 py-1">
              <RNPickerSelect
                onValueChange={(value) => setJobCategory(value)}
                items={jobCategories.map((category) => ({
                  label: category.name,
                  value: category.name,
                }))}
                placeholder={{ label: 'Select Job Category', value: null }}
                useNativeAndroidPickerStyle={false}
                style={{
                  inputAndroid: {
                    fontSize: 16,
                    paddingHorizontal: 10,
                    color: '#374151',
                  },
                  placeholder: {
                    color: '#9CA3AF',
                  },
                }}
              />
            </View>
          )}
        </View>

        {/* <View className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-2 py-1">
          <RNPickerSelect
            onValueChange={(value) => setJobCategory(value)}
            items={jobCategories.map((category) => ({
              label: category.name,
              value: category.name,
            }))}
            placeholder={{ label: 'Select Job Category', value: null }}
            useNativeAndroidPickerStyle={false}
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 12,
                paddingHorizontal: 10,
                color: '#374151',
              },
              inputAndroid: {
                fontSize: 16,
                paddingHorizontal: 10,
                color: '#374151',
              },
              placeholder: {
                color: '#9CA3AF',
              },
            }}
          />
        </View> */}

        <TextInput
          placeholder="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
        />

        <TouchableOpacity
          onPress={handleAddEmployee}
          className="flex-row items-center justify-center rounded-xl bg-orange-600 p-4 shadow-md">
          <Feather name="check-circle" size={20} color="white" />
          <Text className="ml-2 text-lg font-bold text-white">Add Employee</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
