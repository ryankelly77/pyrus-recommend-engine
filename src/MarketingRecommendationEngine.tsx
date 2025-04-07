import React, { useState } from 'react';

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  requires?: string[];
  minAdSpend?: number;
  adjustedPrice?: number;
};

type Package = {
  name: string;
  price: number;
  minAdSpend: number;
  services: string[];
  description: string;
};

type Recommendation =
  | {
      type: 'package';
      package: {
        name: string;
        price: number;
        description: string;
        services: {
          id: string;
          name: string;
          description: string;
        }[];
      };
      adSpend: number;
      additionalServices: {
        id: string;
        name: string;
        price: number;
        description: string;
      }[];
      totalCost: number;
      needsWebsite: boolean;
      prioritizeAds: boolean;
      prioritizeSEO: boolean;
    }
  | {
      type: 'services';
      services: {
        id: string;
        name: string;
        price: number;
        description: string;
        minAdSpend?: number;
      }[];
      adSpend: number;
      totalCost: number;
      needsWebsite: boolean;
      prioritizeAds: boolean;
      prioritizeSEO: boolean;
    };

const MarketingRecommendationEngine = () => {
    const [businessType, setBusinessType] = useState('');
    const [industry, setIndustry] = useState('');
    const [budget, setBudget] = useState('');
    const [goals, setGoals] = useState<string[]>([]);
    const [onlinePresence, setOnlinePresence] = useState('');
    const [timeline, setTimeline] = useState('');
    const [locations, setLocations] = useState<number>(1);
    const [submitted, setSubmitted] = useState(false);
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

      
  // Available services
  const services = {
    crmLeadTracking: {
      name: "CRM + Lead Tracking",
      price: 99,
      description: "Track and manage leads and customer relationships"
    },
    analytics: {
      name: "Google Analytics (GA4) Tracking",
      price: 99,
      description: "Track website performance and user behavior"
    },
    googleBusinessProfile: {
      name: "Google Business Profile Optimization",
      price: 199,
      description: "Optimize your Google Business listing for better local visibility"
    },
    localServiceAds: {
      name: "Google Local Service Ads",
      price: 149,
      minAdSpend: 500,
      description: "Targeted local ads with Google's guaranteed badge"
    },
    searchAds: {
      name: "Google Search Ads",
      price: 599,
      minAdSpend: 1000,
      description: "Targeted ads on Google search results (1 campaign, 1 ad group)"
    },
    appointmentSetting: {
      name: "Appointment Setting",
      price: 99,
      description: "Tools to allow customers to book appointments directly"
    },
    webChat: {
      name: "Web Chat",
      price: 99,
      description: "Live chat functionality for your website"
    },
    aiChat: {
      name: "Conversational AI Chat",
      price: 99,
      requires: ["webChat"],
      description: "AI-powered chat for your website. Requires Web Chat"
    },
    emailSms: {
      name: "Email & SMS Campaigns",
      price: 99,
      description: "Email and text message marketing campaigns"
    },
    reviewManagement: {
      name: "Review Management",
      price: 99,
      description: "Manage and respond to customer reviews"
    },
    seedlingSeo: {
      name: "Seedling SEO",
      price: 599,
      description: "Basic SEO for 4-5 key pages, 15-20 keywords"
    },
    harvestSeo: {
      name: "Harvest SEO",
      price: 1799,
      description: "Comprehensive SEO for 15-20 pages, 80+ keywords, content and link building"
    },
    contentMarketing: {
      name: "Content Marketing",
      price: 99,
      description: "1000-word article providing valuable content for your website and audience"
    },
    basicHosting: {
      name: "Basic WordPress Hosting and Maintenance",
      price: 49,
      description: "Essential hosting and maintenance for WordPress sites"
    },
    advancedHosting: {
      name: "Advanced WordPress Hosting and Maintenance",
      price: 99,
      description: "Premium hosting with malware protection and staging site"
    }
  };

  // Available packages
  const packages = {
    seed: {
      name: "Seed Plan",
      price: 559,
      minAdSpend: 500,
      services: ["googleBusinessProfile", "localServiceAds", "analytics", "crmLeadTracking"],
      description: "Get started with essential local visibility and lead tracking."
    },
    grow: {
      name: "Grow Plan",
      price: 1099,
      minAdSpend: 1000,
      services: ["googleBusinessProfile", "seedlingSeo", "localServiceAds", "analytics", "crmLeadTracking"],
      description: "Boost visibility with targeted SEO and local ads."
    },
    harvest: {
      name: "Harvest Plan",
      price: 2499,
      minAdSpend: 1500,
      services: ["googleBusinessProfile", "harvestSeo", "localServiceAds", "searchAds", "analytics", "crmLeadTracking"],
      description: "Comprehensive marketing strategy for maximum growth."
    }
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setGoals((prevGoals) =>
      checked ? [...prevGoals, value] : prevGoals.filter((item) => item !== value)
    );
  };
  
  const moveToFront = <T extends { id: string }>(
    array: T[],
    itemIds: string[]
  ): T[] => {
    const copy = [...array];
    const priorityItems: T[] = [];
  
    for (const id of itemIds) {
      const index = copy.findIndex((item) => item.id === id);
      if (index !== -1) {
        priorityItems.push(copy[index]);
        copy.splice(index, 1);
      }
    }
  
    return [...priorityItems, ...copy];
  };
  
  const generateRecommendation = (): void => {
  const monthlyBudget = parseFloat(budget);
  if (isNaN(monthlyBudget) || monthlyBudget <= 0) {
    alert('Please enter a valid budget amount');
    return;
  }
    
    // Calculate location-adjusted services prices
    const locationsCount = parseInt(locations);
    const adjustedServices = Object.keys(services).reduce((acc, key) => {
      let price = services[key].price;
      
      // If it's Google Business Profile, multiply by locations
      if (key === 'googleBusinessProfile' && locationsCount > 1) {
        price = price * locationsCount;
      }
      
      acc[key] = {
        ...services[key],
        adjustedPrice: price
      };
      return acc;
    }, {});
    
    // Check which packages are within budget
    const availablePackages = Object.keys(packages).filter(key => {
      const pkg = packages[key];
      // Calculate package price with location adjustment
      let packagePrice = pkg.price;
      
      if (pkg.services.includes('googleBusinessProfile') && locationsCount > 1) {
        packagePrice = packagePrice + (locationsCount - 1) * services.googleBusinessProfile.price;
      }
      
      return (packagePrice + pkg.minAdSpend) <= monthlyBudget;
    });
    
    let result = {};
    
    // Flag for whether we need a new website
    const needsWebsite = onlinePresence === 'none';
    
    // Flag for whether to prioritize ads or SEO based on timeline
    const prioritizeAds = timeline === 'immediate' || goals.includes('leads');
    const prioritizeSEO = timeline === 'long' || timeline === 'medium';
    
    // If a package fits within budget
    if (availablePackages.length > 0) {
      // Choose the best package (usually the most expensive one that fits)
      const bestPackageKey = availablePackages[availablePackages.length - 1];
      const bestPackage = packages[bestPackageKey];
      
      // Calculate package price with location adjustment
      let packagePrice = bestPackage.price;
      if (bestPackage.services.includes('googleBusinessProfile') && locationsCount > 1) {
        packagePrice = packagePrice + (locationsCount - 1) * services.googleBusinessProfile.price;
      }
      
      // Start with the minimum required ad spend
      let adSpend = bestPackage.minAdSpend;
      
      // Calculate remaining budget after package price and minimum ad spend
      let remainingBudget = monthlyBudget - (packagePrice + adSpend);
      
      // Determine additional services
      const additionalServices = [];
      const packageServiceIds = bestPackage.services;
      
      // Prioritize services based on business type and goals
      let servicePriorities = Object.keys(services)
        .filter(key => !packageServiceIds.includes(key))
        .map(key => ({ id: key, ...services[key] }));
      
      // Filter out hosting services if a new website is not needed
      if (!needsWebsite) {
        servicePriorities = servicePriorities.filter(service => 
          service.id !== 'basicHosting' && service.id !== 'advancedHosting'
        );
      }
      
      // Adjust priorities based on ad vs SEO preference
      if (prioritizeAds) {
        servicePriorities = moveToFront(servicePriorities, ['localServiceAds', 'searchAds']);
      } else if (prioritizeSEO) {
        servicePriorities = moveToFront(servicePriorities, ['seedlingSeo', 'harvestSeo', 'contentMarketing']);
      }
      
      // Adjust priorities based on business type and goals
      if (businessType === 'local') {
        servicePriorities = moveToFront(servicePriorities, ['reviewManagement', 'appointmentSetting']);
      } else if (businessType === 'online') {
        servicePriorities = moveToFront(servicePriorities, ['webChat', 'emailSms']);
      }
      
      if (goals.includes('leads')) {
        servicePriorities = moveToFront(servicePriorities, ['webChat', 'appointmentSetting']);
      } else if (goals.includes('retention')) {
        servicePriorities = moveToFront(servicePriorities, ['emailSms', 'reviewManagement']);
      }
      
      // Add additional services until we can't add more
      for (const service of servicePriorities) {
        // Skip services that require other services we don't have
        if (service.requires) {
          const hasRequired = service.requires.every(req => 
            packageServiceIds.includes(req) || additionalServices.some(s => s.id === req)
          );
          if (!hasRequired) continue;
        }
        
        // Check if we can afford the service
        const servicePrice = adjustedServices[service.id].adjustedPrice;
        
        if (servicePrice <= remainingBudget) {
          additionalServices.push({
            id: service.id,
            name: service.name,
            price: servicePrice,
            description: service.description
          });
          
          remainingBudget -= servicePrice;
        }
        
        // Stop if budget is too low for any more services
        if (remainingBudget < 49) break;
      }
      
      // Put any remaining budget into ad spend if prioritizing ads
      if (prioritizeAds) {
        adSpend += remainingBudget;
        remainingBudget = 0;
      }
      
      result = {
        type: 'package',
        package: {
          name: bestPackage.name,
          price: packagePrice,
          description: bestPackage.description,
          services: bestPackage.services.map(id => ({ 
            id,
            name: services[id].name,
            description: services[id].description 
          }))
        },
        adSpend: Math.floor(adSpend), // Round down to nearest dollar
        additionalServices,
        totalCost: monthlyBudget - remainingBudget,
        needsWebsite,
        prioritizeAds,
        prioritizeSEO
      };
    } else {
      // No package fits, recommend individual services
      const recommendedServices = [];
      let adSpendServices = [];
      
      // Prioritize services based on business type and goals
      let servicePriorities = Object.keys(services)
        .map(key => ({ id: key, ...services[key] }));
      
      // Filter out hosting services if a new website is not needed
      if (!needsWebsite) {
        servicePriorities = servicePriorities.filter(service => 
          service.id !== 'basicHosting' && service.id !== 'advancedHosting'
        );
      }
      
      // Adjust priorities based on ad vs SEO preference
      if (prioritizeAds) {
        servicePriorities = moveToFront(servicePriorities, ['localServiceAds', 'searchAds']);
      } else if (prioritizeSEO) {
        servicePriorities = moveToFront(servicePriorities, ['seedlingSeo', 'harvestSeo', 'contentMarketing']);
      }
      
      // Adjust priorities based on business type
      if (businessType === 'local') {
        servicePriorities = moveToFront(servicePriorities, ['googleBusinessProfile', 'localServiceAds', 'reviewManagement']);
      } else if (businessType === 'online') {
        servicePriorities = moveToFront(servicePriorities, ['seedlingSeo', 'searchAds', 'webChat']);
      } else {
        servicePriorities = moveToFront(servicePriorities, ['googleBusinessProfile', 'seedlingSeo']);
      }
      
      // Adjust priorities based on goals
      if (goals.includes('awareness')) {
        servicePriorities = moveToFront(servicePriorities, ['googleBusinessProfile', 'seedlingSeo']);
      } else if (goals.includes('leads')) {
        servicePriorities = moveToFront(servicePriorities, ['searchAds', 'localServiceAds', 'crmLeadTracking']);
      } else if (goals.includes('sales')) {
        servicePriorities = moveToFront(servicePriorities, ['searchAds', 'emailSms']);
      } else if (goals.includes('retention')) {
        servicePriorities = moveToFront(servicePriorities, ['emailSms', 'reviewManagement']);
      }
      
      // First, identify and prioritize services with minimum ad spend requirements (if prioritizing ads)
      if (prioritizeAds) {
        adSpendServices = servicePriorities.filter(service => service.minAdSpend && service.minAdSpend > 0);
      } else {
        adSpendServices = []; // Don't prioritize ad services if not focusing on immediate results
      }
      
      // Initial budget allocation
      let remainingBudget = monthlyBudget;
      let baseAdSpend = 0;
      
      // First pass: Add services with ad spend requirements if prioritizing ads
      if (prioritizeAds) {
        for (const service of adSpendServices) {
          const servicePrice = adjustedServices[service.id].adjustedPrice;
          const adSpendNeeded = service.minAdSpend;
          
          if (servicePrice + adSpendNeeded <= remainingBudget) {
            recommendedServices.push({
              id: service.id,
              name: service.name,
              price: servicePrice,
              description: service.description,
              minAdSpend: adSpendNeeded
            });
            
            remainingBudget -= servicePrice;
            baseAdSpend += adSpendNeeded;
            remainingBudget -= adSpendNeeded;
          }
          
          // Stop if we can't afford more ad-based services
          if (remainingBudget < 100) break;
        }
      }
      
      // Second pass: Add SEO and content services if prioritizing long-term growth
      if (prioritizeSEO) {
        // First try to add SEO
        const seoServices = servicePriorities.filter(service => 
          (service.id === 'seedlingSeo' || service.id === 'harvestSeo') && 
          !recommendedServices.some(s => s.id === service.id)
        );
        
        for (const service of seoServices) {
          const servicePrice = adjustedServices[service.id].adjustedPrice;
          
          if (servicePrice <= remainingBudget) {
            recommendedServices.push({
              id: service.id,
              name: service.name,
              price: servicePrice,
              description: service.description
            });
            
            remainingBudget -= servicePrice;
            
            // If we added Seedling SEO (which doesn't include content), make sure to add content marketing
            if (service.id === 'seedlingSeo') {
              // Make content marketing a high priority for the rest of the process
              const contentServiceIndex = servicePriorities.findIndex(s => s.id === 'contentMarketing');
              if (contentServiceIndex > -1) {
                // Remove content marketing from its current position
                const contentService = servicePriorities.splice(contentServiceIndex, 1)[0];
                // Add it to the front of the array to be processed next
                servicePriorities.unshift(contentService);
              }
            }
            
            // Stop after adding one SEO service (they're mutually exclusive)
            break;
          }
        }
      }
      
      // Third pass: Add other services without ad spend requirements
      const nonAdServices = servicePriorities.filter(service => 
        !service.minAdSpend || service.minAdSpend === 0 || !prioritizeAds
      );
      
      for (const service of nonAdServices) {
        // Skip services already added
        if (recommendedServices.some(s => s.id === service.id)) continue;
        
        // Skip services that require other services not yet included
        if (service.requires) {
          const hasRequired = service.requires.every(req => 
            recommendedServices.some(s => s.id === req)
          );
          if (!hasRequired) continue;
        }
        
        const servicePrice = adjustedServices[service.id].adjustedPrice;
        
        if (servicePrice <= remainingBudget) {
          recommendedServices.push({
            id: service.id,
            name: service.name,
            price: servicePrice,
            description: service.description
          });
          
          remainingBudget -= servicePrice;
        }
        
        // Stop if budget is nearly exhausted
        if (remainingBudget < 49) break;
      }
      
      // Put any remaining budget into additional ad spend if prioritizing ads
      let totalAdSpend = baseAdSpend;
      if (prioritizeAds) {
        totalAdSpend += remainingBudget;
        remainingBudget = 0;
      }
      
      result = {
        type: 'services',
        services: recommendedServices,
        adSpend: Math.floor(totalAdSpend), // Round down to nearest dollar
        totalCost: monthlyBudget - remainingBudget,
        needsWebsite,
        prioritizeAds,
        prioritizeSEO
      };
    }
    
    setRecommendation(result);
    setSubmitted(true);
  };

  const resetForm = () => {
    setBusinessType('');
    setIndustry('');
    setBudget('');
    setGoals([]);
    setOnlinePresence('');
    setTimeline('');
    setLocations(1);
    setSubmitted(false);
    setRecommendation(null);
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Digital Marketing Services Recommendation Tool</h1>
      
      {!submitted ? (
        <div className="w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tell Us About Your Business</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              What type of business do you have?
            </label>
            <select 
              value={businessType} 
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select business type</option>
              <option value="local">Local Business</option>
              <option value="online">Online Business</option>
              <option value="both">Both Local and Online</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              What industry are you in?
            </label>
            <select 
              value={industry} 
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select industry</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="homeServices">Home Services</option>
              <option value="professional">Professional Services</option>
              <option value="food">Food & Hospitality</option>
              <option value="health">Health & Wellness</option>
              <option value="auto">Auto Services</option>
              <option value="pet">Pet Services</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              What is your monthly marketing budget? ($)
            </label>
            <input 
              type="number" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              step="1"
              placeholder="Enter your monthly budget"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              How many business locations do you have?
            </label>
            <select 
              value={locations} 
              onChange={(e) => setLocations(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="1">1 location</option>
              <option value="2">2 locations</option>
              <option value="3">3 locations</option>
              <option value="4">4 locations</option>
              <option value="5">5+ locations</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              What are your primary marketing goals? (Select all that apply)
            </label>
            <div className="space-y-2">
              <div>
                <input 
                  type="checkbox" 
                  id="awareness" 
                  value="awareness" 
                  checked={goals.includes('awareness')} 
                  onChange={handleGoalChange}
                  className="mr-2"
                />
                <label htmlFor="awareness">Brand Awareness & Visibility</label>
              </div>
              <div>
                <input 
                  type="checkbox" 
                  id="leads" 
                  value="leads" 
                  checked={goals.includes('leads')} 
                  onChange={handleGoalChange}
                  className="mr-2"
                />
                <label htmlFor="leads">Lead Generation</label>
              </div>
              <div>
                <input 
                  type="checkbox" 
                  id="sales" 
                  value="sales" 
                  checked={goals.includes('sales')} 
                  onChange={handleGoalChange}
                  className="mr-2"
                />
                <label htmlFor="sales">Direct Sales & Revenue</label>
              </div>
              <div>
                <input 
                  type="checkbox" 
                  id="retention" 
                  value="retention" 
                  checked={goals.includes('retention')} 
                  onChange={handleGoalChange}
                  className="mr-2"
                />
                <label htmlFor="retention">Customer Retention & Loyalty</label>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              How would you describe your current online presence?
            </label>
            <select 
              value={onlinePresence} 
              onChange={(e) => setOnlinePresence(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select option</option>
              <option value="none">No website or social media</option>
              <option value="basic">Basic website and/or social profiles</option>
              <option value="established">Established website and active on social media</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              How quickly do you need to see results?
            </label>
            <select 
              value={timeline} 
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select option</option>
              <option value="immediate">Immediate (within 1 month)</option>
              <option value="medium">Medium-term (3-6 months)</option>
              <option value="long">Long-term (6+ months)</option>
            </select>
          </div>
          
          <button 
            onClick={generateRecommendation}
            disabled={!businessType || !industry || !budget || goals.length === 0 || !onlinePresence || !timeline}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Get Recommendations
          </button>
        </div>
      ) : (
        <div className="w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Your Personalized Marketing Recommendations</h2>
          
          {recommendation && recommendation.type === 'package' ? (
            <div>
              <p className="mb-6 text-gray-700">
                Based on your budget of ${budget}/month and business needs, we recommend the {recommendation.package.name} package 
                with ${recommendation.adSpend}/month in ad spend
                {recommendation.additionalServices.length > 0 ? 
                  ` and ${recommendation.additionalServices.length} additional service${recommendation.additionalServices.length > 1 ? 's' : ''}` : 
                  ''
                }.
              </p>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-4">Recommended Package</h3>
                <div className="border rounded-lg p-5 bg-blue-50">
                  <h4 className="text-xl font-bold mb-2">{recommendation.package.name}</h4>
                  <p className="text-gray-600 mb-4">{recommendation.package.description}</p>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Why We Recommend This Package:</h5>
                    <p className="text-gray-700 mb-2">
                      {recommendation.package.name === "Seed Plan" && 
                        `The Seed Plan is perfect for your ${businessType} business with a focus on ${goals.join(", ")}. 
                        It provides essential local visibility through Google Business Profile and lead generation through Local Service Ads, 
                        while tracking performance through analytics and managing leads effectively.`
                      }
                      
                      {recommendation.package.name === "Grow Plan" && 
                        `The Grow Plan adds SEO capabilities to boost your ${businessType} business's online visibility. 
                        This is especially effective for your goals of ${goals.join(", ")}, as it helps both with organic traffic 
                        and local presence, creating a solid foundation for sustainable growth.`
                      }
                      
                      {recommendation.package.name === "Harvest Plan" && 
                        `The Harvest Plan provides a comprehensive marketing strategy for your ${businessType} business, 
                        addressing all your goals of ${goals.join(", ")}. With both comprehensive SEO and multiple advertising channels, 
                        this plan maximizes your visibility and lead generation potential across all fronts.`
                      }
                    </p>
                    
                    {businessType === 'local' && recommendation.package.services.includes('googleBusinessProfile') &&
                      <p className="text-gray-700 mb-2">
                        Google Business Profile optimization is crucial for your local business to appear in local searches and Google Maps.
                      </p>
                    }
                    
                    {timeline === 'immediate' && recommendation.package.services.some(s => s.id === 'localServiceAds' || s.id === 'searchAds') &&
                      <p className="text-gray-700 mb-2">
                        The advertising components will deliver the immediate results you're looking for, while the other services build long-term success.
                      </p>
                    }
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Included Services:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {recommendation.package.services.map(service => (
                        <li key={service.id} className="mb-2">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">{service.description}</div>
                          <div className="text-sm text-gray-700 mt-1">
                            {service.id === 'googleBusinessProfile' && businessType === 'local' && 
                              "Perfect for your local business to increase visibility in local searches and Google Maps."
                            }
                            {service.id === 'googleBusinessProfile' && businessType === 'both' && 
                              "Essential for your hybrid business model to capture local customers through Google searches."
                            }
                            {service.id === 'localServiceAds' && 
                              `Ideal for generating ${goals.includes('leads') ? 'the leads you need' : 'immediate business'} in your local area.`
                            }
                            {service.id === 'searchAds' && 
                              `Provides immediate visibility for your business, supporting your ${timeline === 'immediate' ? 'need for quick results' : 'marketing goals'}.`
                            }
                            {service.id === 'analytics' && 
                              "Allows you to track the performance of your marketing efforts and make data-driven decisions."
                            }
                            {service.id === 'crmLeadTracking' && goals.includes('leads') && 
                              "Essential for managing and nurturing the leads your marketing generates."
                            }
                            {service.id === 'seedlingSeo' && 
                              "Provides foundational SEO to improve organic visibility for key pages and services."
                            }
                            {service.id === 'harvestSeo' && 
                              "Comprehensive SEO strategy to maximize organic traffic and visibility across your entire site."
                            }
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Package Price:</span>
                      <span className="font-medium">${recommendation.package.price}/month</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Ad Spend:</span>
                      <span className="font-medium">${recommendation.adSpend}/month</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between font-bold">
                      <span>Package Total:</span>
                      <span>${recommendation.package.price + recommendation.adSpend}/month</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {recommendation.additionalServices.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4">Recommended Additional Services</h3>
                  
                  <div className="space-y-3">
                    {recommendation.additionalServices.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between mb-1">
                          <h4 className="text-lg font-medium">{service.name}</h4>
                          <span className="font-medium">${service.price}/month</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                        <p className="text-sm text-gray-700">
                          <strong>Why we recommend this: </strong>
                          {service.id === 'reviewManagement' && goals.includes('retention') && 
                            "Managing reviews is crucial for customer retention and building trust with potential customers."
                          }
                          {service.id === 'reviewManagement' && !goals.includes('retention') && 
                            "Reviews significantly impact your local search visibility and customer trust."
                          }
                          {service.id === 'emailSms' && goals.includes('retention') && 
                            "Email and SMS campaigns are powerful tools for maintaining relationships with existing customers."
                          }
                          {service.id === 'emailSms' && goals.includes('sales') && 
                            "Direct communication with customers through email and SMS can significantly boost sales conversion rates."
                          }
                          {service.id === 'webChat' && 
                            `Adding chat functionality to your website improves user experience and helps capture ${goals.includes('leads') ? 'leads' : 'customer inquiries'} before they leave your site.`
                          }
                          {service.id === 'aiChat' && 
                            "AI-powered chat provides 24/7 automated responses to common questions, improving customer service while saving time."
                          }
                          {service.id === 'appointmentSetting' && 
                            "Online appointment setting streamlines the booking process, making it easier for customers to schedule services."
                          }
                          {service.id === 'advancedHosting' && 
                            "Advanced hosting improves website speed and security, which positively impacts user experience and search rankings."
                          }
                          {service.id === 'basicHosting' && 
                            "Reliable hosting ensures your website stays online and performs well for visitors."
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : recommendation && recommendation.type === 'services' ? (
            <div>
              <p className="mb-6 text-gray-700">
                Based on your budget of ${budget}/month, we recommend a custom selection of {recommendation.services.length} services
                {recommendation.adSpend > 0 ? ` with ${recommendation.adSpend}/month in ad spend` : ''}.
                To access our package deals, consider increasing your budget to at least $1,059/month (Seed Plan + ad spend).
              </p>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-4">Recommended Services</h3>
                
                <div className="space-y-3">
                  {recommendation.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between mb-1">
                        <h4 className="text-lg font-medium">{service.name}</h4>
                        <span className="font-medium">${service.price}/month</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                      <p className="text-sm text-gray-700">
                        <strong>Why we recommend this: </strong>
                        {service.id === 'googleBusinessProfile' && businessType !== 'online' && 
                          "Google Business Profile optimization is essential for your local visibility and appears prominently in local searches."
                        }
                        {service.id === 'localServiceAds' && 
                          `Local Service Ads provide immediate visibility with Google's guaranteed badge, ideal for your ${businessType} business${goals.includes('leads') ? ' and lead generation goals' : ''}.`
                        }
                        {service.id === 'searchAds' && 
                          `Google Search Ads deliver immediate traffic to your website, supporting your ${timeline === 'immediate' ? 'need for quick results' : 'marketing objectives'}.`
                        }
                        {service.id === 'analytics' && 
                          "Analytics tracking provides essential insights into how your marketing efforts are performing."
                        }
                        {service.id === 'crmLeadTracking' && 
                          `CRM and lead tracking tools ${goals.includes('leads') ? 'are crucial for managing the leads you generate' : 'help organize customer information effectively'}.`
                        }
                        {service.id === 'reviewManagement' && 
                          `Review management ${goals.includes('retention') ? 'improves customer retention' : 'builds trust with potential customers'} and enhances your online reputation.`
                        }
                        {service.id === 'emailSms' && goals.includes('retention') && 
                          "Email and SMS campaigns are powerful tools for maintaining relationships with existing customers."
                        }
                        {service.id === 'emailSms' && goals.includes('sales') && 
                          "Direct communication with customers through email and SMS can significantly boost sales conversion rates."
                        }
                        {service.id === 'webChat' && 
                          `Adding chat functionality to your website improves user experience and helps capture ${goals.includes('leads') ? 'leads' : 'customer inquiries'} before they leave your site.`
                        }
                        {service.id === 'aiChat' && 
                          "AI-powered chat provides 24/7 automated responses to common questions, improving customer service while saving time."
                        }
                        {service.id === 'appointmentSetting' && 
                          "Online appointment setting streamlines the booking process, making it easier for customers to schedule services."
                        }
                        {service.id === 'seedlingSeo' && 
                          `Seedling SEO provides foundational optimization for key pages, supporting your ${goals.includes('awareness') ? 'awareness goals' : 'online visibility needs'}.`
                        }
                        {service.id === 'contentMarketing' && 
                          `A 1000-word article each month helps establish your expertise and provides fresh content for your website. ${timeline === 'long' || timeline === 'medium' ? 'This ongoing content creation is essential for long-term SEO success' : 'Quality content helps engage visitors and improve conversion rates'}.`
                        }
                        {service.id === 'harvestSeo' && 
                          `Comprehensive SEO is ideal for your long-term growth goals${timeline === 'long' ? ', aligning perfectly with your timeline expectations' : ''}. This service builds sustainable organic traffic without ongoing ad costs.`
                        }
                        {service.id === 'seedlingSeo' && timeline === 'long' && 
                          "Seedling SEO provides a solid foundation for long-term organic growth, which aligns perfectly with your timeline goals."
                        }
                        {service.id === 'basicHosting' && 
                          `Basic hosting is recommended because ${onlinePresence === 'none' ? 'you mentioned not having a website yet' : 'your website needs reliable hosting to stay online and perform well'}.`
                        }
                        {service.id === 'advancedHosting' && 
                          `Advanced hosting is recommended because ${onlinePresence === 'none' ? 'you mentioned not having a website yet and will need secure, reliable hosting' : 'your website would benefit from enhanced security and performance features'}.`
                        }
                      </p>
                      {service.minAdSpend && (
                        <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block">
                          Requires ${service.minAdSpend}/month minimum ad spend for optimal results
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Budget Breakdown</h3>
            
            <div className="space-y-2">
              {recommendation && recommendation.type === 'package' && (
                <div className="flex justify-between">
                  <span>{recommendation.package.name}:</span>
                  <span>${recommendation.package.price}/month</span>
                </div>
              )}
              
              {recommendation && recommendation.type === 'package' && recommendation.additionalServices.length > 0 && (
                <div className="flex justify-between">
                  <span>Additional Services:</span>
                  <span>
                    ${recommendation.additionalServices.reduce((sum, service) => sum + service.price, 0)}/month
                  </span>
                </div>
              )}
              
              {recommendation && recommendation.type === 'services' && (
                <div className="flex justify-between">
                  <span>Services:</span>
                  <span>
                    ${recommendation.services.reduce((sum, service) => sum + service.price, 0)}/month
                  </span>
                </div>
              )}
              
              {recommendation && recommendation.adSpend > 0 && (
                <div className="flex justify-between">
                  <span>Ad Spend:</span>
                  <span>${recommendation.adSpend}/month</span>
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                <span>Total Monthly Investment:</span>
                <span>${recommendation ? recommendation.totalCost : 0}/month</span>
              </div>
              
              {/* No remaining budget to display - all budget is allocated */}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4">Your Marketing Strategy</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="mb-3 text-gray-700">Based on your responses, we recommend the following approach:</p>
              
              {businessType === 'local' && (
                <div className="mb-3">
                  <h4 className="font-medium">Local Business Strategy:</h4>
                  <p className="text-gray-700">
                    Focus on enhancing your local visibility through Google Business Profile optimization and local service ads.
                    Collect and manage customer reviews to build trust in your community.
                  </p>
                </div>
              )}
              
              {businessType === 'online' && (
                <div className="mb-3">
                  <h4 className="font-medium">Online Business Strategy:</h4>
                  <p className="text-gray-700">
                    Invest in SEO and targeted search ads to drive quality traffic to your website. 
                    Enhance user experience with tools like web chat to engage visitors and convert them into customers.
                  </p>
                </div>
              )}
              
              {businessType === 'both' && (
                <div className="mb-3">
                  <h4 className="font-medium">Hybrid Business Strategy:</h4>
                  <p className="text-gray-700">
                    Balance local visibility with broader online presence through a combination of local SEO, 
                    Google Business Profile optimization, and targeted advertising.
                  </p>
                </div>
              )}
              
              {goals.includes('awareness') && (
                <div className="mb-3">
                  <h4 className="font-medium">For Brand Awareness:</h4>
                  <p className="text-gray-700">
                    Maximize your online visibility through SEO and a strong Google Business presence.
                  </p>
                </div>
              )}
              
              {goals.includes('leads') && (
                <div className="mb-3">
                  <h4 className="font-medium">For Lead Generation:</h4>
                  <p className="text-gray-700">
                    Utilize targeted ads and lead tracking tools to capture and nurture potential customers.
                  </p>
                </div>
              )}
              
              {goals.includes('sales') && (
                <div className="mb-3">
                  <h4 className="font-medium">For Sales Growth:</h4>
                  <p className="text-gray-700">
                    Implement conversion-focused strategies like search ads and email campaigns to drive direct sales.
                  </p>
                </div>
              )}
              
              {goals.includes('retention') && (
                <div className="mb-3">
                  <h4 className="font-medium">For Customer Retention:</h4>
                  <p className="text-gray-700">
                    Focus on email/SMS campaigns and review management to maintain engagement with existing customers.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={resetForm}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      )}
      
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>This tool provides personalized recommendations based on your specific business needs.</p>
        <p>For a detailed consultation, please contact us directly.</p>
      </div>
    </div>
  );
};

export default MarketingRecommendationEngine;
