// components/BusinessDashboard.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import catalogData from '../app/content/jacksonville_catalog.json';
import { ENHANCED_MISSIONS, ENHANCED_QUESTIONS, shouldShowRecommendations } from '../content-enhanced';

interface Business {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  radius_km: number;
  source: string;
  estimated_commission: number;
  tags: string[];
  url: string;
  description?: string;
  phone?: string;
  email?: string;
}

export default function BusinessDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [editFormData, setEditFormData] = useState<Business>({
    id: '',
    name: '',
    city: '',
    lat: 0,
    lng: 0,
    radius_km: 25,
    source: 'local-sponsor',
    estimated_commission: 0,
    tags: [],
    url: '',
    description: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      console.log('Loading businesses...');
      
      // Check if we have a unified catalog in storage
      const unifiedData = await AsyncStorage.getItem('unified_business_catalog');
      
      if (unifiedData) {
        // Use the unified catalog
        const allBusinesses = JSON.parse(unifiedData);
        console.log('Loaded unified catalog with', allBusinesses.length, 'businesses');
        setBusinesses(allBusinesses);
      } else {
        // First time - create unified catalog from static + any existing user-added
        console.log('Creating unified catalog...');
        
        // Get any existing user-added businesses
        const storedData = await AsyncStorage.getItem('jacksonville_catalog');
        const userAddedBusinesses = storedData ? JSON.parse(storedData) : [];
        
        // Create unified catalog: static + user-added
        const unifiedCatalog = [...catalogData, ...userAddedBusinesses];
        
        // Save unified catalog
        await AsyncStorage.setItem('unified_business_catalog', JSON.stringify(unifiedCatalog));
        
        console.log('Created unified catalog with', unifiedCatalog.length, 'businesses');
        setBusinesses(unifiedCatalog);
      }
      
    } catch (error) {
      console.error('Error loading businesses:', error);
      // Fallback to static catalog
      setBusinesses(catalogData);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBusinesses();
    setRefreshing(false);
  };

  const deleteBusiness = async (businessId: string) => {
    console.log('Delete button clicked for business:', businessId);
    setBusinessToDelete(businessId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!businessToDelete) return;
    
    try {
      console.log('User confirmed deletion for:', businessToDelete);
      console.log('Current businesses state:', businesses.length);
      
      // First, update the UI state immediately
      const updatedBusinesses = businesses.filter((b: any) => b.id !== businessToDelete);
      console.log('Updated businesses state:', updatedBusinesses.length);
      setBusinesses(updatedBusinesses);
      
      // Then update the storage
      await AsyncStorage.setItem('unified_business_catalog', JSON.stringify(updatedBusinesses));
      console.log('Saved to storage:', updatedBusinesses.length, 'businesses');
      
      // Close modal
      setShowDeleteModal(false);
      setBusinessToDelete(null);
      
    } catch (error: any) {
      console.error('Delete error:', error);
      setShowDeleteModal(false);
      setBusinessToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBusinessToDelete(null);
  };

  // Calculate analytics for a business
  const calculateBusinessAnalytics = (business: Business) => {
    const allCards = [...Object.values(ENHANCED_QUESTIONS).flat(), ...Object.values(ENHANCED_MISSIONS).flat()];
    
    let matchingCards = 0;
    let totalScore = 0;
    const categoryMatches: { [key: string]: number } = {};
    const tagMatches: { [key: string]: number } = {};

    allCards.forEach(card => {
      // Skip if not a card object or doesn't need recommendations
      if (!card || typeof card !== 'object' || !shouldShowRecommendations(card)) return;
      
      // Skip AT_HOME cards - they don't need business recommendations
      if (card.recommendationType === 'at_home') return;

      // Check if business tags match card tags
      const businessTags = business.tags || [];
      const cardTags = card.tags || [];
      
      const hasMatch = businessTags.some(tag => cardTags.includes(tag));
      
      if (hasMatch) {
        matchingCards++;
        
        // Calculate match score
        const matchCount = businessTags.filter(tag => cardTags.includes(tag)).length;
        const score = matchCount / Math.max(businessTags.length, cardTags.length);
        totalScore += score;
        
        // Track category matches - use recommendationType as category
        const category = card.recommendationType || 'other';
        categoryMatches[category] = (categoryMatches[category] || 0) + 1;
        
        // Track tag matches
        businessTags.forEach(tag => {
          if (cardTags.includes(tag)) {
            tagMatches[tag] = (tagMatches[tag] || 0) + 1;
          }
        });
      }
    });

    const avgScore = matchingCards > 0 ? totalScore / matchingCards : 0;
    const matchRate = allCards.length > 0 ? (matchingCards / allCards.length) * 100 : 0;

    return {
      matchingCards,
      totalCards: allCards.length,
      matchRate: Math.round(matchRate * 10) / 10,
      avgScore: Math.round(avgScore * 100) / 100,
      categoryMatches,
      tagMatches,
      topCategories: Object.entries(categoryMatches)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category, count]) => ({ category, count })),
      topTags: Object.entries(tagMatches)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([tag, count]) => ({ tag, count })),
      matchedCards: (() => {
        const businessTags = business.tags || [];
        return allCards.filter(card => {
          if (!card || typeof card !== 'object' || !shouldShowRecommendations(card)) return false;
          if (card.recommendationType === 'at_home') return false;
          
          const cardTags = card.tags || [];
          return businessTags.some((tag: string) => cardTags.includes(tag));
        }).map(card => ({
          text: card.text,
          category: card.recommendationType,
          tags: card.tags,
          intensity: card.intensity,
          setting: card.setting,
          businessCategories: card.businessCategories,
          matchScore: businessTags.filter((tag: string) => card.tags.includes(tag)).length / Math.max(businessTags.length, card.tags.length)
        })).sort((a, b) => b.matchScore - a.matchScore);
      })()
    };
  };

  const editBusiness = (business: Business) => {
    setEditingBusiness(business);
    setEditFormData({ ...business });
  };

  const showBusinessAnalytics = (business: Business) => {
    setSelectedBusiness(business);
    setShowAnalyticsModal(true);
  };

  const closeAnalyticsModal = () => {
    setShowAnalyticsModal(false);
    setSelectedBusiness(null);
  };

  const saveEdit = async () => {
    if (!editFormData.name || !editFormData.url) {
      Alert.alert('Error', 'Please fill in required fields (Name and URL)');
      return;
    }

    try {
      // Check if this business is from the static catalog or user-added
      const isFromStaticCatalog = catalogData.some(b => b.id === editFormData.id);
      
      if (isFromStaticCatalog) {
        // For static catalog businesses, we can't modify the original file
        // Instead, we'll store overrides in AsyncStorage
        const overrides = await AsyncStorage.getItem('business_overrides');
        const overrideData = overrides ? JSON.parse(overrides) : {};
        overrideData[editFormData.id] = editFormData;
        await AsyncStorage.setItem('business_overrides', JSON.stringify(overrideData));
        
        // Update the local state to reflect the override
        const updatedBusinesses = businesses.map(b => 
          b.id === editFormData.id ? editFormData : b
        );
        setBusinesses(updatedBusinesses);
      } else {
        // For user-added businesses, update the stored catalog
        const storedData = await AsyncStorage.getItem('jacksonville_catalog');
        const storedBusinesses = storedData ? JSON.parse(storedData) : [];
        const updatedStoredBusinesses = storedBusinesses.map((b: any) => 
          b.id === editFormData.id ? editFormData : b
        );
        await AsyncStorage.setItem('jacksonville_catalog', JSON.stringify(updatedStoredBusinesses));
        
        // Update local state
        const updatedBusinesses = businesses.map((b: any) => 
          b.id === editFormData.id ? editFormData : b
        );
        setBusinesses(updatedBusinesses);
      }
      
      setEditingBusiness(null);
      Alert.alert('Success', 'Business updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update business');
    }
  };

  const cancelEdit = () => {
    setEditingBusiness(null);
    setEditFormData({
      id: '',
      name: '',
      city: '',
      lat: 0,
      lng: 0,
      radius_km: 25,
      source: 'local-sponsor',
      estimated_commission: 0,
      tags: [],
      url: '',
      description: '',
      phone: '',
      email: ''
    });
  };

  const addTag = (tag: string) => {
    if (!editFormData.tags.includes(tag)) {
      setEditFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'local-sponsor': return '#10b981';
      case 'viator': return '#3b82f6';
      case 'fever': return '#f59e0b';
      case 'getyourguide': return '#8b5cf6';
      case 'groupon': return '#ef4444';
      case 'ticketmaster': return '#06b6d4';
      case 'stubhub': return '#84cc16';
      default: return '#6b7280';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'local-sponsor': return '🏢';
      case 'viator': return '🚢';
      case 'fever': return '🎭';
      case 'getyourguide': return '🎯';
      case 'groupon': return '💰';
      case 'ticketmaster': return '🎫';
      case 'stubhub': return '🎟️';
      default: return '🏪';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading businesses...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Business Dashboard</Text>
        <Text style={styles.subtitle}>{businesses.length} businesses registered</Text>
      </View>

      {businesses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No businesses added yet</Text>
          <Text style={styles.emptySubtext}>Add your first business to get started</Text>
        </View>
      ) : (
        <View style={styles.businessList}>
          {businesses.map((business) => {
            const analytics = calculateBusinessAnalytics(business);
            return (
              <TouchableOpacity 
                key={business.id} 
                style={styles.businessCard}
                onPress={() => showBusinessAnalytics(business)}
                activeOpacity={0.7}
              >
                <View style={styles.businessHeader}>
                  <View style={styles.businessInfo}>
                    <Text style={styles.businessName}>{business.name}</Text>
                    <View style={styles.businessMeta}>
                      <Text style={styles.businessCity}>{business.city}</Text>
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceIcon}>
                          {getSourceIcon(business.source)}
                        </Text>
                        <Text style={[
                          styles.sourceText,
                          { color: getSourceColor(business.source) }
                        ]}>
                          {business.source}
                        </Text>
                      </View>
                    </View>
                    {/* Analytics Preview */}
                    <View style={styles.analyticsPreview}>
                      <View style={styles.analyticsStat}>
                        <Text style={styles.analyticsNumber}>{analytics.matchingCards}</Text>
                        <Text style={styles.analyticsLabel}>Cards</Text>
                      </View>
                      <View style={styles.analyticsStat}>
                        <Text style={styles.analyticsNumber}>{analytics.matchRate}%</Text>
                        <Text style={styles.analyticsLabel}>Match Rate</Text>
                      </View>
                      <View style={styles.analyticsStat}>
                        <Text style={styles.analyticsNumber}>{business.tags?.length || 0}</Text>
                        <Text style={styles.analyticsLabel}>Tags</Text>
                      </View>
                    </View>
                  </View>
                   <View style={styles.businessActions}>
                     <Text style={styles.commissionText}>
                       {business.source === 'local-sponsor' ? '0%' : `${Math.round(business.estimated_commission * 100)}%`}
                     </Text>
                     <View style={styles.actionButtons}>
                       <TouchableOpacity
                         style={styles.editButton}
                         onPress={(e) => {
                           e.stopPropagation();
                           editBusiness(business);
                         }}
                       >
                         <Text style={styles.editButtonText}>✏️</Text>
                       </TouchableOpacity>
                       <TouchableOpacity
                         style={styles.deleteButton}
                         onPress={(e) => {
                           e.stopPropagation();
                           console.log('Button pressed, calling deleteBusiness...');
                           deleteBusiness(business.id);
                         }}
                       >
                         <Text style={styles.deleteButtonText}>🗑️</Text>
                       </TouchableOpacity>
                     </View>
                   </View>
                </View>
              
              <View style={styles.tagsContainer}>
                {business.tags.slice(0, 5).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {business.tags.length > 5 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>+{business.tags.length - 5}</Text>
                  </View>
                )}
              </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Business Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {businesses.filter(b => b.source === 'local-sponsor').length}
            </Text>
            <Text style={styles.statLabel}>Local Sponsors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {businesses.filter(b => b.source !== 'local-sponsor').length}
            </Text>
            <Text style={styles.statLabel}>Affiliate Partners</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {businesses.reduce((sum, b) => sum + b.tags.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Tags</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {businesses.length > 0 ? Math.round(businesses.reduce((sum, b) => sum + b.estimated_commission, 0) / businesses.length * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Avg Commission</Text>
          </View>
         </View>
       </View>

       {/* Edit Business Modal */}
       <Modal
         visible={editingBusiness !== null}
         animationType="slide"
         presentationStyle="pageSheet"
       >
         <SafeAreaView style={styles.modalContainer}>
           <View style={styles.modalHeader}>
             <TouchableOpacity onPress={cancelEdit}>
               <Text style={styles.cancelButton}>Cancel</Text>
             </TouchableOpacity>
             <Text style={styles.modalTitle}>Edit Business</Text>
             <TouchableOpacity onPress={saveEdit}>
               <Text style={styles.saveButton}>Save</Text>
             </TouchableOpacity>
           </View>
           
           <ScrollView style={styles.modalContent}>
             <View style={styles.section}>
               <Text style={styles.sectionTitle}>Business Information</Text>
               
               <TextInput
                 style={styles.input}
                 placeholder="Business Name *"
                 value={editFormData.name}
                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, name: text }))}
               />
               
               <TextInput
                 style={styles.input}
                 placeholder="Website URL *"
                 value={editFormData.url}
                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, url: text }))}
                 keyboardType="url"
               />
               
               <TextInput
                 style={styles.input}
                 placeholder="Description"
                 value={editFormData.description || ''}
                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, description: text }))}
                 multiline
                 numberOfLines={3}
               />
               
               <TextInput
                 style={styles.input}
                 placeholder="Phone"
                 value={editFormData.phone || ''}
                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, phone: text }))}
                 keyboardType="phone-pad"
               />
               
               <TextInput
                 style={styles.input}
                 placeholder="Email"
                 value={editFormData.email || ''}
                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, email: text }))}
                 keyboardType="email-address"
               />
             </View>

             <View style={styles.section}>
               <Text style={styles.sectionTitle}>Location</Text>
               
               <TextInput
                 style={styles.input}
                 placeholder="City"
                 value={editFormData.city}
                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, city: text }))}
               />
               
               <View style={styles.row}>
                 <TextInput
                   style={[styles.input, styles.halfInput]}
                   placeholder="Latitude"
                   value={editFormData.lat.toString()}
                   onChangeText={(text) => setEditFormData(prev => ({ ...prev, lat: parseFloat(text) || 0 }))}
                   keyboardType="numeric"
                 />
                 <TextInput
                   style={[styles.input, styles.halfInput]}
                   placeholder="Longitude"
                   value={editFormData.lng.toString()}
                   onChangeText={(text) => setEditFormData(prev => ({ ...prev, lng: parseFloat(text) || 0 }))}
                   keyboardType="numeric"
                 />
               </View>
               
               <TextInput
                 style={styles.input}
                 placeholder="Service Radius (km)"
                 value={editFormData.radius_km.toString()}
                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, radius_km: parseInt(text) || 25 }))}
                 keyboardType="numeric"
               />
             </View>

             <View style={styles.section}>
               <Text style={styles.sectionTitle}>Business Tags</Text>
               <Text style={styles.subtitle}>Select tags that describe your business:</Text>
               
               <View style={styles.tagGrid}>
                 {['restaurants', 'entertainment', 'arts_culture', 'outdoor', 'shopping', 'wellness', 'education', 'transportation', 'accommodation', 'food', 'music', 'creative', 'adventure', 'bond', 'indoor', 'outdoor', 'date-night', 'budget-$', 'budget-$$', 'budget-$$$', 'budget-$$$$'].map(tag => (
                   <TouchableOpacity
                     key={tag}
                     style={[
                       styles.tagButton,
                       editFormData.tags.includes(tag) && styles.tagButtonSelected
                     ]}
                     onPress={() => editFormData.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                   >
                     <Text style={[
                       styles.tagText,
                       editFormData.tags.includes(tag) && styles.tagTextSelected
                     ]}>
                       {tag}
                     </Text>
                   </TouchableOpacity>
                 ))}
               </View>
             </View>

             <View style={styles.section}>
               <Text style={styles.sectionTitle}>Business Type</Text>
               
               <View style={styles.row}>
                 <TouchableOpacity
                   style={[
                     styles.typeButton,
                     editFormData.source === 'local-sponsor' && styles.typeButtonSelected
                   ]}
                   onPress={() => setEditFormData(prev => ({ ...prev, source: 'local-sponsor', estimated_commission: 0 }))}
                 >
                   <Text style={[
                     styles.typeText,
                     editFormData.source === 'local-sponsor' && styles.typeTextSelected
                   ]}>
                     Local Sponsor (0% commission)
                   </Text>
                 </TouchableOpacity>
                 
                 <TouchableOpacity
                   style={[
                     styles.typeButton,
                     editFormData.source !== 'local-sponsor' && styles.typeButtonSelected
                   ]}
                   onPress={() => setEditFormData(prev => ({ ...prev, source: 'affiliate', estimated_commission: 0.05 }))}
                 >
                   <Text style={[
                     styles.typeText,
                     editFormData.source !== 'local-sponsor' && styles.typeTextSelected
                   ]}>
                     Affiliate Partner
                   </Text>
                 </TouchableOpacity>
               </View>
               
               {editFormData.source !== 'local-sponsor' && (
                 <TextInput
                   style={styles.input}
                   placeholder="Commission Rate (0.05 = 5%)"
                   value={editFormData.estimated_commission.toString()}
                   onChangeText={(text) => setEditFormData(prev => ({ ...prev, estimated_commission: parseFloat(text) || 0 }))}
                   keyboardType="numeric"
                 />
               )}
             </View>
           </ScrollView>
         </SafeAreaView>
       </Modal>

       {/* Delete Confirmation Modal */}
       <Modal
         visible={showDeleteModal}
         transparent={true}
         animationType="fade"
         onRequestClose={cancelDelete}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.deleteModalContent}>
             <Text style={styles.deleteModalTitle}>Delete Business</Text>
             <Text style={styles.deleteModalText}>
               Are you sure you want to delete this business? This action cannot be undone.
             </Text>
             <View style={styles.deleteModalButtons}>
               <TouchableOpacity
                 style={[styles.modalButton, styles.deleteCancelButton]}
                 onPress={cancelDelete}
               >
                 <Text style={styles.deleteCancelButtonText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[styles.modalButton, styles.deleteConfirmButton]}
                 onPress={confirmDelete}
               >
                 <Text style={styles.deleteConfirmButtonText}>Delete</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>

       {/* Analytics Modal */}
       <Modal
         visible={showAnalyticsModal}
         transparent={true}
         animationType="slide"
         onRequestClose={closeAnalyticsModal}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.analyticsModalContent}>
             {selectedBusiness && (
               <>
                 <View style={styles.analyticsModalHeader}>
                   <Text style={styles.analyticsModalTitle}>{selectedBusiness.name}</Text>
                   <TouchableOpacity
                     style={styles.closeButton}
                     onPress={closeAnalyticsModal}
                   >
                     <Text style={styles.closeButtonText}>✕</Text>
                   </TouchableOpacity>
                 </View>
                 
                 <ScrollView style={styles.analyticsModalBody}>
                   {(() => {
                     const analytics = calculateBusinessAnalytics(selectedBusiness);
                     return (
                       <>
                         {/* Overview Stats */}
                         <View style={styles.analyticsSection}>
                           <Text style={styles.analyticsSectionTitle}>Overview</Text>
                           <View style={styles.analyticsGrid}>
                             <View style={styles.analyticsCard}>
                               <Text style={styles.analyticsCardNumber}>{analytics.matchingCards}</Text>
                               <Text style={styles.analyticsCardLabel}>Matching Cards</Text>
                               <Text style={styles.analyticsCardSubtext}>out of {analytics.totalCards} total</Text>
                             </View>
                             <View style={styles.analyticsCard}>
                               <Text style={styles.analyticsCardNumber}>{analytics.matchRate}%</Text>
                               <Text style={styles.analyticsCardLabel}>Match Rate</Text>
                               <Text style={styles.analyticsCardSubtext}>card compatibility</Text>
                             </View>
                             <View style={styles.analyticsCard}>
                               <Text style={styles.analyticsCardNumber}>{analytics.avgScore}</Text>
                               <Text style={styles.analyticsCardLabel}>Avg Score</Text>
                               <Text style={styles.analyticsCardSubtext}>match quality</Text>
                             </View>
                           </View>
                         </View>

                         {/* Top Categories */}
                         {analytics.topCategories.length > 0 && (
                           <View style={styles.analyticsSection}>
                             <Text style={styles.analyticsSectionTitle}>Top Categories</Text>
                             {analytics.topCategories.map(({ category, count }) => (
                               <View key={category} style={styles.analyticsItem}>
                                 <Text style={styles.analyticsItemLabel}>{category}</Text>
                                 <Text style={styles.analyticsItemValue}>{count} cards</Text>
                               </View>
                             ))}
                           </View>
                         )}

                         {/* Top Tags */}
                         {analytics.topTags.length > 0 && (
                           <View style={styles.analyticsSection}>
                             <Text style={styles.analyticsSectionTitle}>Top Tags</Text>
                             {analytics.topTags.map(({ tag, count }) => (
                               <View key={tag} style={styles.analyticsItem}>
                                 <Text style={styles.analyticsItemLabel}>{tag}</Text>
                                 <Text style={styles.analyticsItemValue}>{count} matches</Text>
                               </View>
                             ))}
                           </View>
                         )}

                         {/* Matched Cards */}
                         {analytics.matchedCards.length > 0 && (
                           <View style={styles.analyticsSection}>
                             <Text style={styles.analyticsSectionTitle}>Matched Cards ({analytics.matchedCards.length})</Text>
                             <Text style={styles.analyticsSectionSubtitle}>
                               Cards that will show this business as a recommendation
                             </Text>
                             {analytics.matchedCards.map((card, index) => (
                               <View key={index} style={styles.matchedCardItem}>
                                 <View style={styles.matchedCardHeader}>
                                   <Text style={styles.matchedCardText}>{card.text}</Text>
                                   <View style={styles.matchScoreBadge}>
                                     <Text style={styles.matchScoreText}>
                                       {Math.round(card.matchScore * 100)}% match
                                     </Text>
                                   </View>
                                 </View>
                                 <View style={styles.matchedCardMeta}>
                                   <View style={styles.matchedCardTags}>
                                     {card.tags.slice(0, 3).map((tag, tagIndex) => (
                                       <View key={tagIndex} style={styles.matchedCardTag}>
                                         <Text style={styles.matchedCardTagText}>{tag}</Text>
                                       </View>
                                     ))}
                                     {card.tags.length > 3 && (
                                       <View style={styles.matchedCardTag}>
                                         <Text style={styles.matchedCardTagText}>+{card.tags.length - 3}</Text>
                                       </View>
                                     )}
                                   </View>
                                   <View style={styles.matchedCardDetails}>
                                     <Text style={styles.matchedCardDetail}>
                                       {card.intensity} • {card.setting} • {card.category}
                                     </Text>
                                   </View>
                                 </View>
                               </View>
                             ))}
                           </View>
                         )}

                         {/* Business Info */}
                         <View style={styles.analyticsSection}>
                           <Text style={styles.analyticsSectionTitle}>Business Details</Text>
                           <View style={styles.analyticsItem}>
                             <Text style={styles.analyticsItemLabel}>Location</Text>
                             <Text style={styles.analyticsItemValue}>{selectedBusiness.city}</Text>
                           </View>
                           <View style={styles.analyticsItem}>
                             <Text style={styles.analyticsItemLabel}>Source</Text>
                             <Text style={styles.analyticsItemValue}>{selectedBusiness.source}</Text>
                           </View>
                           <View style={styles.analyticsItem}>
                             <Text style={styles.analyticsItemLabel}>Commission</Text>
                             <Text style={styles.analyticsItemValue}>
                               {selectedBusiness.source === 'local-sponsor' ? '0%' : `${Math.round(selectedBusiness.estimated_commission * 100)}%`}
                             </Text>
                           </View>
                           <View style={styles.analyticsItem}>
                             <Text style={styles.analyticsItemLabel}>Service Radius</Text>
                             <Text style={styles.analyticsItemValue}>{selectedBusiness.radius_km} km</Text>
                           </View>
                         </View>
                       </>
                     );
                   })()}
                 </ScrollView>
               </>
             )}
           </View>
         </View>
       </Modal>
     </ScrollView>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f5ff',
  },
  loadingText: {
    fontSize: 16,
    color: '#4b4764',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e2f3',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1530',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b4764',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b4764',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  businessList: {
    padding: 16,
  },
  businessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1530',
    marginBottom: 4,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  businessCity: {
    fontSize: 14,
    color: '#4b4764',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceIcon: {
    fontSize: 12,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  businessActions: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
  },
  commissionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#e6e2f3',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4b4764',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1530',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#4b4764',
    textAlign: 'center',
    marginTop: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f7f5ff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e2f3',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1530',
  },
  saveButton: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 16,
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
  // Delete Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1530',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    color: '#4b4764',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteCancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  deleteCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deleteConfirmButton: {
    backgroundColor: '#dc2626',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Analytics Preview styles
  analyticsPreview: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  analyticsStat: {
    alignItems: 'center',
  },
  analyticsNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  // Analytics Modal styles
  analyticsModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    minWidth: 350,
    maxWidth: 500,
  },
  analyticsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e2f3',
  },
  analyticsModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1530',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  analyticsModalBody: {
    padding: 20,
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1530',
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  analyticsCardNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7c3aed',
    marginBottom: 4,
  },
  analyticsCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1530',
    marginBottom: 2,
  },
  analyticsCardSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  analyticsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  analyticsItemLabel: {
    fontSize: 16,
    color: '#4b4764',
    fontWeight: '500',
  },
  analyticsItemValue: {
    fontSize: 16,
    color: '#1a1530',
    fontWeight: '600',
  },
  // Matched Cards styles
  analyticsSectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  matchedCardItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6e2f3',
  },
  matchedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchedCardText: {
    fontSize: 16,
    color: '#1a1530',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  matchScoreBadge: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchScoreText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  matchedCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchedCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  matchedCardTag: {
    backgroundColor: '#e6e2f3',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  matchedCardTagText: {
    fontSize: 12,
    color: '#4b4764',
    fontWeight: '500',
  },
  matchedCardDetails: {
    alignItems: 'flex-end',
  },
  matchedCardDetail: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});
