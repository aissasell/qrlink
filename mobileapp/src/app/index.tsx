import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
      </View>
    </View>
  );
}
