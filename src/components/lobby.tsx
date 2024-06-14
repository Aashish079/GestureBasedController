import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {listenForBroadcast} from '../scripts/listen_broadcast';

const Lobby = () => {
  const [username, setUsername] = useState('');
  const [availableConnection, setAvailableConnection] = useState([]);

  const handleClick = async () => {
    try {
      const hostInfo = await listenForBroadcast();
      setAvailableConnection(Array.from(hostInfo));
    } catch (error) {
      console.error('Failed to listen for broadcast:', error);
    }
  };

  const renderConnection = ({item}) => {
    const [host, address] = item.split('@');
    const [ip, port] = address.split(':');

    return (
      <TouchableOpacity style={styles.deviceContainer}>
        <Text style={styles.deviceName}>Host: {host}</Text>
        <Text style={styles.deviceAddress}>IP: {ip}</Text>
        <Text style={styles.deviceAddress}>Port: {port}</Text>
      </TouchableOpacity>
    );
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
      <FlatList
        data={availableConnection}
        renderItem={renderConnection}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={
          <Text style={styles.footer}>
            Please trun on the host device and click enter
          </Text>
        }
      />
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
