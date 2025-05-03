import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, Button, useTheme } from 'react-native-paper';

const NotFoundScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  
  // Navigate to home
  const goHome = () => {
    navigation.navigate('Main');
  };
  
  // Go back
  const goBack = () => {
    navigation.goBack();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.error}20` }]}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={80}
            color={theme.colors.error}
          />
        </View>
        
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={goHome}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            Go to Home
          </Button>
          
          <Button
            mode="outlined"
            onPress={goBack}
            style={styles.button}
            labelStyle={{ color: theme.colors.primary }}
          >
            Go Back
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    marginVertical: 6,
  },
});

export default NotFoundScreen;