import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, StatusBar } from 'react-native';
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
        title: 'You are all set',
        body: 'Your account and settings live here. Enjoy Guideway.',
        cutout: { shape: 'pill' },
      },
    ],
  },
];

function Home() {
  const search = useTourTarget('search');
  const create = useTourTarget('create');
  const profile = useTourTarget('profile');
  const { start, isActive } = useTour();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.brand}>Guideway</Text>
        <Pressable ref={profile} style={styles.avatar}>
          <Text style={styles.avatarText}>CS</Text>
        </Pressable>
      </View>

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

      <Pressable ref={create} style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  return (
    <TourProvider tours={tours} insets={insets}>
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
