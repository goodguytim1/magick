// app/(tabs)/business-dashboard.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import BusinessDashboard from '../../components/BusinessDashboard';

export default function BusinessDashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Dashboard</Text>
        <Text style={styles.subtitle}>Manage all your businesses</Text>
      </View>
      <BusinessDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5ff',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e2f3',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1530',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b4764',
  },
});
