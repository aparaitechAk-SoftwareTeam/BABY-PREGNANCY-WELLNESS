import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { Home, Activity, Calendar, FileText, User } from 'lucide-react-native';

export default function MotherTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E11D48',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: false,
        tabBarShowLabel: true,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Home size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Activity size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: 'Track',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Calendar size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: 'Appointments',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <FileText size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: 'Reports',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <User size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: 75,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabBarItem: {
    paddingHorizontal: 4,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'transparent',
  },
});
