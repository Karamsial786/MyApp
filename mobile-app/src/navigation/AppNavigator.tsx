import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ReferralScreen from '../screens/ReferralScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';

// Define stack navigators
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const ReferralStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Home Stack
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Dashboard' }} />
    </HomeStack.Navigator>
  );
};

// Referral Stack
const ReferralStackNavigator = () => {
  return (
    <ReferralStack.Navigator>
      <ReferralStack.Screen name="ReferralScreen" component={ReferralScreen} options={{ title: 'My Referrals' }} />
    </ReferralStack.Navigator>
  );
};

// Profile Stack
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </ProfileStack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Referrals') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0369a1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Home" component={HomeStackNavigator} />
      <MainTab.Screen name="Referrals" component={ReferralStackNavigator} />
      <MainTab.Screen name="Profile" component={ProfileStackNavigator} />
    </MainTab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />;
};

export default AppNavigator;