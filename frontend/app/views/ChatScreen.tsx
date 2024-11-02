import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
}

const ChatScreen = ({ route }: { route: any }) => {
  const { userId, receiverId } = route.params;
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        webSocketRef.current = new WebSocket(`ws://10.0.2.2:5094/api/message/connect?token=${token}`);
        
        webSocketRef.current.onopen = () => {
          console.log('WebSocket connection opened.');
        };

        webSocketRef.current.onmessage = (event) => {
          const receivedMessage: Message = JSON.parse(event.data);
          if (
            (receivedMessage.senderId === receiverId && receivedMessage.receiverId === userId) ||
            (receivedMessage.senderId === userId && receivedMessage.receiverId === receiverId)
          ) {
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          }
        };

        webSocketRef.current.onclose = () => {
          console.log('WebSocket connection closed.');
        };

        webSocketRef.current.onerror = (error) => {
          Alert.alert('Connection error');
        };
      } 
      catch (error) {
        Alert.alert('Connection error');
      }
    };

    connectWebSocket();

    return () => {
      webSocketRef.current?.close();
    };
  }, [userId, receiverId]);

  const sendMessage = () => {
    if (message.trim() && webSocketRef.current?.readyState === WebSocket.OPEN) {
      const messageData = {
        receiverId: receiverId,
        content: message,
      };
      webSocketRef.current.send(JSON.stringify(messageData));
      setMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.senderId === userId ? styles.sent : styles.received]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  messageList: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    maxWidth: '75%',
  },
  sent: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff4da6',
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: '#2e2e2e',
    borderColor: '#00ffff',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#262626',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderColor: '#00ffff',
    borderWidth: 1,
    color: '#fff',
    marginRight: 10,
    backgroundColor: '#1a1a1a',
  },
  sendButton: {
    backgroundColor: '#ff4da6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
});