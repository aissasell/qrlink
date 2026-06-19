// @ts-expect-error - CSS modules aren't typed by default
import '../global.css';
import { useShareIntent } from 'expo-share-intent';
import { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        const intentValue = shareIntent?.webUrl || shareIntent?.text;
        if (hasShareIntent && intentValue) {
          router.replace({ pathname: '/(dashboard)', params: { sharedUrl: intentValue } });
        } else {
          router.replace('/(dashboard)');
        }
      } else {
        router.replace('/');
      }
    }
  }, [user, loading, hasShareIntent, shareIntent]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return <Slot />;
}
