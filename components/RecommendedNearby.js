// components/RecommendedNearby.js
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { trackAffiliateClick } from '../lib/affiliate-manager';

export default function RecommendedNearby({ items, theme, userLocation = null }) {
  if (!items || items.length === 0) return null;

  const handlePress = async (item) => {
    try {
      // Track affiliate click for analytics
      trackAffiliateClick(item, userLocation);
      
      // Open the affiliate link
      await Linking.openURL(item.url);
    } catch (error) {
      console.log('Error opening URL:', error);
    }
  };

  const getSourceIcon = (source) => {
    const icons = {
      'viator': '🚢',
      'fever': '🔥',
      'getyourguide': '🎯',
      'ticketmaster': '🎫',
      'stubhub': '🎟️',
      'groupon': '💰',
      'local-sponsor': '🏪'
    };
    return icons[source] || '📍';
  };

  const getBudgetIcon = (tags) => {
    if (tags.includes('budget-$')) return '$';
    if (tags.includes('budget-$$')) return '$$';
    if (tags.includes('budget-$$$')) return '$$$';
    if (tags.includes('budget-$$$$')) return '$$$$';
    return '';
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.card, 
      borderColor: theme.line 
    }]}>
      <Text style={[styles.title, { color: theme.sub }]}>
        Recommended nearby
      </Text>
      
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => handlePress(item)}
          style={[styles.item, { borderBottomColor: theme.line }]}
          activeOpacity={0.7}
        >
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, { color: theme.text }]}>
              {item.name}
            </Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.sourceIcon}>
                {getSourceIcon(item.source)}
              </Text>
              {getBudgetIcon(item.tags) && (
                <Text style={[styles.budgetIcon, { color: theme.sub }]}>
                  {getBudgetIcon(item.tags)}
                </Text>
              )}
            </View>
          </View>
          
          <Text style={[styles.itemLocation, { color: theme.sub }]}>
            {item.city} • {item.source}
          </Text>
          
          {item.tags && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, tagIndex) => (
                <View key={tagIndex} style={[styles.tag, { backgroundColor: theme.pill }]}>
                  <Text style={[styles.tagText, { color: theme.sub }]}>
                    {tag.replace('budget-', '')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
      
      <Text style={[styles.disclosure, { color: theme.sub }]}>
        Some links may be affiliate. We may earn a commission at no cost to you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceIcon: {
    fontSize: 16,
  },
  budgetIcon: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemLocation: {
    fontSize: 13,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  disclosure: {
    fontSize: 11,
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
