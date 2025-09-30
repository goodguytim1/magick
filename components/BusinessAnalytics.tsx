// components/BusinessAnalytics.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface BusinessAnalyticsProps {
  businessData: any;
  cardAnalytics: any[];
}

export default function BusinessAnalytics({ businessData, cardAnalytics }: BusinessAnalyticsProps) {
  const topMatches = cardAnalytics
    .filter(a => a.willShowRecommendation && a.matchScore > 0)
    .slice(0, 10);
  
  const totalMatches = cardAnalytics.filter(a => a.willShowRecommendation && a.matchScore > 0).length;
  const totalCards = cardAnalytics.length;
  const matchPercentage = totalCards > 0 ? Math.round((totalMatches / totalCards) * 100) : 0;

  // Calculate category distribution
  const categoryDistribution = cardAnalytics.reduce((acc, card) => {
    if (card.willShowRecommendation && card.matchScore > 0) {
      acc[card.category] = (acc[card.category] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate tag distribution
  const tagDistribution = cardAnalytics.reduce((acc, card) => {
    if (card.willShowRecommendation && card.matchScore > 0) {
      card.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const topTags = Object.entries(tagDistribution)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      {/* Overview Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalMatches}</Text>
            <Text style={styles.statLabel}>Matching Cards</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{matchPercentage}%</Text>
            <Text style={styles.statLabel}>Match Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{businessData.tags?.length || 0}</Text>
            <Text style={styles.statLabel}>Business Tags</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{businessData.radius_km || 0}km</Text>
            <Text style={styles.statLabel}>Service Radius</Text>
          </View>
        </View>
      </View>

      {/* Category Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Categories</Text>
        <Text style={styles.subtitle}>Where your business will appear most often:</Text>
        {Object.entries(categoryDistribution)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .map(([category, count]) => (
            <View key={category} style={styles.distributionItem}>
              <Text style={styles.distributionLabel}>{category}</Text>
              <View style={styles.distributionBar}>
                <View 
                  style={[
                    styles.distributionFill, 
                    { width: `${(count as number / totalMatches) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </View>
          ))}
      </View>

      {/* Tag Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tag Analysis</Text>
        <Text style={styles.subtitle}>Most relevant tags for your business:</Text>
        {topTags.map(([tag, count]) => (
          <View key={tag} style={styles.tagItem}>
            <Text style={styles.tagName}>{tag}</Text>
            <View style={styles.tagBar}>
              <View 
                style={[
                  styles.tagFill, 
                  { width: `${(count as number / totalMatches) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.tagCount}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Top Matching Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Matching Cards</Text>
        <Text style={styles.subtitle}>Cards with highest relevance to your business:</Text>
        {topMatches.slice(0, 8).map((match, index) => (
          <View key={index} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchScore}>{Math.round(match.matchScore)}%</Text>
              <Text style={styles.matchType}>{match.type}</Text>
            </View>
            <Text style={styles.matchText}>{match.cardText}</Text>
            <Text style={styles.matchCategory}>{match.category}</Text>
            <View style={styles.matchTags}>
              {match.tags.slice(0, 3).map(tag => (
                <View key={tag} style={styles.matchTag}>
                  <Text style={styles.matchTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Business Impact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Impact</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{businessData.source === 'local-sponsor' ? '0%' : `${Math.round((businessData.estimated_commission || 0) * 100)}%`}</Text>
            <Text style={styles.impactLabel}>Commission Rate</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{businessData.city}</Text>
            <Text style={styles.impactLabel}>Primary Market</Text>
          </View>
        </View>
        
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationTitle}>Recommendations</Text>
          <Text style={styles.recommendationText}>
            {totalMatches > 20 
              ? "Excellent! Your business will appear on many cards. Consider adding more specific tags to target niche audiences."
              : totalMatches > 10
              ? "Good coverage! Your business will appear on several cards. Consider expanding your tag selection for better reach."
              : "Limited coverage. Consider adding more relevant tags or expanding your service radius to increase visibility."
            }
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5ff',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b4764',
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
    backgroundColor: '#efeafd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
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
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 14,
    color: '#1a1530',
    fontWeight: '600',
    width: 100,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e6e2f3',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 14,
    color: '#4b4764',
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagName: {
    fontSize: 14,
    color: '#1a1530',
    fontWeight: '600',
    width: 100,
  },
  tagBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e6e2f3',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  tagFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 3,
  },
  tagCount: {
    fontSize: 14,
    color: '#4b4764',
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  matchCard: {
    backgroundColor: '#f7f5ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7c3aed',
  },
  matchType: {
    fontSize: 12,
    color: '#4b4764',
    fontWeight: '600',
  },
  matchText: {
    fontSize: 14,
    color: '#1a1530',
    fontWeight: '600',
    marginBottom: 4,
  },
  matchCategory: {
    fontSize: 12,
    color: '#4b4764',
    marginBottom: 8,
  },
  matchTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  matchTag: {
    backgroundColor: '#e6e2f3',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchTagText: {
    fontSize: 10,
    color: '#4b4764',
    fontWeight: '600',
  },
  impactGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  impactCard: {
    flex: 1,
    backgroundColor: '#efeafd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7c3aed',
  },
  impactLabel: {
    fontSize: 12,
    color: '#4b4764',
    textAlign: 'center',
    marginTop: 4,
  },
  recommendationBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});
