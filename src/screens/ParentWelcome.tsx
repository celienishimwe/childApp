import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface ParentWelcomeProps {
  parent: any;
  onLogout: () => void;
  onBack: () => void;
}

const ParentWelcome: React.FC<ParentWelcomeProps> = ({ parent, onLogout, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {parent?.name || 'Parent'}!</Text>
      <Button title="Back" onPress={onBack} />
      <Button title="Logout" onPress={onLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ParentWelcome; 