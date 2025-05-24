import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCreds } from 'creds';
import { Tabs, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../contexts/authContext';

export default function TabLayout() {
  const Creds = useCreds();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { userProfile } = useContext(AuthContext);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token || !userProfile?.username) {
          // Defer to next frame to ensure navigation is ready
          requestAnimationFrame(() => {
            router.replace('/signin');
          });
        }
      } catch (error) {
        requestAnimationFrame(() => {
          router.replace('/signin');
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [userProfile]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e6560e" />
      </View>
    );
  }

  const renderHeader = () => (
    <View className="flex-row items-center justify-between border-b-[.3px] border-gray-300 bg-[#f3f4f6] px-4 py-4 drop-shadow-md">
      <TouchableOpacity onPress={() => router.push('/news')}>
        <Ionicons name="notifications" size={24} color={'#e6560e'} />
      </TouchableOpacity>

      <View className="flex-row items-center">
        <Text className="text-xl font-bold text-black">{userProfile?.username || 'User'}</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          {userProfile?.profilePic ? (
            <Image
              source={{ uri: `${Creds.BackendUrl}${userProfile?.profilePic}` }}
              className="ml-3 h-10 w-10 rounded-full border border-orange-600"
            />
          ) : (
            <View className="ml-2 h-10 w-10 content-center justify-center rounded-full bg-orange-600">
              <Text className="text-center text-2xl font-bold text-white">
                {userProfile?.username?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {renderHeader()}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#e6560e',
          tabBarStyle: { backgroundColor: '#f3f4f6', height: 60, shadowColor: '#f3f4f6' },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'My Tasks',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="todo"
          options={{
            title: 'To-Do',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkbox-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
});
