# Business Management System

## Overview

The Business Management System allows you to add new businesses to the Jacksonville catalog and provides detailed analytics on where your business will be showcased across the Magick app cards.

## Features

### 🏢 Business Manager (`app/(tabs)/business-manager.tsx`)
- **Add New Business**: Complete form to add businesses with all necessary details
- **Real-time Analytics**: See which cards will show your business recommendations
- **Location Integration**: Auto-detects user location for easier setup
- **Tag System**: Select relevant tags to improve card matching
- **Business Type Selection**: Choose between Local Sponsor (0% commission) or Affiliate Partner

### 📊 Business Analytics (`components/BusinessAnalytics.tsx`)
- **Card Matching Analysis**: See exactly which cards will feature your business
- **Category Distribution**: Understand which card categories match your business
- **Tag Analysis**: See which tags are most relevant for your business
- **Match Scoring**: Get percentage scores for card relevance
- **Business Impact**: View commission rates and market coverage

### 📈 Business Dashboard (`components/BusinessDashboard.tsx`)
- **Business Overview**: View all registered businesses
- **Statistics**: See business counts, commission rates, and tag distribution
- **Business Management**: Delete businesses and manage your catalog
- **Real-time Updates**: Refresh to see latest business data

## How It Works

### 1. Adding a Business
1. Navigate to the Business tab in the app
2. Fill out the business information form:
   - **Business Name**: Your business name
   - **Website URL**: Your business website
   - **Description**: Brief description of your business
   - **Contact Info**: Phone, email (optional)
   - **Location**: City, coordinates, service radius
   - **Tags**: Select relevant tags (restaurants, entertainment, etc.)
   - **Business Type**: Local Sponsor or Affiliate Partner

### 2. Analytics Preview
- The system analyzes all 200+ cards in the app
- Shows which cards will display your business recommendations
- Provides match scores based on tag relevance
- Displays top matching cards with percentage scores

### 3. Detailed Analytics
- Click "View Detailed Analytics" for comprehensive insights
- See category distribution charts
- View tag analysis and relevance scores
- Get recommendations for improving visibility

### 4. Business Dashboard
- View all registered businesses
- See business statistics and metrics
- Manage existing businesses
- Delete businesses if needed

## Business Types

### Local Sponsors (0% Commission)
- Perfect for Jacksonville businesses
- Build relationships and brand awareness
- No commission fees
- Great for local restaurants, venues, services

### Affiliate Partners (Variable Commission)
- Earn commissions on bookings
- Higher visibility in recommendations
- Commission rates vary by platform:
  - Viator: 8%
  - Fever: 10%
  - GetYourGuide: 9%
  - Groupon: 6%
  - Ticketmaster: 1%
  - StubHub: 7%

## Card Matching System

The system uses intelligent matching to determine which cards will show your business:

### Matching Factors
1. **Tag Relevance**: How well your business tags match card content
2. **Location**: Whether you're in the user's city or service radius
3. **Card Type**: Only "outbound" and "hybrid" cards show recommendations
4. **Business Categories**: Matches your business type to card needs

### Card Types
- **AT_HOME** (40%): Pure conversation cards - no business recommendations
- **OUTBOUND** (45%): Activity cards - perfect for business recommendations
- **HYBRID** (15%): Can work both ways - conversation + optional business pairing

## Technical Details

### Data Storage
- Businesses stored in AsyncStorage as `jacksonville_catalog`
- Real-time updates and persistence
- Easy to export/import business data

### Analytics Engine
- Analyzes all cards in real-time
- Calculates match scores using tag overlap
- Provides detailed insights and recommendations
- Updates automatically when form data changes

### Location Integration
- Uses Expo Location for geolocation
- Auto-detects user city and coordinates
- Fallback to Jacksonville defaults
- Respects privacy (city-level only)

## Usage Examples

### Restaurant Business
- **Tags**: restaurants, food, date-night, budget-$$
- **Matches**: Food-related cards, date night activities
- **Analytics**: Shows high match rates with food and adventure cards

### Entertainment Venue
- **Tags**: entertainment, music, indoor, bond
- **Matches**: Music, creative, and entertainment cards
- **Analytics**: Displays relevance to creative and bond quests

### Outdoor Activity
- **Tags**: outdoor, adventure, wellness, budget-$$
- **Matches**: Adventure sparks, outdoor activities
- **Analytics**: High relevance to outdoor and adventure cards

## Best Practices

### Tag Selection
- Choose 5-10 relevant tags
- Mix general and specific tags
- Include budget level tags
- Consider setting preferences (indoor/outdoor)

### Business Information
- Use clear, descriptive business names
- Provide accurate location data
- Set appropriate service radius
- Include compelling descriptions

### Analytics Review
- Check match scores regularly
- Adjust tags based on analytics
- Monitor which cards show your business
- Use insights to improve visibility

## Future Enhancements

- **API Integration**: Connect with affiliate program APIs
- **Click Tracking**: Implement redirect system for analytics
- **A/B Testing**: Test different tag combinations
- **Performance Metrics**: Track conversion rates
- **Bulk Import**: Import businesses from CSV/API
- **Advanced Analytics**: More detailed reporting and insights

## Support

For questions or issues with the Business Management System:
1. Check the analytics to understand card matching
2. Review tag selection for better relevance
3. Verify location data accuracy
4. Contact support for technical issues

The system is designed to be intuitive and provide valuable insights to help businesses maximize their visibility in the Magick app!
