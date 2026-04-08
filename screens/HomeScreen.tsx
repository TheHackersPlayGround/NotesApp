import { useIsFocused } from '@react-navigation/native';
import { createPost, deletePost, fetchPosts, Post, updatePost } from '@shared-api/postsApi';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, Divider, FAB, IconButton, Menu, Modal, Portal, Text, TextInput } from 'react-native-paper';
import Animated, {
  FadeIn, FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

// Import Bootstrap utilities
import { c, s } from '../styles/bootstrap';

// 1. The Quotes Array
const quotes = [
  "\"Start writing, no matter what. The water does not flow until the faucet is turned on.\" — Louis L’Amour",
  "\"You don’t have to be great to start, but you have to start to be great.\" — Zig Ziglar",
  "\"The secret of getting ahead is getting started.\" — Mark Twain",
  "\"You can make anything by writing.\" — C.S. Lewis",
  "\"A professional writer is an amateur who didn’t quit.\" — Richard Bach",
  "\"I don't wait for moods. You accomplish nothing if you do that. Your mind must know it has got to get down to work.\" — Pearl S. Buck",
  "\"Writing is a calling, not a choice.\" — Isabel Allende",
  "\"The only place where success comes before work is in the dictionary.\" — Vidal Sassoon",
  "\"Words are our most inexhaustible source of magic.\" — J.K. Rowling",
  "\"I can shake off everything as I write; my sorrows disappear, my courage is reborn.\" — Anne Frank",
  "\"The idea is to write it so that people hear it and it slides through the brain and goes straight to the heart.\" — Maya Angelou",
  "\"True alchemists... change the world into words.\" — William H. Gass"
];

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const { userId, fullname, email } = useLocalSearchParams<{ userId: string; fullname: string; email: string }>(); 
  const uID = useMemo(() => Number(userId), [userId]);

  const [data, setData] = useState<Post[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 2. State for Quotes
  const [quoteIndex, setQuoteIndex] = useState(0);

  // States for Modals
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
    visible: false, title: '', message: '', type: 'success' as 'success' | 'error' | 'confirm',
    onConfirm: () => {},
  });

  const emojiScale = useSharedValue(1);

  const triggerAlert = (title: string, message: string, type: 'success' | 'error' | 'confirm' = 'success', onConfirmAction?: () => void) => {
    setSweetAlert({
      visible: true, title, message, type,
      onConfirm: onConfirmAction ? onConfirmAction : () => setSweetAlert(prev => ({ ...prev, visible: false })),
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!uID) { router.replace('/'); return; }
    emojiScale.value = withRepeat(withSequence(withTiming(1.2, { duration: 600 }), withTiming(1, { duration: 600 })), -1, true);
    loadData();
    
    // 3. Logic to rotate quotes
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 10000); 
    return () => clearInterval(interval);
  }, [uID]);

  const loadData = async () => {
    try {
      const json = await fetchPosts(uID);
      setData(Array.isArray(json) ? json.filter(item => item && item.id) : []);
    } catch (e) { triggerAlert("Error", "Server connection failed.", "error"); }
    finally { setLoadingFetch(false); setRefreshing(false); }
  };

  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [uID]);

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      const res = await createPost(uID, title, body);
      if (res?.id) {
          setData(prev => [res, ...prev]);
          setTitle(''); setBody('');
          setAddModalVisible(false);
          triggerAlert("Saved", "Note added successfully! 📝", "success");
      } else { await loadData(); setAddModalVisible(false); }
    } catch (e) { triggerAlert("Save Failed", "Check server connection.", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deletePost(id);
      setData(prev => prev.filter(item => item.id !== id));
      setModalVisible(false);
      triggerAlert("Deleted", "Note removed.", "success");
    } catch (error) { triggerAlert("Error", "Delete failed.", "error"); }
    finally { setDeleting(false); }
  };

  const handleUpdate = async () => {
    if (!selectedPost) return;
    setUpdating(true);
    try {
      const updated = await updatePost(selectedPost.id, editTitle, editBody);
      if (updated?.id) {
          setData(prev => prev.map(item => item.id === selectedPost.id ? updated : item));
          setSelectedPost(updated);
      } else { await loadData(); }
      setIsEditing(false);
      triggerAlert("Updated", "Changes saved!", "success");
    } catch (e) { triggerAlert("Error", "Update failed.", "error"); }
    finally { setUpdating(false); }
  };

  const animatedEmojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: emojiScale.value }] }));

  const renderItem = ({ item }: { item: Post }) => {
    const isModified = item.updated_at && item.updated_at !== item.created_at;
    return (
      <TouchableOpacity onPress={() => { setSelectedPost(item); setModalVisible(true); setIsEditing(false); }}>
        <Card style={[s.mb3, s.bgWhite, s.rounded, s.shadowSm]}>
          <Card.Content>
            <Text variant="titleLarge" style={[s.fontWeightBold, s.textDark]}>{item.title}</Text>
            <Text variant="bodyMedium" numberOfLines={2} style={[s.textMuted, s.mt1]}>{item.body}</Text>
            <View style={[s.mt2, { borderTopWidth: 0.5, borderTopColor: '#EEE', paddingTop: 5 }, s.flexRow]}>
              <Text style={[{ fontSize: 10 }, s.textMuted]}>Created: {formatDate(item.created_at)}</Text>
              
              {isModified ? (
                <Text style={[{ fontSize: 10, color: c.PRIMARY, marginLeft: 5 }]}>
                  • Edited: {formatDate(item.updated_at)}
                </Text>
              ) : null}

            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.flex1, { backgroundColor: '#f8f9fa' }]}>
      {/* Header */}
      <View style={[s.bgPrimary, s.shadow, s.flexRow, s.justifyContentBetween, s.alignItemsCenter, { height: 110, paddingTop: 40, paddingHorizontal: 15 }]}>
        <View style={s.flexRow}>
          <Text style={[s.textWhite, s.h3, s.fontWeightBold]}>Hello World! </Text>
          <Animated.View style={animatedEmojiStyle}><Text style={[s.textWhite, s.h3]}>😊</Text></Animated.View>
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<IconButton icon="menu" iconColor="white" size={30} onPress={() => setMenuVisible(true)} />}
          contentStyle={s.bgWhite}
        >
          <Menu.Item leadingIcon="account" onPress={() => { setMenuVisible(false); router.push({ pathname: '/account', params: { userId: String(uID), fullname, email } }); }} title="My Account" />
          <Divider />
          <Menu.Item leadingIcon="logout" onPress={() => { setMenuVisible(false); triggerAlert("Logout", "Confirm log out?", "confirm", () => router.replace('/')); }} title="Log Out" />
        </Menu>
      </View>

      {/* Note List */}
      {loadingFetch && !refreshing ? (
        <ActivityIndicator style={s.mt5} color={c.PRIMARY} />
      ) : (
        <FlatList 
          data={data} 
          keyExtractor={(item) => item.id.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={[s.p3, { paddingBottom: 160 }]}
          ListEmptyComponent={
            <View style={[s.alignItemsCenter, s.mt5]}>
              <Avatar.Icon size={80} icon="note-edit-outline" style={s.bgTransparent} color="#CCC" />
              <Text style={s.textMuted}>No notes found. Tap + to start!</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.PRIMARY]} />}
        />
      )}

      {/* 4. Animated Quote Footer Section */}
      <View style={[s.w100, s.p3, s.alignItemsCenter, { position: 'absolute', bottom: 0, backgroundColor: '#f8f9fa' }]}>
        <Animated.View key={quoteIndex} entering={FadeIn.duration(1000)} exiting={FadeOut.duration(1000)}>
          <Text style={[s.textMuted, s.textCenter, { fontSize: 11, fontStyle: 'italic', fontFamily: 'serif' }]}>{quotes[quoteIndex]}</Text>
        </Animated.View>
      </View>

      {isFocused && (
        <Portal>
          <FAB icon="plus" style={[{ position: 'absolute', margin: 16, right: 20, bottom: 50 }, s.bgPrimary, s.shadow]} onPress={() => setAddModalVisible(true)} color="white" />

          {/* New Note Modal */}
          <Modal visible={addModalVisible} onDismiss={() => setAddModalVisible(false)} contentContainerStyle={[s.bgWhite, s.p4, s.m3, s.rounded]}>
            <Text style={[s.h4, s.fontWeightBold, s.mb3]}>New Note</Text>
            <TextInput label="Note Title" value={title} onChangeText={setTitle} mode="outlined" style={s.mb3} />
            <TextInput label="Note Content" value={body} onChangeText={setBody} mode="outlined" multiline numberOfLines={10} style={[s.mb3, { minHeight: 150 }]} />
            <View style={[s.flexRow, s.justifyContentEnd, s.mt2]}>
              <Button onPress={() => setAddModalVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleSave} loading={saving} buttonColor={c.PRIMARY} style={s.ml2}>Save Note</Button>
            </View>
          </Modal>

          {/* View/Edit Modal */}
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={[s.bgWhite, s.p4, s.m3, s.rounded, { maxHeight: '80%' }]}>
            {selectedPost && (
              <View>
                {isEditing ? (
                  <>
                    <TextInput label="Title" value={editTitle} onChangeText={setEditTitle} mode="outlined" style={s.mb3} />
                    <TextInput label="Content" value={editBody} onChangeText={setEditBody} mode="outlined" multiline numberOfLines={12} style={[s.mb3, { minHeight: 200 }]} />
                    <View style={[s.flexRow, s.justifyContentEnd]}>
                      <Button onPress={() => setIsEditing(false)}>Cancel</Button>
                      <Button mode="contained" onPress={handleUpdate} loading={updating} style={s.ml2}>Update</Button>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[s.h4, s.fontWeightBold, s.mb2]}>{selectedPost.title}</Text>
                    <ScrollView style={{ maxHeight: 300, marginBottom: 20 }}>
                      <Text style={[s.textDark]}>{selectedPost.body}</Text>
                    </ScrollView>
                    <View style={[s.flexRow, s.justifyContentBetween]}>
                      <Button onPress={() => handleDelete(selectedPost.id)} textColor={c.DANGER} loading={deleting}>Delete</Button>
                      <View style={s.flexRow}>
                        <Button onPress={() => { setEditTitle(selectedPost.title); setEditBody(selectedPost.body); setIsEditing(true); }}>Edit</Button>
                        <Button onPress={() => setModalVisible(false)}>Close</Button>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}
          </Modal>

          {/* Logout Confirm Modal */}
          <Modal visible={sweetAlert.visible} onDismiss={() => setSweetAlert(p => ({ ...p, visible: false }))} contentContainerStyle={[s.bgWhite, s.p5, s.m4, s.roundedLg, s.shadow]}>
            <View style={s.alignItemsCenter}>
              <Avatar.Icon size={70} icon={sweetAlert.type === 'success' ? 'check-circle' : sweetAlert.type === 'error' ? 'alert-circle' : 'help-circle'} style={s.bgTransparent} color={sweetAlert.type === 'success' ? c.SUCCESS : sweetAlert.type === 'error' ? c.DANGER : c.PRIMARY} />
              <Text style={[s.h4, s.fontWeightBold, s.mt3]}>{sweetAlert.title}</Text>
              <Text style={[s.textMuted, s.textCenter, s.my3]}>{sweetAlert.message}</Text>
              <View style={[s.flexRow, { gap: 10 }]}>
                {sweetAlert.type === 'confirm' && <Button mode="text" onPress={() => setSweetAlert(p => ({ ...p, visible: false }))}>Cancel</Button>}
                <Button mode="contained" buttonColor={sweetAlert.type === 'error' ? c.DANGER : c.PRIMARY} onPress={() => { sweetAlert.onConfirm(); setSweetAlert(p => ({ ...p, visible: false })); }}>
                  {sweetAlert.type === 'confirm' ? 'Yes, Log Out' : 'OK'}
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      )}
    </View>
  );
}