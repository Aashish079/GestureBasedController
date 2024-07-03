import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Button,
  Image,
} from 'react-native';
import { listenForBroadcast, useWebSocket } from '../scripts/listen_broadcast';

const Lobby = ({ navigation }) => {
  const { connectToServer, isConnected } = useWebSocket();
  const [username, setUsername] = useState('');

  const [availableConnection, setAvailableConnection] = useState<string[]>([]);
  useEffect(() => {
    if (isConnected) {
      navigation.navigate('Sensors');
    }
  }, [isConnected, navigation]);
  const handleClick = async () => {
    try {
      if (username === '') {
        Alert.alert('Input field is empty', 'Username can’t be empty');
      } else {
        const hostInfo = await listenForBroadcast();
        setAvailableConnection(Array.from(hostInfo));
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const makeConnection = async (ip, port, username) => {
    try {
      await connectToServer(ip, port, username);
    } catch (error) {
      console.log('Error ', error);
    }
  };
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/hero.png')} style={styles.image} />
      <Text style={styles.title}>Select your device</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setUsername(text)}
        value={username}
        placeholder="Enter username"
        placeholderTextColor="#888"
      />
      <Button
        title="Enter"
        onPress={() => {
          console.log(username);
          handleClick();
        }}
      />

      {availableConnection.map((hostInfo, index) => {
        if (availableConnection.length > 0) {
          const [host, address] = hostInfo.split('@');
          const [ip, port] = address.split(':');
          return (
            <TouchableOpacity style={styles.deviceContainer}
              key={port}
              onPress={() => makeConnection(ip, port, username)}>
              <View style={styles.deviceName} key={index}>
                <Text>Host: {host}</Text>
                <Text>Ip: {ip}</Text>

                <Text>Port: {port}</Text>
              </View>
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: '#fff',
  },
  deviceContainer: {
    padding: 20,
    borderBottomWidth: 1,

    borderBottomColor: '#444',
  },
  deviceName: {
    margin: 15,
    color: '#fff',
    fontSize: 18,
  },
  deviceAddress: {
    color: '#888',
    fontSize: 14,
  },
  footer: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Lobby;
