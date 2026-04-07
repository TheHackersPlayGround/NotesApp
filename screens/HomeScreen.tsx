import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, FAB, Text, TextInput, Button, Modal, Portal, Avatar, Menu, IconButton, Divider } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { fetchPosts, createPost, updatePost, deletePost, Post } from '@shared-api/postsApi';

export default function HomeScreen() {

  const { userId, fullname, email } = useLocalSearchParams<{ 
    userId: string; 
    fullname: string; 
    email: string 
  }>(); 
  
  const uID = Number(userId);

  const [data, setData] = useState<Post[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [sweetAlert, setSweetAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'confirm',
    onConfirm: () => {},
  });

  const emojiScale = useSharedValue(1);

  const triggerAlert = (title: string, message: string, type: 'success' | 'error' | 'confirm' = 'success', onConfirmAction?: () => void) => {
    setSweetAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm: onConfirmAction ? onConfirmAction : () => setSweetAlert(prev => ({ ...prev, visible: false })),
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!uID) { 
        router.replace('/'); 
        return; 
    }
    emojiScale.value = withRepeat(withSequence(withTiming(1.2, { duration: 600 }), withTiming(1, { duration: 600 })), -1, true);
    loadData();
  }, [uID]);

  const loadData = async () => {
    try {
      console.log(`📡 Fetching notes for User ID: ${uID}...`);
      const json = await fetchPosts(uID);
      
      setData(Array.isArray(json) ? json.filter(item => item && item.id) : []);
    } catch (e: any) { 
      
      console.error("❌ Fetch Error Detail:", e.message); 
      triggerAlert("Error", "The server sent back an invalid response. Check your XAMPP/PHP errors.", "error"); 
    } finally { 
      setLoadingFetch(false); 
      setRefreshing(false); 
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [uID]);

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      const res = await createPost(uID, title, body);
      if (res && res.id) {
          setData(prev => [res, ...prev]);
          setTitle(''); setBody('');
          setAddModalVisible(false);
          triggerAlert("Saved", "Note added successfully! 📝", "success");
      } else {
          await loadData();
          setAddModalVisible(false);
      }
    } catch (e) { 
      triggerAlert("Save Failed", "Check server connection.", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deletePost(id);
      setData(prev => prev.filter(item => item.id !== id));
      setModalVisible(false);
      triggerAlert("Deleted", "Note removed.", "success");
    } catch (error) { 
      triggerAlert("Error", "Delete failed.", "error"); 
    } finally { 
      setDeleting(false); 
    }
  };

  const handleUpdate = async () => {
    if (!selectedPost) return;
    setUpdating(true);
    try {
      const updated = await updatePost(selectedPost.id, editTitle, editBody);
      if (updated && updated.id) {
          setData(prev => prev.map(item => item.id === selectedPost.id ? updated : item));
          setSelectedPost(updated);
      } else {
          await loadData();
      }
      setIsEditing(false);
      triggerAlert("Updated", "Changes saved!", "success");
    } catch (e) { 
      triggerAlert("Error", "Update failed.", "error"); 
    } finally { 
      setUpdating(false); 
    }
  };

  const animatedEmojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: emojiScale.value }] }));

  const renderItem = ({ item }: { item: Post }) => {
    const isModified = item.updated_at && item.updated_at !== item.created_at;
    return (
      <TouchableOpacity onPress={() => { setSelectedPost(item); setModalVisible(true); setIsEditing(false); }}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>{item.title}</Text>
            <Text variant="bodyMedium" numberOfLines={2} style={styles.cardBody}>{item.body}</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>Created: {formatDate(item.created_at)}</Text>
              {isModified && <Text style={styles.modifiedText}> • Edited: {formatDate(item.updated_at)}</Text>}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="headlineLarge" style={styles.hello}>Hello World! </Text>
          <Animated.View style={animatedEmojiStyle}><Text variant="headlineLarge" style={styles.hello}>😊</Text></Animated.View>
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<IconButton icon="menu" iconColor="white" size={30} onPress={() => setMenuVisible(true)} />}
          contentStyle={{ backgroundColor: 'white' }}
        >
          <Menu.Item 
            leadingIcon="account" 
            onPress={() => { 
              setMenuVisible(false); 
              router.push({
                pathname: '/account',
                params: { userId: String(uID), fullname: String(fullname), email: String(email) } 
              }); 
            }} 
            title="My Account" 
          />
          <Divider />
          <Menu.Item 
            leadingIcon="logout" 
            onPress={() => { 
              setMenuVisible(false); 
              triggerAlert("Logout", "Confirm log out?", "confirm", () => router.replace('/')); 
            }} 
            title="Log Out" 
          />
        </Menu>
      </View>

      {loadingFetch && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 50 }} color="#1976D2" />
      ) : (
        <FlatList 
          data={data} 
          keyExtractor={(item) => item.id.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Avatar.Icon size={80} icon="note-edit-outline" style={{ backgroundColor: 'transparent' }} color="#CCC" />
              <Text style={{ color: '#999' }}>No notes found. Tap + to start!</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976D2']} tintColor={'#1976D2'} />
          }
        />
      )}

      <Portal>
        <FAB icon="plus" style={styles.fabAdd} onPress={() => setAddModalVisible(true)} color="white" />

        <Modal visible={addModalVisible} onDismiss={() => setAddModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text variant="headlineSmall" style={styles.modalTitle}>New Note</Text>
          <TextInput label="Note Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
          <TextInput label="Note Content" value={body} onChangeText={setBody} mode="outlined" multiline numberOfLines={5} style={styles.input} />
          <View style={styles.modalActions}>
            <Button onPress={() => setAddModalVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} loading={saving} buttonColor="#1976D2">Save Note</Button>
          </View>
        </Modal>

        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {selectedPost && (
            <View>
              {isEditing ? (
                <>
                  <TextInput label="Title" value={editTitle} onChangeText={setEditTitle} mode="outlined" style={styles.input} />
                  <TextInput label="Content" value={editBody} onChangeText={setEditBody} mode="outlined" multiline style={styles.input} />
                  <View style={styles.modalActions}>
                    <Button onPress={() => setIsEditing(false)}>Cancel</Button>
                    <Button mode="contained" onPress={handleUpdate} loading={updating}>Update</Button>
                  </View>
                </>
              ) : (
                <>
                  <Text variant="headlineSmall" style={styles.modalTitle}>{selectedPost.title}</Text>
                  <Text style={styles.modalBody}>{selectedPost.body}</Text>
                  <View style={styles.modalActions}>
                    <Button onPress={() => handleDelete(selectedPost.id)} textColor="#D32F2F" loading={deleting}>Delete</Button>
                    <View style={{ flexDirection: 'row' }}>
                      <Button onPress={() => { setEditTitle(selectedPost.title); setEditBody(selectedPost.body); setIsEditing(true); }}>Edit</Button>
                      <Button onPress={() => setModalVisible(false)}>Close</Button>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}
        </Modal>

        <Modal visible={sweetAlert.visible} onDismiss={() => setSweetAlert(p => ({ ...p, visible: false }))} contentContainerStyle={styles.sweetAlertContainer}>
          <View style={{ alignItems: 'center' }}>
            <Avatar.Icon 
              size={70} 
              icon={sweetAlert.type === 'success' ? 'check-circle' : sweetAlert.type === 'error' ? 'alert-circle' : 'help-circle'} 
              style={{ backgroundColor: 'transparent' }} 
              color={sweetAlert.type === 'success' ? '#4CAF50' : sweetAlert.type === 'error' ? '#F44336' : '#2196F3'}
            />
            <Text style={styles.sweetTitle}>{sweetAlert.title}</Text>
            <Text style={styles.sweetMessage}>{sweetAlert.message}</Text>
            <View style={styles.sweetActions}>
              {sweetAlert.type === 'confirm' && <Button mode="text" onPress={() => setSweetAlert(p => ({ ...p, visible: false }))}>Cancel</Button>}
              <Button mode="contained" buttonColor={sweetAlert.type === 'error' ? '#F44336' : '#1976D2'} onPress={() => { sweetAlert.onConfirm(); setSweetAlert(p => ({ ...p, visible: false })); }}>
                {sweetAlert.type === 'confirm' ? 'Yes, Log Out' : 'OK'}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e3e3e5' },
  header: { height: 110, paddingTop: 40, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f55e3', elevation: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  hello: { fontSize: 30, fontWeight: 'bold', color: '#f9f5f5' },
  input: { marginBottom: 15, backgroundColor: 'white' },
  listContainer: { paddingTop: 10, paddingBottom: 100, paddingHorizontal: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  card: { marginBottom: 12, backgroundColor: 'white' },
  cardTitle: { fontWeight: 'bold' },
  cardBody: { color: '#666' },
  dateContainer: { marginTop: 8, borderTopWidth: 0.5, borderTopColor: '#EEE', paddingTop: 4, flexDirection: 'row' },
  dateText: { fontSize: 10, color: '#999' },
  modifiedText: { fontSize: 10, color: '#1976D2', marginLeft: 5 },
  fabAdd: { position: 'absolute', margin: 16, left: 20, bottom: 30, backgroundColor: '#1976D2', elevation: 8 },
  modalContainer: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 12 },
  modalTitle: { fontWeight: 'bold', marginBottom: 15 },
  modalBody: { color: '#444', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sweetAlertContainer: { backgroundColor: 'white', padding: 30, margin: 40, borderRadius: 20, elevation: 10 },
  sweetTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  sweetMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 15 },
  sweetActions: { flexDirection: 'row', gap: 10, marginTop: 10 }
});