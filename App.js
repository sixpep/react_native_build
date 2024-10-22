import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import auth, {firebase} from '@react-native-firebase/auth';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import {io} from 'socket.io-client';

class NotificationStore {
  constructor() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        // notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,

      requestPermissions: true,
    });

    // Create a notification channel
    PushNotification.createChannel(
      {
        channelId: 'my-channel-id', // (required)
        channelName: 'My Channel', // (required)
        channelDescription: 'A channel to categorise your notifications', // (optional)
        soundName: 'default', // (optional)
        importance: 4, // (optional)
        vibrate: true, // (optional)
      },
      // created => console.log(`createChannel returned '${created}'`), // (optional) callback
    );
  }

  testPush = (title, message) => {
    PushNotification.localNotification({
      channelId: 'my-channel-id',
      title: title, // (optional)
      message: message, // (required)
    });
  };
}

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState();
  const [FCMToken, setFCMToken] = useState('');
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState('');
  const [nums, setNums] = useState([]);

  useEffect(() => {
    // Connect to the backend server (use your server's IP and port)
    const socket = io('http://13.201.230.15:3000');

    // When connected, this will run
    socket.on('connect', () => {
      console.log('Connected to the server');

      // Send a message to the backend
      socket.emit('message', 'Hello from React Native!');

      socket.on('message', data => {
        console.log(data);
        setNums(data);
      });
    });

    // Cleanup the socket connection when the component unmounts
    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('Hey This message is sent by React Native App!');
    }
  };

  const appStore = new NotificationStore();

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM token = ', token);
      setFCMToken(token);
      return token;
    } catch (error) {
      console.log(error);
    }
  };

  const NotificationListener = () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      appStore.testPush(
        remoteMessage.notification.title,
        remoteMessage.notification.body,
      );
      console.log(
        'Notification caused app to open from background state',
        remoteMessage.notification,
      );
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          appStore.testPush(
            remoteMessage.notification.title,
            remoteMessage.notification.body,
          );
          console.log(
            'Notification from quit state',
            remoteMessage.notification,
          );
        }
      });

    messaging().onMessage(async remoteMessage => {
      appStore.testPush(
        remoteMessage.notification.title,
        remoteMessage.notification.body,
      );
      console.log(
        'Notification on foreground state....',
        remoteMessage.notification,
      );
    });
  };

  const sendToken = async () => {
    try {
      const resp = await axios.post(
        'http://13.201.230.15:3000/send-notification',
        {
          token: FCMToken,
        },
      );
      console.log(resp);
    } catch (error) {
      console.log(error);
      console.log('Error in sending fcm to backend', error);
    }
  };

  useEffect(() => {
    // Disable app verification for testing
    if (__DEV__) {
      auth().settings.appVerificationDisabledForTesting = true;
    }
    requestUserPermission();
    getFCMToken();
    NotificationListener();
  }, []);

  const sendOtp = async () => {
    try {
      const resp = await auth().signInWithPhoneNumber(`+1 ${phoneNumber}`);
      console.log(resp);
      setOtpStatus(resp);
    } catch (error) {
      console.log(error);
    }
  };

  const sendTestOtp = async () => {
    try {
      const test_number = '+1 650-555-1234';
      const confirmation = await auth().signInWithPhoneNumber(test_number);
      console.log(confirmation);
      setOtpStatus(confirmation);
    } catch (error) {
      console.log(error);
    }
  };

  const confirmOTP = async () => {
    try {
      const resp = await otpStatus.confirm(otp);
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };

  const confirmTestOTP = async () => {
    try {
      const resp = await otpStatus.confirm('123456');
      sendToken();
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* <TextInput
        placeholder="Phone"
        style={styles.input}
        onChangeText={text => setPhoneNumber(text)}
      />
      <Button title="Send OTP" onPress={sendOtp} />
      <Button title="Send Test OTP" onPress={sendTestOtp} />
      <TextInput
        placeholder="OTP"
        style={styles.input}
        onChangeText={text => setOtp(text)}
      />
      <Button title="Confirm OTP" onPress={confirmOTP} />
      <Button title="Confirm Test OTP" onPress={confirmTestOTP} />
      <Button title="Send Test Push Notification" onPress={appStore.testPush} />
      <Button title="Send FCM Token" onPress={sendToken} /> */}

      <ImageBackground
        resizeMode="cover"
        style={styles.imageBackground}
        source={{
          uri: 'https://w0.peakpx.com/wallpaper/196/45/HD-wallpaper-jio-phone-ma-blue-sphere-black-background.jpg',
        }}>
        {/* <View id="recaptcha-container" style={styles.content}>
          {otpStatus ? (
            <View style={styles.content}>
              <Text style={styles.title}>Verification</Text>
              <View style={styles.form}>
                <TextInput placeholder="OTP" style={styles.inputField} />
                <TouchableOpacity
                  style={styles.button}
                  onPress={confirmTestOTP}>
                  <Text style={styles.btnText}>Verify OTP</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.content}>
              <Text style={styles.title}>Sign In</Text>
              <View style={styles.form}>
                <TextInput
                  placeholder="Mobile Number"
                  style={styles.inputField}
                />
                <TouchableOpacity style={styles.button} onPress={sendTestOtp}>
                  <Text style={styles.btnText}>Send Test OTP</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View> */}

        <ScrollView contentContainerStyle={styles.numsContainer}>
          {nums.map((num, index) => (
            <View style={styles.tile} key={index}>
              <Text style={styles.socketMsg}>{num}</Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={sendToken}>
          <Text style={styles.btnText}>Register</Text>
        </TouchableOpacity>

        {/* <Button title="Send Message" onPress={sendMessage} /> */}
      </ImageBackground>
    </View>
  );
};

export default App;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   content: {
//     width: '90%',
//     alignItems: 'center',
//     gap: 20,
//     backgroundColor: 'white',
//     padding: 20,
//   },

//   title: {
//     fontSize: 32,
//     color: '#375B9D',
//     textAlign: 'center',
//     fontWeight: '600',
//   },

//   ImageBackground: {
//     flex: 1,
//     // alignItems: 'center',
//     // justifyContent: 'center',
//   },

//   form: {
//     width: '90%',
//     gap: 20,
//   },

//   inputField: {
//     backgroundColor: 'gainsboro',
//     borderRadius: 10,
//     paddingHorizontal: 20,
//   },

//   button: {
//     backgroundColor: '#375B9D',
//     padding: 10,
//     borderRadius: 5,
//   },

//   btnText: {
//     textAlign: 'center',
//     color: 'white',
//   },

//   socketMsg: {
//     backgroundColor: 'white',
//     padding: 30,
//     fontSize: 20,
//     width: '100%',
//   },

//   numsContainer: {
//     display: 'flex',
//     flexWrap: 'wrap',
//     gap: 20,
//   },
// });
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  numsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Enable wrapping
    justifyContent: 'space-around', // Optional: space out the tiles
    padding: 10,
  },
  tile: {
    width: '30%', // Adjust width as necessary for your layout
    aspectRatio: 1, // Keep tiles square
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Add background color
    borderRadius: 10, // Optional: rounded corners
  },
  socketMsg: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#375B9D',
    padding: 20,
    borderRadius: 5,
  },
  btnText: {
    textAlign: 'center',
    color: 'white',
  }, //
});
