// components/AnxietyDataViewer.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { theme } from "@/styles/Theme";
import { websocketService } from "@/services/websocketService";
import type { SensorData, AnxietyAnalysis } from "@/types/sensorTypes";

interface AnxietyDataViewerProps {
  userId: string;
}

export const AnxietyDataViewer: React.FC<AnxietyDataViewerProps> = ({
  userId,
}) => {
  const { theme: currentTheme } = useTheme();
  const colors = theme[currentTheme];
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [analysis, setAnalysis] = useState<AnxietyAnalysis | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleSensorData = (data: {
      sensorData: SensorData;
      analysis: AnxietyAnalysis;
      userId?: string;
    }) => {
      console.log("[AnxietyDataViewer] Received sensor data:", data);
      console.log("[AnxietyDataViewer] Current userId:", userId);

      // Use the userId from sensorData if undefined
      const receivedUserId = data.userId || data.sensorData.userId;

      console.log("[AnxietyDataViewer] Received UserId:", receivedUserId);

      if (receivedUserId === userId) {
        console.log("[AnxietyDataViewer] Updating state with sensor data");
        setSensorData(data.sensorData);
        setAnalysis(data.analysis);
        setLastUpdateTime(new Date());
      } else {
        console.log("[AnxietyDataViewer] UserId mismatch:", {
          receivedUserId,
          currentUserId: userId,
        });
      }
    };

    websocketService.on("sensorData", handleSensorData);

    return () => {
      websocketService.removeListener("sensorData", handleSensorData);
    };
  }, [userId]);

  if (!sensorData || !analysis) {
    return (
      <View style={styles.container}>
        <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
          Waiting for sensor data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sensor Data
        </Text>
        <View style={[styles.dataCard, { backgroundColor: colors.surface }]}>
          <View style={styles.dataRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              HRV:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {sensorData.hrvData.value.toFixed(2)} ms (Quality:{" "}
              {sensorData.hrvData.quality}%)
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              EDA:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {sensorData.edaData.value.toFixed(2)} µS (Quality:{" "}
              {sensorData.edaData.quality}%)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Analysis
        </Text>
        <View style={[styles.dataCard, { backgroundColor: colors.surface }]}>
          <View style={styles.dataRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Status:
            </Text>
            <Text
              style={[
                styles.value,
                { color: analysis.isAnxious ? colors.error : colors.success },
              ]}
            >
              {analysis.isAnxious ? "Anxiety Detected" : "Normal State"}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Confidence:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {(analysis.confidence * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Severity:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {analysis.severity}
            </Text>
          </View>
          {analysis.triggers && analysis.triggers.length > 0 && (
            <View style={styles.triggersContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Triggers:
              </Text>
              {analysis.triggers.map((trigger, index) => (
                <Text
                  key={index}
                  style={[styles.triggerItem, { color: colors.text }]}
                >
                  • {trigger}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {lastUpdateTime && (
        <Text style={[styles.updateTime, { color: colors.textSecondary }]}>
          Last updated: {lastUpdateTime.toLocaleTimeString()}
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },
  dataCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  value: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  triggersContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  triggerItem: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginLeft: 16,
    marginTop: 4,
  },
  updateTime: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 8,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 20,
  },
});
