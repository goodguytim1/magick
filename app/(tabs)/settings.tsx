import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PersonalityProfileCard from '../../components/PersonalityProfileCard';
import { deleteAccount, getCurrentUser, signOut } from '../../lib/auth';
import { getPersonalityData, getUserConsent, hasCompletedPersonalityTest, updateConsent } from '../../lib/consent-manager';
import { downloadUserData, exportUserData } from '../../lib/privacy-manager';
import { ConsentSettings, PersonalityTestData } from '../../types/user';

const DARK = {
  bg: "#0c0a12",
  card: "#171427",
  text: "#f5f5f7",
  sub: "#c9c7d1",
  line: "#2a2740",
  accent: "#8b5cf6",
  accentDim: "#6d28d9",
};

const LIGHT = {
  bg: "#f7f5ff",
  card: "#ffffff",
  text: "#1a1530",
  sub: "#4b4764",
  line: "#e6e2f3",
  accent: "#7c3aed",
  accentDim: "#a78bfa",
};

export default function SettingsScreen() {
  const [user, setUser] = useState<any>(null);
  const [consent, setConsent] = useState<ConsentSettings | null>(null);
  const [personalityData, setPersonalityData] = useState<PersonalityTestData | null>(null);
  const [hasPersonalityTest, setHasPersonalityTest] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [monetizationMode, setMonetizationMode] = useState<'affiliate' | 'sponsor'>('affiliate');
  const [loading, setLoading] = useState(true);

  const currentTheme = theme === 'dark' ? DARK : LIGHT;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.replace('/auth/sign-in');
        return;
      }

      setUser(currentUser);
      
      const userConsent = await getUserConsent(currentUser.id);
      setConsent(userConsent);

      // Load personality test data
      const hasTest = await hasCompletedPersonalityTest(currentUser.id);
      setHasPersonalityTest(hasTest);
      
      if (hasTest) {
        const personality = await getPersonalityData(currentUser.id);
        setPersonalityData(personality);
      }

      // Load theme and monetization mode from AsyncStorage
      const savedTheme = await AsyncStorage.getItem('magick.theme');
      const savedMonetizationMode = await AsyncStorage.getItem('magick.monetizationMode');
      
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
      setMonetizationMode(savedMonetizationMode === 'sponsor' ? 'sponsor' : 'affiliate');
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (key: keyof ConsentSettings, value: boolean) => {
    if (!user || !consent || key === 'version' || key === 'timestamp') return;

    const updatedConsent = {
      ...consent,
      [key]: value,
      timestamp: new Date().toISOString(),
    };

    try {
      await updateConsent(user.id, updatedConsent);
      setConsent(updatedConsent);
    } catch (error) {
      console.error('Error updating consent:', error);
      Alert.alert('Error', 'Failed to update consent settings');
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    try {
      await AsyncStorage.setItem('magick.theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleMonetizationModeChange = async (mode: 'affiliate' | 'sponsor') => {
    try {
      await AsyncStorage.setItem('magick.monetizationMode', mode);
      setMonetizationMode(mode);
    } catch (error) {
      console.error('Error saving monetization mode:', error);
    }
  };

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        try {
          await signOut();
          router.replace('/auth/sign-in');
        } catch (error) {
          console.error('Error signing out:', error);
          alert('Failed to sign out');
        }
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
                router.replace('/auth/sign-in');
              } catch (error) {
                console.error('Error signing out:', error);
                Alert.alert('Error', 'Failed to sign out');
              }
            },
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('This will delete your account. You can contact support to restore it if needed. Are you sure?')) {
        if (window.confirm('Are you absolutely sure you want to delete your account?')) {
          deleteAccount().then(() => {
            alert('Your account has been deleted. You can contact support to restore it if needed.');
            router.replace('/auth/sign-in');
          }).catch((error) => {
            console.error('Delete error:', error);
            alert('Failed to delete your account. Please try again.');
          });
        }
      }
    } else {
      Alert.alert(
        'Delete Account',
        'This will delete your account. You can contact support to restore it if needed.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Confirm Deletion',
                'Are you absolutely sure you want to delete your account?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Yes, Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deleteAccount();
                        Alert.alert(
                          'Account Deleted',
                          'Your account has been deleted. You can contact support to restore it if needed.',
                          [{ text: 'OK', onPress: () => router.replace('/auth/sign-in') }]
                        );
                      } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete your account. Please try again.');
                      }
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      const data = await exportUserData(user.id);
      downloadUserData(data, `magick-user-data-${new Date().toISOString().split('T')[0]}.json`);
      
      if (Platform.OS === 'web') {
        alert('Your data has been downloaded.');
      } else {
        Alert.alert('Success', 'Your data has been downloaded.');
      }
    } catch (error) {
      console.error('Export error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to export your data. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to export your data. Please try again.');
      }
    }
  };

  const handleViewPrivacyPolicy = () => {
    if (Platform.OS === 'web') {
      alert('Privacy policy will be available soon.');
    } else {
      Alert.alert('Privacy Policy', 'Privacy policy will be available soon.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.accent} />
          <Text style={[styles.loadingText, { color: currentTheme.sub }]}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Account
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: currentTheme.card }]}>
            <View style={styles.accountItem}>
              <Text style={styles.accountIcon}>👤</Text>
              <View style={styles.accountInfo}>
                <Text style={[styles.accountLabel, { color: currentTheme.sub }]}>
                  Email Address
                </Text>
                <Text style={[styles.accountValue, { color: currentTheme.text }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
            
            <View style={styles.accountActions}>
              <TouchableOpacity
                style={[styles.accountActionButton, styles.signOutButton]}
                onPress={handleSignOut}
              >
                <Text style={styles.signOutIcon}>🚪</Text>
                <Text style={[styles.signOutText, { color: '#ef4444' }]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.accountActionButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
                <Text style={[styles.deleteText, { color: '#ef4444' }]}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Personality Test Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Personality Profile
          </Text>
          {hasPersonalityTest && personalityData ? (
            <PersonalityProfileCard
              data={personalityData}
              onViewResults={() => router.push({
                pathname: '/personality-test',
                params: { userId: user.id, viewResults: 'true' }
              })}
              onRetakeTest={() => router.push({
                pathname: '/personality-test',
                params: { userId: user.id, retake: 'true' }
              })}
              theme={theme}
            />
          ) : (
            <View style={[styles.sectionCard, { backgroundColor: currentTheme.card }]}>
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>🧠</Text>
                <Text style={[styles.emptyStateTitle, { color: currentTheme.text }]}>
                  Complete Your Personality Profile
                </Text>
                <Text style={[styles.emptyStateText, { color: currentTheme.sub }]}>
                  Take our personality test to get personalized recommendations and discover more about yourself
                </Text>
                <TouchableOpacity
                  style={[styles.emptyStateButton, { backgroundColor: currentTheme.accent }]}
                  onPress={() => router.push({
                    pathname: '/personality-test',
                    params: { userId: user.id }
                  })}
                >
                  <Text style={styles.emptyStateButtonText}>Take Personality Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Privacy & Consent Section */}
        {consent && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Privacy & Consent
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: currentTheme.card }]}>
              <View style={styles.consentItem}>
                <View style={styles.consentInfo}>
                  <Text style={styles.consentIcon}>📊</Text>
                  <View style={styles.consentTextContainer}>
                    <Text style={[styles.consentTitle, { color: currentTheme.text }]}>
                      Analytics
                    </Text>
                    <Text style={[styles.consentDescription, { color: currentTheme.sub }]}>
                      Track app usage patterns
                    </Text>
                  </View>
                </View>
                <Switch
                  value={consent.analytics}
                  onValueChange={(value) => handleConsentChange('analytics', value)}
                  trackColor={{ false: currentTheme.line, true: currentTheme.accentDim }}
                  thumbColor={consent.analytics ? currentTheme.accent : currentTheme.sub}
                />
              </View>

              <View style={styles.consentItem}>
                <View style={styles.consentInfo}>
                  <Text style={styles.consentIcon}>🎯</Text>
                  <View style={styles.consentTextContainer}>
                    <Text style={[styles.consentTitle, { color: currentTheme.text }]}>
                      Personalization
                    </Text>
                    <Text style={[styles.consentDescription, { color: currentTheme.sub }]}>
                      Customize recommendations
                    </Text>
                  </View>
                </View>
                <Switch
                  value={consent.personalization}
                  onValueChange={(value) => handleConsentChange('personalization', value)}
                  trackColor={{ false: currentTheme.line, true: currentTheme.accentDim }}
                  thumbColor={consent.personalization ? currentTheme.accent : currentTheme.sub}
                />
              </View>

              <View style={styles.consentItem}>
                <View style={styles.consentInfo}>
                  <Text style={styles.consentIcon}>📢</Text>
                  <View style={styles.consentTextContainer}>
                    <Text style={[styles.consentTitle, { color: currentTheme.text }]}>
                      Marketing
                    </Text>
                    <Text style={[styles.consentDescription, { color: currentTheme.sub }]}>
                      Show partner offers
                    </Text>
                  </View>
                </View>
                <Switch
                  value={consent.marketing}
                  onValueChange={(value) => handleConsentChange('marketing', value)}
                  trackColor={{ false: currentTheme.line, true: currentTheme.accentDim }}
                  thumbColor={consent.marketing ? currentTheme.accent : currentTheme.sub}
                />
              </View>

              <View style={styles.consentItem}>
                <View style={styles.consentInfo}>
                  <Text style={styles.consentIcon}>🤝</Text>
                  <View style={styles.consentTextContainer}>
                    <Text style={[styles.consentTitle, { color: currentTheme.text }]}>
                      Data Sharing
                    </Text>
                    <Text style={[styles.consentDescription, { color: currentTheme.sub }]}>
                      Share anonymized data
                    </Text>
                  </View>
                </View>
                <Switch
                  value={consent.data_sharing}
                  onValueChange={(value) => handleConsentChange('data_sharing', value)}
                  trackColor={{ false: currentTheme.line, true: currentTheme.accentDim }}
                  thumbColor={consent.data_sharing ? currentTheme.accent : currentTheme.sub}
                />
              </View>

              <View style={styles.privacyActions}>
                <TouchableOpacity
                  style={styles.privacyActionButton}
                  onPress={handleViewPrivacyPolicy}
                >
                  <Text style={[styles.privacyActionText, { color: currentTheme.accent }]}>
                    View Privacy Policy
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.privacyActionButton}
                  onPress={handleExportData}
                >
                  <Text style={[styles.privacyActionText, { color: currentTheme.accent }]}>
                    Export My Data
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.lastUpdated, { color: currentTheme.sub }]}>
                Last updated: {new Date(consent.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Preferences
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: currentTheme.card }]}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceIcon}>🎨</Text>
                <View style={styles.preferenceTextContainer}>
                  <Text style={[styles.preferenceTitle, { color: currentTheme.text }]}>
                    Theme
                  </Text>
                  <Text style={[styles.preferenceDescription, { color: currentTheme.sub }]}>
                    Choose your preferred theme
                  </Text>
                </View>
              </View>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    theme === 'dark' && { backgroundColor: currentTheme.accent }
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Text style={[
                    styles.themeButtonText,
                    { color: theme === 'dark' ? '#ffffff' : currentTheme.sub }
                  ]}>
                    Dark
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    theme === 'light' && { backgroundColor: currentTheme.accent }
                  ]}
                  onPress={() => handleThemeChange('light')}
                >
                  <Text style={[
                    styles.themeButtonText,
                    { color: theme === 'light' ? '#ffffff' : currentTheme.sub }
                  ]}>
                    Light
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceIcon}>💼</Text>
                <View style={styles.preferenceTextContainer}>
                  <Text style={[styles.preferenceTitle, { color: currentTheme.text }]}>
                    Monetization Mode
                  </Text>
                  <Text style={[styles.preferenceDescription, { color: currentTheme.sub }]}>
                    Choose how businesses are displayed
                  </Text>
                </View>
              </View>
              <View style={styles.monetizationButtons}>
                <TouchableOpacity
                  style={[
                    styles.monetizationButton,
                    monetizationMode === 'affiliate' && { backgroundColor: currentTheme.accent }
                  ]}
                  onPress={() => handleMonetizationModeChange('affiliate')}
                >
                  <Text style={[
                    styles.monetizationButtonText,
                    { color: monetizationMode === 'affiliate' ? '#ffffff' : currentTheme.sub }
                  ]}>
                    Affiliate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.monetizationButton,
                    monetizationMode === 'sponsor' && { backgroundColor: currentTheme.accent }
                  ]}
                  onPress={() => handleMonetizationModeChange('sponsor')}
                >
                  <Text style={[
                    styles.monetizationButtonText,
                    { color: monetizationMode === 'sponsor' ? '#ffffff' : currentTheme.sub }
                  ]}>
                    Sponsor
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2740',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2740',
  },
  accountIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountActions: {
    gap: 12,
  },
  accountActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutButton: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  signOutIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
  },
  consentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 4,
  },
  consentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  consentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  privacyActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2740',
  },
  privacyActionButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  preferenceItem: {
    marginBottom: 32,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2740',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  monetizationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  monetizationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2740',
  },
  monetizationButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyStateButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
