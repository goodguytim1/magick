// lib/affiliate-manager.js
// Centralized affiliate link management and API integration

export class AffiliateManager {
  constructor() {
    this.programs = {
      viator: {
        name: 'Viator',
        commission: 0.08,
        cookieDuration: 30,
        apiAvailable: true,
        baseUrl: 'https://www.viator.com',
        trackingParam: 'pid',
        // TODO: Add your Viator affiliate ID
        affiliateId: 'YOUR_VIATOR_ID'
      },
      getyourguide: {
        name: 'GetYourGuide',
        commission: 0.09,
        cookieDuration: 31,
        apiAvailable: true,
        baseUrl: 'https://www.getyourguide.com',
        trackingParam: 'partner_id',
        affiliateId: 'YOUR_GETYOURGUIDE_ID'
      },
      fever: {
        name: 'Fever',
        commission: 0.10,
        cookieDuration: 30,
        apiAvailable: false, // Manual links only
        baseUrl: 'https://feverup.com',
        trackingParam: 'ref',
        affiliateId: 'YOUR_FEVER_ID'
      },
      ticketmaster: {
        name: 'Ticketmaster',
        commission: 0.01,
        cookieDuration: 7,
        apiAvailable: true,
        baseUrl: 'https://www.ticketmaster.com',
        trackingParam: 'affiliate',
        affiliateId: 'YOUR_TICKETMASTER_ID'
      },
      stubhub: {
        name: 'StubHub',
        commission: 0.07,
        cookieDuration: 30,
        apiAvailable: false,
        baseUrl: 'https://www.stubhub.com',
        trackingParam: 'aid',
        affiliateId: 'YOUR_STUBHUB_ID'
      },
      groupon: {
        name: 'Groupon',
        commission: 0.06,
        cookieDuration: 30,
        apiAvailable: true,
        baseUrl: 'https://www.groupon.com',
        trackingParam: 'utm_source',
        affiliateId: 'YOUR_GROUPON_ID'
      }
    };
  }

  // Generate affiliate link with proper tracking
  generateAffiliateLink(program, originalUrl, additionalParams = {}) {
    const programConfig = this.programs[program];
    if (!programConfig) return originalUrl;

    const url = new URL(originalUrl);
    
    // Add affiliate tracking parameter
    url.searchParams.set(programConfig.trackingParam, programConfig.affiliateId);
    
    // Add additional tracking parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    // Add UTM parameters for analytics
    url.searchParams.set('utm_source', 'magick_app');
    url.searchParams.set('utm_medium', 'affiliate');
    url.searchParams.set('utm_campaign', program);

    return url.toString();
  }

  // Enhanced catalog with affiliate link generation
  enhanceCatalogWithAffiliateLinks(catalog) {
    return catalog.map(item => {
      if (item.source && this.programs[item.source]) {
        const program = this.programs[item.source];
        
        // Generate affiliate link
        const affiliateUrl = this.generateAffiliateLink(
          item.source,
          item.url,
          {
            // Add location-specific parameters
            location: item.city?.toLowerCase().replace(/\s+/g, '-'),
            activity: item.id
          }
        );

        return {
          ...item,
          url: affiliateUrl,
          commission: program.commission,
          cookieDuration: program.cookieDuration,
          apiAvailable: program.apiAvailable
        };
      }
      
      return item;
    });
  }

  // Track affiliate clicks for analytics
  trackAffiliateClick(item, userLocation = null) {
    const clickData = {
      timestamp: new Date().toISOString(),
      itemId: item.id,
      source: item.source,
      city: item.city,
      userLocation: userLocation?.city || 'unknown',
      commission: item.commission || 0
    };

    // TODO: Send to your analytics service
    console.log('Affiliate click tracked:', clickData);
    
    // You could send this to:
    // - Google Analytics
    // - Mixpanel
    // - Your own analytics API
    // - Firebase Analytics
    
    return clickData;
  }

  // Get program statistics
  getProgramStats() {
    return Object.entries(this.programs).map(([key, program]) => ({
      program: key,
      name: program.name,
      commission: `${(program.commission * 100).toFixed(1)}%`,
      cookieDuration: `${program.cookieDuration} days`,
      apiAvailable: program.apiAvailable ? '✅' : '❌'
    }));
  }
}

// Singleton instance
export const affiliateManager = new AffiliateManager();

// Helper function to enhance catalog
export function enhanceCatalogWithAffiliateLinks(catalog) {
  return affiliateManager.enhanceCatalogWithAffiliateLinks(catalog);
}

// Helper function to track clicks
export function trackAffiliateClick(item, userLocation) {
  return affiliateManager.trackAffiliateClick(item, userLocation);
}
