import {View, Text, TextInput, StyleSheet, Button} from 'react-native';
import React, {useEffect, useState} from 'react';
import auth, {firebase} from '@react-native-firebase/auth';

const App = () => {
  console.log('App executed!');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState({});

  useEffect(() => {
    // Disable app verification for testing
    if (__DEV__) {
      auth().settings.appVerificationDisabledForTesting = true;
    }
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
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.contanier}>
      <TextInput
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
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  contanier: {
    gap: 20,
    alignItems: 'center',
    width: '100%',
    marginVertical: 'auto',
  },
  input: {borderWidth: 1, width: '90%'},
});
