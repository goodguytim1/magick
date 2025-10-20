import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ConsentSettings } from '../types/user';

const DARK = {
  bg: "#0c0a12",
  card: "#171427",
  text: "#f5f5f7",
  sub: "#c9c7d1",
  line: "#2a2740",
  accent: "#8b5cf6",
  accentDim: "#6d28d9",
};

interface ConsentModalProps {
  visible: boolean;
  onAccept: (consent: ConsentSettings) => void;
  onAcceptAll: (consent: ConsentSettings) => void;
}

export default function ConsentModal({ visible, onAccept, onAcceptAll }: ConsentModalProps) {
  const [consent, setConsent] = useState<ConsentSettings>({
    version: '1.0',
    timestamp: new Date().toISOString(),
    analytics: false,
    personalization: false,
    marketing: false,
    data_sharing: false,
  });

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleConsent = (key: keyof ConsentSettings) => {
    if (key === 'version' || key === 'timestamp') return;
    
    setConsent(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAcceptSelected = () => {
    const updatedConsent = {
      ...consent,
      timestamp: new Date().toISOString(),
    };
    onAccept(updatedConsent);
  };

  const handleAcceptAll = () => {
    const allAcceptedConsent = {
      ...consent,
      analytics: true,
      personalization: true,
      marketing: true,
      data_sharing: true,
      timestamp: new Date().toISOString(),
    };
    onAcceptAll(allAcceptedConsent);
  };

  const toggleExpanded = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const consentCategories = [
    {
      key: 'analytics' as keyof ConsentSettings,
      title: 'Analytics',
      description: 'Track app usage patterns to improve your experience',
      details: 'We collect anonymous data about how you use the app, including which cards you draw, how long you spend on each screen, and which features you use most. This helps us understand what works best and improve the app for everyone.',
    },
    {
      key: 'personalization' as keyof ConsentSettings,
      title: 'Personalization',
      description: 'Customize recommendations based on your preferences',
      details: 'We use your activity data to suggest cards and businesses that match your interests. This includes remembering your favorite categories and showing you relevant local businesses.',
    },
    {
      key: 'marketing' as keyof ConsentSettings,
      title: 'Marketing',
      description: 'Show you relevant partner offers and promotions',
      details: 'We may show you special offers from local businesses and partners that match your interests. These are carefully selected to be relevant to your activities and location.',
    },
    {
      key: 'data_sharing' as keyof ConsentSettings,
      title: 'Data Sharing',
      description: 'Share anonymized data with partners for better recommendations',
      details: 'We may share aggregated, anonymized data with our business partners to help them understand trends and improve their services. Your personal information is never shared.',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: DARK.bg }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: DARK.text }]}>
              Privacy & Consent
            </Text>
            <Text style={[styles.subtitle, { color: DARK.sub }]}>
              We respect your privacy. Please choose how you'd like us to use your data to improve your experience.
            </Text>
          </View>

          <View style={styles.consentSection}>
            {consentCategories.map((category) => (
              <View key={category.key} style={[styles.consentItem, { backgroundColor: DARK.card }]}>
                <View style={styles.consentHeader}>
                  <View style={styles.consentInfo}>
                    <Text style={[styles.consentTitle, { color: DARK.text }]}>
                      {category.title}
                    </Text>
                    <Text style={[styles.consentDescription, { color: DARK.sub }]}>
                      {category.description}
                    </Text>
                  </View>
                  <Switch
                    value={consent[category.key] as boolean}
                    onValueChange={() => toggleConsent(category.key)}
                    trackColor={{ false: DARK.line, true: DARK.accentDim }}
                    thumbColor={consent[category.key] ? DARK.accent : DARK.sub}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.learnMoreButton}
                  onPress={() => toggleExpanded(category.key)}
                >
                  <Text style={[styles.learnMoreText, { color: DARK.accent }]}>
                    {expandedSection === category.key ? 'Show Less' : 'Learn More'}
                  </Text>
                </TouchableOpacity>

                {expandedSection === category.key && (
                  <View style={styles.detailsContainer}>
                    <Text style={[styles.detailsText, { color: DARK.sub }]}>
                      {category.details}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.privacySection}>
            <Text style={[styles.privacyTitle, { color: DARK.text }]}>
              Your Privacy Rights
            </Text>
            <Text style={[styles.privacyText, { color: DARK.sub }]}>
              You can change these settings anytime in your profile. You also have the right to:
            </Text>
            <View style={styles.rightsList}>
              <Text style={[styles.rightItem, { color: DARK.sub }]}>
                • Export your data
              </Text>
              <Text style={[styles.rightItem, { color: DARK.sub }]}>
                • Delete your account
              </Text>
              <Text style={[styles.rightItem, { color: DARK.sub }]}>
                • Withdraw consent at any time
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: DARK.accent }]}
            onPress={handleAcceptSelected}
          >
            <Text style={styles.acceptButtonText}>Accept Selected</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.acceptAllButton, { backgroundColor: DARK.accentDim }]}
            onPress={handleAcceptAll}
          >
            <Text style={styles.acceptAllButtonText}>Accept All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  header: {
    paddingTop: 40,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  consentSection: {
    marginBottom: 32,
  },
  consentItem: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2740',
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  consentInfo: {
    flex: 1,
    marginRight: 16,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  learnMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2740',
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  privacySection: {
    marginBottom: 40,
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  rightsList: {
    paddingLeft: 16,
  },
  rightItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 12,
  },
  acceptButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptAllButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptAllButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});



