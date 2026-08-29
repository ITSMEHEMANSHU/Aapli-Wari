import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  en: {
    nav: {
      explore: 'Explore',
      map: 'Map',
      channels: 'Channels',
      contribute: 'Contribute',
      join: 'Join Aapli Wari',
      profile: 'Profile',
      settings: 'Settings',
      language: 'Language',
    },
    common: {
      save: 'Save Settings',
      saveSuccess: 'Settings saved successfully!',
      english: 'English',
      marathi: 'मराठी',
    },
    home: {
      heroTitleOne: 'Walk the path.',
      heroTitleTwo: 'Live the',
      heroTitleAccent: 'legacy.',
      heroSubtitle:
        'Aapli Wari is a digital home for the living heritage of Pandharpur Wari. Discover. Learn. Share. Preserve.',
      exploreButton: 'Explore the Wari',
      aiButton: 'Ask Aapli Wari AI',
      watchJourney: 'Watch the journey in 90 seconds',
      pillars: {
        discover: { title: 'Discover', desc: 'Traditions, stories and hidden wisdom' },
        learn: { title: 'Learn', desc: 'From saints, scholars and Warkaris' },
        share: { title: 'Share', desc: 'Your experiences, knowledge and seva' },
        preserve: { title: 'Preserve', desc: 'Authentic heritage for generations' },
        connect: { title: 'Connect', desc: 'A global community of Warkari devotees' },
      },
      experience: {
        eyebrow: 'The Wari Experience',
        titleOne: 'More than a journey,',
        titleTwo: "it's a",
        titleAccent: 'way of life',
        description:
          'From the abhangs of saints to the footsteps of millions, explore every aspect of Wari in one unified platform.',
        cta: 'Start Exploring',
      },
      stats: {
        authenticStories: 'Authentic Stories',
        palkhiRoutes: 'Palkhi Routes',
        contributors: 'Warkari Contributors',
        devotees: 'Global Devotees',
      },
      newsletter: {
        title: 'Be a part of the movement.',
        subtitle: 'Join our community and never miss important updates, stories and Wari moments.',
        placeholder: 'Enter your email',
      },
    },
    footer: {
      explore: 'Explore',
      community: 'Community',
      support: 'Support',
      preserve: 'Preserve. Understand. Discover.',
      quote: 'ज्ञानबा-तुकाराम! 🙏',
      quoteSubtitle: 'The knowledge that unites millions, now in your hands.',
      rights: 'All rights reserved.',
      links: {
        traditions: 'Traditions',
        abhangs: 'Abhangs',
        places: 'Places',
        channels: 'Channels',
        contribute: 'Contribute',
        events: 'Events',
        seva: 'Seva Opportunities',
        directory: 'Warkari Directory',
        help: 'Help Center',
        guidelines: 'Guidelines',
        privacy: 'Privacy Policy',
        terms: 'Terms of Use',
        contact: 'Contact Us',
      },
    },
    settingsPage: {
      title: 'Settings',
      profile: 'Profile Settings',
      preferences: 'Preferences',
      name: 'Name',
      email: 'Email',
      language: 'Language',
      notifications: 'Enable Notifications',
      darkMode: 'Dark Mode',
    },
  },
  mr: {
    nav: {
      explore: 'अन्वेषण',
      map: 'नकाशा',
      channels: 'चॅनेल्स',
      contribute: 'योगदान',
      join: 'आपली वारीमध्ये सामील व्हा',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्ज',
      language: 'भाषा',
    },
    common: {
      save: 'सेटिंग्ज सेव्ह करा',
      saveSuccess: 'सेटिंग्ज यशस्वीरित्या सेव्ह झाली!',
      english: 'English',
      marathi: 'मराठी',
    },
    home: {
      heroTitleOne: 'मार्गावर चालत जा.',
      heroTitleTwo: 'आठवण',
      heroTitleAccent: 'जागवून घ्या.',
      heroSubtitle:
        'आपली वारी हा पंढरपूर वारीच्या जिवंत वारशाचा डिजिटल निवास आहे. शोधा. शिका. वाटा. जपवा.',
      exploreButton: 'वारीचे अन्वेषण करा',
      aiButton: 'आपली वारी AI विचारणा',
      watchJourney: '90 सेकंदांत प्रवास पाहा',
      pillars: {
        discover: { title: 'शोध', desc: 'परंपरा, कथां आणि लपलेले ज्ञान' },
        learn: { title: 'शिका', desc: 'संत, विद्वान आणि वारकरींपासून' },
        share: { title: 'सांगा', desc: 'तुमचा अनुभव, ज्ञान आणि सेवा' },
        preserve: { title: 'जपणे', desc: 'पिढ्यांपर्यंत सत्य वारसा' },
        connect: { title: 'जोडा', desc: 'वारकरी भक्तांचा जागतिक समुदाय' },
      },
      experience: {
        eyebrow: 'वारी अनुभव',
        titleOne: 'फक्त प्रवास नव्हे,',
        titleTwo: 'ही',
        titleAccent: 'जीवनशैली',
        description:
          'संतांच्या अभंगांपासून ते लाखो पायऱ्यांपर्यंत, एका व्याप्त मंचावर वारीचा प्रत्येक पैलू अनुभवण्याची सोय.',
        cta: 'अन्वेषण सुरू करा',
      },
      stats: {
        authenticStories: 'अधिकार्य कथां',
        palkhiRoutes: 'पळखी मार्ग',
        contributors: 'वारकरी योगदानकर्ते',
        devotees: 'जागतिक भक्त',
      },
      newsletter: {
        title: 'गतीत सहभागी व्हा.',
        subtitle: 'आमच्या समुदायात सामील व्हा आणि महत्त्वाच्या अपडेट्स, कथां आणि वारकरी क्षणांची माहिती मिळवा.',
        placeholder: 'तुमचा ईमेल टाका',
      },
    },
    footer: {
      explore: 'अन्वेषण',
      community: 'समुदाय',
      support: 'सपोर्ट',
      preserve: 'जपणे. समजून घ्या. शोधा.',
      quote: 'ज्ञानबा-तुकाराम! 🙏',
      quoteSubtitle: 'मिलिंदांचे ज्ञान आता तुमच्या हातात.',
      rights: 'सर्व हक्क राखीव.',
      links: {
        traditions: 'परंपरा',
        abhangs: 'अभंग',
        places: 'स्थळे',
        channels: 'चॅनेल्स',
        contribute: 'योगदान',
        events: 'कार्यक्रम',
        seva: 'सेवा संधी',
        directory: 'वारकरी डायरेक्टरी',
        help: 'मदत केंद्र',
        guidelines: 'मार्गदर्शक तत्त्वे',
        privacy: 'गोपनीयता धोरण',
        terms: 'उपयोगाच्या अटी',
        contact: 'संपर्क करा',
      },
    },
    settingsPage: {
      title: 'सेटिंग्ज',
      profile: 'प्रोफाइल सेटिंग्ज',
      preferences: 'प्राधान्ये',
      name: 'नाव',
      email: 'ईमेल',
      language: 'भाषा',
      notifications: 'सूचनांचे व्यवस्थापन सक्षम करा',
      darkMode: 'डार्क मोड',
    },
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem('apliwari-language');
    return saved && translations[saved] ? saved : 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('apliwari-language', language);
    }
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key) => {
      const segments = key.split('.');
      let current = translations[language];

      for (const segment of segments) {
        if (current == null) return key;
        current = current[segment];
      }

      return current ?? key;
    },
    languageOptions: [
      { value: 'en', label: translations.en.common.english },
      { value: 'mr', label: translations.mr.common.marathi },
    ],
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
