import React from "react";
import { useTheme } from "@/components/ThemeContext";
import { theme } from "@/styles/Theme";
import { Stack } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import GenericHeader from "@/components/navigation/GenericHeader";

const HeaderWrapper = () => {
  const { theme: currentTheme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <GenericHeader
      title={t.breathing.title}
      toggleTheme={toggleTheme}
      backPath="/(patient)/home"
    />
  );
};

const BreathingLayoutInner = () => {
  const { theme: currentTheme } = useTheme();
  const colors = theme[currentTheme];

  return (
    <Stack
      screenOptions={{
        header: () => <HeaderWrapper />,
        headerStyle: {
          backgroundColor: colors.header,
        },
        headerTintColor: colors.text,
        animation: "slide_from_right",
        headerTitleStyle: {
          fontFamily: "Poppins-SemiBold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
};

export default BreathingLayoutInner;