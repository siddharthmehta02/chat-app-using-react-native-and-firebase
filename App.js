//@refresh reset
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TextInput, Button, View } from 'react-native';
import * as firebase from 'firebase'
import 'firebase/firestore'
import AsyncStorage from '@react-native-community/async-storage'
import { GiftedChat } from 'react-native-gifted-chat';

const firebaseConfig = {
  apiKey: "AIzaSyDuWHh1N4PUwS6ZMhAL0W--R9d6lf-HADo",
  authDomain: "chat-app-5d754.firebaseapp.com",
  projectId: "chat-app-5d754",
  storageBucket: "chat-app-5d754.appspot.com",
  messagingSenderId: "184643321354",
  appId: "1:184643321354:web:83187f04a3a200f72429f3"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// LogBox.ignoreLogs(['Warning:Setting a timer for a long period of time'])
const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])


  useEffect(() => {
    readUser()

    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messagesFirestore = querySnapshot.docChanges().filter(({ type }) => type === 'added').map(({ doc }) => {
        const message = doc.data()
        return { ...message, createdAt: message.createdAt.toDate() }
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendMessages(messagesFirestore)
    })
    return () => unsubscribe()
  }, [])

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser() {
    const user = await AsyncStorage.getItem('user')
    if (user) {
      console.log(user)
      setUser(JSON.parse(user))
    }
  }

  async function handlerPress() {
    const _id = Math.random().toString(36).substring(7)
    const user = { _id, name }
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  async function handleSend(messages) {
    const writes = messages.map(n => chatsRef.add(n))
    await Promise.all(writes)
  }

  if (!user) {
    return <View style={styles.container}>
      <Text>NO user</Text>
      <TextInput style={styles.input} placeholder="Enter Name" value={name} onChangeText={setName} />
      <Button title="Bang into chat!" onPress={() => handlerPress()} />
    </View>
  }

  return (

    <GiftedChat messages={messages} user={user} onSend={handleSend} />

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    width: '80%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray'
  }
});
