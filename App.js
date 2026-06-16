import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


async function registerForPushNotificationsAsync() {
 
  if (!Device.isDevice) {
    return false;
  }

 
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }


  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    
    return false;
  }

  return true;
}


async function sendNotification(inputText) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: ' Tin nhắn mới!',
      body: inputText,             
      data: {
        inputText: inputText,       
      },
      sound: true,
    },
    trigger: null, 
  });
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    
    registerForPushNotificationsAsync().then(granted => {
      setIsPermissionGranted(granted);
    });

    
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(' Notification nhận được:', notification);
    });

    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log(' User bấm vào notification, data:', data);

      if (data?.inputText) {
        
        setInputText(data.inputText);
      }
    });


    

   
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      return;
    }

    if (!isPermissionGranted) {
      return;
    }

    try {
      await sendNotification(inputText.trim());
      
    } catch (error) {
      console.error('Lỗi gửi notification:', error);
      
    }
  };

  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
     
        

       
        

        
        <View style={styles.card}>
          <Text style={styles.label}>Nội dung thông báo</Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập nội dung muốn gửi..."
            placeholderTextColor="#aaa"
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />

          <Text style={styles.charCount}>{inputText.length}/200</Text>

          
          <TouchableOpacity
            style={[styles.submitBtn, !inputText.trim() && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>Gửi Thông Báo</Text>
          </TouchableOpacity>

          
        </View>

        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2FF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3D3A8C',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#7B7B9E',
  },
  statusBadge: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignSelf: 'center',
  },
  statusGranted: {
    backgroundColor: '#D4EDDA',
  },
  statusDenied: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D3A8C',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D0CEF7',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2D2D2D',
    backgroundColor: '#FAFAFE',
    minHeight: 110,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: '#AAAACC',
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#B0ABF5',
    shadowOpacity: 0.1,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clearBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  clearBtnText: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#EEF0FF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D3A8C',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#555577',
    marginBottom: 5,
    lineHeight: 20,
  },
  fromNotifCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  fromNotifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E6A00',
    marginBottom: 8,
  },
  fromNotifText: {
    fontSize: 15,
    color: '#7A5000',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});