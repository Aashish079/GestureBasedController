import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';
import {listenForBroadcast, useWebSocket} from '../scripts/listen_broadcast';
//import NetInfo from '@react-native-community/netinfo'; 
const Lobby = ({navigation}) => {
  const {connectToServer, isConnected} = useWebSocket();
  const [username, setUsername] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#C9365A');
  const [availableConnection, setAvailableConnection] = useState<string[]>([]);
  // useEffect(() => {
  //   const unsubscribe = NetInfo.addEventListener(state => {
  //     setIsWifiConnected(state.type === 'wifi' && state.isConnected);
  //   });

  //   return () => unsubscribe();
  // }, []);
  useEffect(() => {
    if (isConnected) {
      navigation.navigate('Sensors');
    }
  }, [isConnected, navigation]);
  const handleClick = async () => {
    setAvailableConnection([]);
    try {
      if (username === '') {
        Alert.alert('Input field is empty', 'Username can’t be empty');
      } else {
        setBackgroundColor('#871D34');
        setTimeout(() => {
          setBackgroundColor('#C9365A');
        }, 5000);
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
      Alert.alert('Connection Failed', error.message);
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

      <Pressable
        style={[styles.button, {backgroundColor}]}
        onPress={() => {
          handleClick();
        }}>
        <Text style={styles.text}>Search</Text>
      </Pressable>

      {availableConnection.map((hostInfo, index) => {
        if (availableConnection.length > 0) {
          const [host, address] = hostInfo.split('@');
          const [ip, port] = address.split(':');
          return (
            <TouchableOpacity
              style={styles.deviceContainer}
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
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
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
