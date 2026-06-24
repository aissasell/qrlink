import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getFriendlyAuthError } from '../../lib/firebase-errors';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '829321500821-h9ha46jnosd5iqeqknch1e9akaruif0p.apps.googleusercontent.com', // Replace with your Web Client ID from Firebase Console
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential).catch((error) => {
          Alert.alert('Error', getFriendlyAuthError(error));
        });
      }
    } else if (response?.type === 'error') {
      Alert.alert('Error', getFriendlyAuthError(response.error));
    }
  }, [response]);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', getFriendlyAuthError(error));
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-slate-50">
      <View className="items-center mb-10">
        <Text className="text-4xl font-bold text-slate-800">QRLink</Text>
        <Text className="text-slate-500 mt-2">Shorten & Track Links</Text>
      </View>

      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <TextInput
          className="border border-slate-200 rounded-lg p-4 mb-4 text-slate-800 bg-slate-50"
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          className="border border-slate-200 rounded-lg p-4 mb-6 text-slate-800 bg-slate-50"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          className="bg-blue-600 rounded-lg py-4 items-center"
          onPress={handleAuth}
        >
          <Text className="text-white font-semibold text-lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-6 items-center"
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text className="text-slate-500">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mt-6 mb-6">
          <View className="flex-1 h-px bg-slate-200" />
          <Text className="text-slate-400 font-medium px-4">OR</Text>
          <View className="flex-1 h-px bg-slate-200" />
        </View>

        <TouchableOpacity 
          className="bg-slate-800 rounded-lg py-4 items-center flex-row justify-center"
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Text className="text-white font-semibold text-lg">
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
