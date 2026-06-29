import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TourProvider, useTour, useTourTarget, type TourDefinition } from 'guideway';

const tours: TourDefinition[] = [
  {
    id: 'main',
    steps: [
      { id: 'search', title: 'Find anything', body: 'Search your whole library from one place.' },
      {
        id: 'create',
        title: 'Create instantly',
        body: 'The + button starts something new from anywhere.',
        cutout: { shape: 'circle', padding: 10 },
      },
      {
        id: 'profile',
        title: 'Your account',
        body: 'Your profile and sign-out live up here.',
        cutout: { shape: 'pill' },
      },
      {
        id: 'settings',
        title: 'Even off-screen',
        body: 'This card was below the fold - the tour scrolled to it automatically.',
        cutout: { shape: 'rounded' },
      },
    ],
  },
];

function Home() {
  const search = useTourTarget('search');
  const create = useTourTarget('create');
  const profile = useTourTarget('profile');
  const scrollRef = useRef<ScrollView>(null);
  const settings = useTourTarget('settings', { scrollRef });
  const { start, isActive } = useTour();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.brand}>Guideway</Text>
        <Pressable ref={profile} style={styles.avatar}>
          <Text style={styles.avatarText}>CS</Text>
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        <TextInput
          ref={search}
          placeholder="Search"
          placeholderTextColor="#9aa0ad"
          style={styles.search}
        />

        <View style={styles.body}>
          <Text style={styles.h1}>Welcome.</Text>
          <Text style={styles.p}>A tiny demo of a Guideway product tour. Tap to start.</Text>
          <Pressable onPress={() => start('main')} style={styles.cta} disabled={isActive}>
            <Text style={styles.ctaText}>{isActive ? 'Tour running' : 'Show me around'}</Text>
          </Pressable>
        </View>

        <View style={styles.spacer}>
          <Text style={styles.spacerHint}>↓ a long way down ↓</Text>
        </View>

        <View ref={settings} style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <Text style={styles.settingsBody}>Off-screen until the tour scrolls here.</Text>
        </View>
      </ScrollView>

      <Pressable ref={create} style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  return (
    <TourProvider tours={tours} insets={insets} colorScheme="dark" allowTargetInteraction>
      <StatusBar barStyle="dark-content" />
      <Home />
    </TourProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fbfbfd' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  brand: { fontSize: 22, fontWeight: '800', color: '#0b0d12' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2347ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scrollContent: { paddingBottom: 60 },
  search: {
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7e9ef',
    fontSize: 16,
    color: '#0b0d12',
  },
  body: { paddingHorizontal: 20, gap: 10 },
  h1: { fontSize: 34, fontWeight: '900', color: '#0b0d12' },
  p: { fontSize: 16, color: '#3a4051', lineHeight: 22 },
  cta: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#0b0d12',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  spacer: { height: 620, alignItems: 'center', justifyContent: 'center' },
  spacerHint: { color: '#aeb4c0', fontSize: 14, fontWeight: '600' },
  settingsCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7e9ef',
  },
  settingsTitle: { fontSize: 20, fontWeight: '800', color: '#0b0d12', marginBottom: 6 },
  settingsBody: { fontSize: 15, color: '#3a4051' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2347ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2347ff',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '700', marginTop: -2 },
});
