import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { useShareIntent } from 'expo-share-intent';

export default function DashboardScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { resetShareIntent } = useShareIntent();
  
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (params.sharedUrl) {
      setNewUrl(params.sharedUrl as string);
    }
  }, [params.sharedUrl]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'links'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLinks(linksData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleCreateLink = async () => {
    if (!newUrl.trim()) return;
    
    // Basic URL validation
    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    setIsCreating(true);
    try {
      const shortId = Math.random().toString(36).substring(2, 8); // Simple random ID
      
      await addDoc(collection(db, 'links'), {
        userId: auth.currentUser?.uid,
        url: finalUrl,
        shortId,
        createdAt: serverTimestamp(),
        clicks: 0
      });
      
      setNewUrl('');
      if (params.sharedUrl) {
        resetShareIntent();
        router.setParams({ sharedUrl: '' });
        Alert.alert('Success', 'Shared link has been shortened!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-xl mb-3 border border-slate-100 shadow-sm">
      <Text className="text-slate-800 font-semibold mb-1" numberOfLines={1}>{item.url}</Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-blue-600 font-medium">qrl.ink/{item.shortId}</Text>
        <Text className="text-slate-400 text-sm">{item.clicks || 0} clicks</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <View className="bg-white p-4 rounded-2xl mb-6 shadow-sm border border-slate-100">
        <Text className="text-slate-800 font-semibold mb-2">
          {params.sharedUrl ? 'Shorten Shared Link' : 'Create New Short Link'}
        </Text>
        <TextInput
          className="border border-slate-200 rounded-lg p-3 mb-3 bg-slate-50 text-slate-800"
          placeholder="https://example.com"
          value={newUrl}
          onChangeText={setNewUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity 
          className="bg-blue-600 rounded-lg p-3 items-center"
          onPress={handleCreateLink}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Shorten</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Text className="text-slate-800 font-bold text-lg mb-3">Your Links</Text>
        <FlatList
          data={links}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="text-slate-400 text-center mt-10">No links created yet.</Text>
          }
        />
      </View>

      <TouchableOpacity 
        className="mt-4 p-4 items-center"
        onPress={handleSignOut}
      >
        <Text className="text-red-500 font-medium">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
