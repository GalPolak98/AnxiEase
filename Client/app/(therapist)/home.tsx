import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { theme } from '@/Styles/Theme';
import CustomButton from '@/components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

// Mock data for patients
const MOCK_PATIENTS = [
  { id: '1', name: 'John Doe', lastActivity: '2 hours ago', status: 'High Anxiety' },
  { id: '2', name: 'Jane Smith', lastActivity: '1 day ago', status: 'Stable' },
  { id: '3', name: 'Mike Johnson', lastActivity: '3 hours ago', status: 'Moderate Anxiety' },
];

export const TherapistHomeScreen = () => {
  const { theme: currentTheme } = useTheme();
  const colors = theme[currentTheme];

  return (
    <ScrollView 
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Header Section */}
      <View className="p-4 border-b" style={{ borderColor: colors.border }}>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text style={{ color: colors.text }} className="text-2xl font-pbold">
              Welcome, Dr. Johnson
            </Text>
            <Text style={{ color: colors.textSecondary }} className="font-pregular">
              You have 3 patients needing attention
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mt-4">
          <CustomButton
            title="Patients"
            handlePress={() => {}}
            variant="secondary"
            icon={<Ionicons name="people-outline" size={20} color={colors.text} />}
            containerStyles="flex-1 mx-1"
          />
          <CustomButton
            title="Messages"
            handlePress={() => {}}
            variant="secondary"
            icon={<Ionicons name="chatbubble-outline" size={20} color={colors.text} />}
            containerStyles="flex-1 mx-1"
          />
          <CustomButton
            title="Schedule"
            handlePress={() => {}}
            variant="secondary"
            icon={<Ionicons name="calendar-outline" size={20} color={colors.text} />}
            containerStyles="flex-1 mx-1"
          />
          <CustomButton
            title="Settings"
            handlePress={() => {}}
            variant="secondary"
            icon={<Ionicons name="settings-outline" size={20} color={colors.text} />}
            containerStyles="flex-1 mx-1"
          />
        </View>
      </View>

      {/* Patients List */}
      <View className="p-4">
        <Text style={{ color: colors.text }} className="text-xl font-psemibold mb-4">
          Recent Patient Activity
        </Text>
        
        {MOCK_PATIENTS.map((patient) => (
          <TouchableOpacity
            key={patient.id}
            className="p-4 border rounded-lg mb-3"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text style={{ color: colors.text }} className="font-pmedium text-lg">
                  {patient.name}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="font-pregular">
                  Last active {patient.lastActivity}
                </Text>
              </View>
              <View 
                className="px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: patient.status === 'High Anxiety' 
                    ? colors.error 
                    : patient.status === 'Moderate Anxiety'
                    ? colors.warning
                    : colors.success,
                  opacity: 0.2
                }}
              >
                <Text 
                  style={{ 
                    color: patient.status === 'High Anxiety' 
                      ? colors.error 
                      : patient.status === 'Moderate Anxiety'
                      ? colors.warning
                      : colors.success
                  }}
                  className="font-pmedium"
                >
                  {patient.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default TherapistHomeScreen;