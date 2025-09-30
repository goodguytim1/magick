// app/business-manager.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import BusinessAnalytics from '../../components/BusinessAnalytics';
import BusinessDashboard from '../../components/BusinessDashboard';
import { MISSIONS, QUESTIONS } from '../../content';
import { getBusinessCategories, getCardMetadata, shouldShowRecommendations } from '../../content-enhanced';
import { getLocation } from '../../lib/location';

// Business form data structure
interface BusinessFormData {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  radius_km: number;
  tags: string[];
  source: string;
  url: string;
  estimated_commission: number;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
}

// Analytics data structure
interface CardAnalytics {
  cardText: string;
  category: string;
  type: string;
  matchScore: number;
  businessCategories: string[];
  tags: string[];
  willShowRecommendation: boolean;
}

export default function BusinessManager() {
  const [formData, setFormData] = useState<BusinessFormData>({
    id: '',
    name: '',
    city: 'Jacksonville',
    lat: 30.331,
    lng: -81.655,
    radius_km: 25,
    tags: [],
    source: 'local-sponsor',
    url: '',
    estimated_commission: 0,
    description: '',
    phone: '',
    email: '',
    website: ''
  });

  const [analytics, setAnalytics] = useState<CardAnalytics[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Load user location on mount
  useEffect(() => {
    loadUserLocation();
  }, []);

  // Generate analytics when form data changes
  useEffect(() => {
    generateAnalytics();
  }, [formData]);

  const loadUserLocation = async () => {
    try {
      const location = await getLocation();
      setUserLocation(location);
      setFormData(prev => ({
        ...prev,
        city: location.city,
        lat: location.coord?.lat || 30.331,
        lng: location.coord?.lng || -81.655
      }));
    } catch (error) {
      console.log('Error loading location:', error);
    }
  };

  const generateAnalytics = () => {
    const allCards = [
      ...Object.entries(QUESTIONS).flatMap(([category, questions]) =>
        questions.map(text => ({ text, category, type: 'Question' }))
      ),
      ...Object.entries(MISSIONS).flatMap(([category, missions]) =>
        missions.map(text => ({ text, category, type: 'Mission' }))
      )
    ];

    const analyticsData: CardAnalytics[] = allCards.map(card => {
      const metadata = getCardMetadata(card);
      const businessCategories = getBusinessCategories(card);
      const willShowRecommendation = shouldShowRecommendations(card);
      
      // Calculate match score based on tags
      const matchScore = calculateMatchScore(formData.tags, metadata.tags);
      
      return {
        cardText: card.text,
        category: card.category,
        type: card.type,
        matchScore,
        businessCategories,
        tags: metadata.tags,
        willShowRecommendation
      };
    });

    // Sort by match score (highest first)
    analyticsData.sort((a, b) => b.matchScore - a.matchScore);
    
    setAnalytics(analyticsData);
  };

  const calculateMatchScore = (businessTags: string[], cardTags: string[]) => {
    if (businessTags.length === 0) return 0;
    
    const matches = businessTags.filter(tag => cardTags.includes(tag)).length;
    return (matches / businessTags.length) * 100;
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const generateBusinessId = () => {
    const prefix = formData.source === 'local-sponsor' ? 'local' : formData.source;
    const cityCode = formData.city.toLowerCase().replace(/\s+/g, '-');
    const nameCode = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
    return `${prefix}-${cityCode}-${nameCode}`;
  };

  const saveBusiness = async () => {
    if (!formData.name || !formData.url) {
      Alert.alert('Error', 'Please fill in required fields (Name and URL)');
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate unique ID
      const businessId = generateBusinessId();
      
      // Create business object
      const newBusiness = {
        ...formData,
        id: businessId
      };

      // Get current unified catalog
      const unifiedData = await AsyncStorage.getItem('unified_business_catalog');
      
      if (unifiedData) {
        // Add to existing unified catalog
        const allBusinesses = JSON.parse(unifiedData);
        allBusinesses.push(newBusiness);
        await AsyncStorage.setItem('unified_business_catalog', JSON.stringify(allBusinesses));
        console.log('Added to unified catalog. Total businesses:', allBusinesses.length);
      } else {
        // Create new unified catalog with static + new business
        const unifiedCatalog = [...catalogData, newBusiness];
        await AsyncStorage.setItem('unified_business_catalog', JSON.stringify(unifiedCatalog));
        console.log('Created unified catalog with', unifiedCatalog.length, 'businesses');
      }

      Alert.alert('Success', 'Business added successfully!', [
        { text: 'OK', onPress: () => resetForm() }
      ]);

    } catch (error) {
      Alert.alert('Error', 'Failed to save business');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      city: 'Jacksonville',
      lat: 30.331,
      lng: -81.655,
      radius_km: 25,
      tags: [],
      source: 'local-sponsor',
      url: '',
      estimated_commission: 0,
      description: '',
      phone: '',
      email: '',
      website: ''
    });
  };

  const topMatches = analytics.filter(a => a.willShowRecommendation && a.matchScore > 0).slice(0, 10);
  const totalMatches = analytics.filter(a => a.willShowRecommendation && a.matchScore > 0).length;

  if (showDashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowDashboard(false)}
          >
            <Text style={styles.backButtonText}>← Back to Form</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Business Dashboard</Text>
        </View>
        <BusinessDashboard />
      </SafeAreaView>
    );
  }

  if (showAnalytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowAnalytics(false)}
          >
            <Text style={styles.backButtonText}>← Back to Form</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Business Analytics</Text>
        </View>
        <BusinessAnalytics businessData={formData} cardAnalytics={analytics} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.titleHeader}>
          <Text style={styles.title}>Add New Business</Text>
          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => {
              console.log('Dashboard button pressed');
              setShowDashboard(true);
            }}
          >
            <Text style={styles.dashboardButtonText}>📊 Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowDashboard(true)}
          >
            <Text style={styles.actionButtonText}>📊 View All Businesses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAnalytics(true)}
          >
            <Text style={styles.actionButtonText}>📈 View Analytics</Text>
          </TouchableOpacity>
        </View>
        
        {/* Business Information Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Business Name *"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Website URL *"
            value={formData.url}
            onChangeText={(text) => setFormData(prev => ({ ...prev, url: text }))}
            keyboardType="url"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
          />
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Latitude"
              value={formData.lat.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lat: parseFloat(text) || 0 }))}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Longitude"
              value={formData.lng.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lng: parseFloat(text) || 0 }))}
              keyboardType="numeric"
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Service Radius (km)"
            value={formData.radius_km.toString()}
            onChangeText={(text) => setFormData(prev => ({ ...prev, radius_km: parseInt(text) || 25 }))}
            keyboardType="numeric"
          />
        </View>

        {/* Business Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Tags</Text>
          <Text style={styles.subtitle}>Select tags that describe your business:</Text>
          
          <View style={styles.tagGrid}>
            {['restaurants', 'entertainment', 'arts_culture', 'outdoor', 'shopping', 'wellness', 'education', 'transportation', 'accommodation', 'food', 'music', 'creative', 'adventure', 'bond', 'indoor', 'outdoor', 'date-night', 'budget-$', 'budget-$$', 'budget-$$$', 'budget-$$$$'].map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  formData.tags.includes(tag) && styles.tagButtonSelected
                ]}
                onPress={() => formData.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  formData.tags.includes(tag) && styles.tagTextSelected
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Business Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Type</Text>
          
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.source === 'local-sponsor' && styles.typeButtonSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, source: 'local-sponsor', estimated_commission: 0 }))}
            >
              <Text style={[
                styles.typeText,
                formData.source === 'local-sponsor' && styles.typeTextSelected
              ]}>
                Local Sponsor (0% commission)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.source !== 'local-sponsor' && styles.typeButtonSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, source: 'affiliate', estimated_commission: 0.05 }))}
            >
              <Text style={[
                styles.typeText,
                formData.source !== 'local-sponsor' && styles.typeTextSelected
              ]}>
                Affiliate Partner
              </Text>
            </TouchableOpacity>
          </View>
          
          {formData.source !== 'local-sponsor' && (
            <TextInput
              style={styles.input}
              placeholder="Commission Rate (0.05 = 5%)"
              value={formData.estimated_commission.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, estimated_commission: parseFloat(text) || 0 }))}
              keyboardType="numeric"
            />
          )}
        </View>

        {/* Analytics Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Matching Analytics</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalMatches}</Text>
              <Text style={styles.statLabel}>Cards That Will Show Your Business</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{analytics.length}</Text>
              <Text style={styles.statLabel}>Total Cards Analyzed</Text>
            </View>
          </View>

          {topMatches.length > 0 && (
            <View style={styles.matchesContainer}>
              <Text style={styles.subtitle}>Top Matching Cards:</Text>
              {topMatches.slice(0, 3).map((match, index) => (
                <View key={index} style={styles.matchItem}>
                  <Text style={styles.matchScore}>{Math.round(match.matchScore)}%</Text>
                  <View style={styles.matchDetails}>
                    <Text style={styles.matchText}>{match.cardText}</Text>
                    <Text style={styles.matchCategory}>{match.category} • {match.type}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.analyticsButton}
            onPress={() => setShowAnalytics(true)}
          >
            <Text style={styles.analyticsButtonText}>View Detailed Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={saveBusiness}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Add Business'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5ff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1530',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1530',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b4764',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6e2f3',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e6e2f3',
    backgroundColor: '#ffffff',
  },
  tagButtonSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  tagText: {
    fontSize: 12,
    color: '#4b4764',
    fontWeight: '600',
  },
  tagTextSelected: {
    color: '#ffffff',
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e2f3',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  typeText: {
    fontSize: 14,
    color: '#4b4764',
    fontWeight: '600',
    textAlign: 'center',
  },
  typeTextSelected: {
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#efeafd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#4b4764',
    textAlign: 'center',
    marginTop: 4,
  },
  matchesContainer: {
    marginTop: 12,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f7f5ff',
    borderRadius: 8,
    marginBottom: 8,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7c3aed',
    marginRight: 12,
    minWidth: 40,
  },
  matchDetails: {
    flex: 1,
  },
  matchText: {
    fontSize: 14,
    color: '#1a1530',
    fontWeight: '600',
  },
  matchCategory: {
    fontSize: 12,
    color: '#4b4764',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#a78bfa',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e2f3',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '600',
  },
  analyticsButton: {
    backgroundColor: '#e6e2f3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  analyticsButtonText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
    width: '100%',
  },
  dashboardButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    maxWidth: 120,
  },
  dashboardButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
