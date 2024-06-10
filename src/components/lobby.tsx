import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button} from 'react-native';
import {listenForBroadcast, connectToServer} from '../scripts/listen_broadcast';
const Lobby = () => {
  const [username, setUsername] = useState('');
  const [availableConnection, setAvailableConnection] = useState<string[]>([]);
  const handleClick = async () => {
    try {
      const hostInfo = await listenForBroadcast();

      setAvailableConnection(Array.from(hostInfo));
    } catch (error) {
      console.error('Failed to listen for broadcast:', error);
    }
  };
  return (
    <View>
      <Text>Lobby</Text>
      <Text>Input a username</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setUsername(text)}
        value={username}
        placeholder="Enter username"
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
            //Pachhi yo buttonbanaune 
            <View key={index}>
              <Text>Host: {host}</Text>
              <Text>Ip: {ip}</Text>

              <Text>Port: {port}</Text>
            </View>
          );
        }
      })}
 
    </View>
  );
};
const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default Lobby;