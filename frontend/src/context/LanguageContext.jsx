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
    channelPage: {
      backAll: 'All Channels',
      backAdmin: 'Admin Channels',
      palkhiChannel: 'Palkhi Channel',
      pramukh: 'Pramukh:',
      youAreOwner: 'You are the owner',
      youOwnThis: 'You own this',
      manageChannel: 'Manage Channel',
      followChannel: '+ Follow Channel',
      following: 'Following',
      adminViewOnly: 'Admin Read-Only View',
      followers: 'Followers',
      updates: 'Updates',
      emergencyHelpline: 'Emergency Helpline',
      edit: 'Edit',
      call: 'Call',
      noHelpline: 'No emergency helpline configured yet.',
      addEmergencyContact: '+ Add Emergency Contact',
      contactPerson: 'Contact Person:',
      helplinePhone: 'Helpline Phone:',
      role: 'Designation / Role:',
      notSpecified: 'Not specified',
      searchPlaceholder: 'Search channel posts and announcements',
      tabs: {
        announcements: 'Announcements',
        chat: 'Chat',
        map: 'Route Map',
        info: 'About & Info',
      },
      announcements: {
        postTitle: 'Post Official Palkhi Announcement',
        placeholder: 'Broadcast route changes, meal timings, water points, or important alerts to all warkaris...',
        pin: '📌 Pin this update to top',
        broadcasting: 'Broadcasting...',
        broadcast: 'Broadcast Announcement',
        empty: 'No Announcements Yet',
        emptySub: 'Official route alerts and procession schedules from Palkhi Pramukh will appear here.',
        pinned: 'PINNED',
        badge: 'Palkhi Announcement',
        viewDoc: 'View Attached Document',
        share: 'Share',
      },
      chat: {
        emptyTitle: 'Start the Conversation',
        emptySub: 'Channel members and authorized sevaks can coordinate updates in real-time here.',
        sevak: 'Sevak',
        pramukh: 'Pramukh',
        warkari: 'Warkari',
        reply: 'Reply',
        replyingTo: 'Replying to',
        attachedPdf: 'Attached Document (PDF)',
        placeholder: 'Write a message to channel...',
        replyPlaceholder: 'Write a reply to',
        joinTitle: 'Join the Conversation',
        joinSub: 'Sign in to share updates, ask questions, and chat with fellow warkaris.',
        signIn: 'Sign In to Chat',
      },
      map: {
        title: 'Palkhi Route Map & Halts',
        desc: 'Interactive real-time map integration showing GPS live location of Palkhi, Annachhatra (Food) tents, Drinking Water, Medical Vans, and Police checkpoints.',
        nightHalts: 'Night Halts',
        annachhatra: 'Annachhatra',
        medical: 'Medical',
        waterTanks: 'Water Tanks',
        openMap: 'Open Interactive Live Map',
      },
      info: {
        aboutTitle: 'About This Channel',
        aboutDefault: 'Dedicated channel for Palkhi updates, Aarti schedules, seva details, and warkari pilgrim coordination.',
        helplineTitle: 'Palkhi Helpline & Medical Emergency',
        editHelpline: 'Edit Helpline',
        authorizedSevaks: 'Authorized Sevaks',
        viewAll: 'View All',
        verifiedSevak: 'Verified Sevak',
      },
      modals: {
        emergencyTitle: '🚨 Update Emergency Helpline',
        personName: 'Contact Person / Center Name',
        phone: 'Emergency Phone Number',
        roleDesc: 'Designation / Role Description',
        cancel: 'Cancel',
        saveHelpline: 'Save Helpline',
        saving: 'Saving...',
        detailsTitle: 'Channel Details',
        created: 'Created:',
        descLabel: 'Description',
        totalUpdates: 'Total Updates',
        contributorsTitle: 'All Contributors',
        noContributors: 'No contributors listed.',
        remove: 'Remove',
      },
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
    channelPage: {
      backAll: 'सर्व चॅनेल्स',
      backAdmin: 'अ‍ॅडमिन चॅनेल्स',
      palkhiChannel: 'पालखी चॅनेल',
      pramukh: 'प्रमुख:',
      youAreOwner: 'तुम्ही मालक आहात',
      youOwnThis: 'तुम्ही मालक आहात',
      manageChannel: 'चॅनेल व्यवस्थापन',
      followChannel: '+ चॅनेल फॉलो करा',
      following: 'फॉलो केले',
      adminViewOnly: 'अ‍ॅडमिन वाचन-केवळ दृश्य',
      followers: 'फॉलोअर्स',
      updates: 'अपडेट्स',
      emergencyHelpline: 'आपत्कालीन संपर्क',
      edit: 'संपादित करा',
      call: 'कॉल करा',
      noHelpline: 'आपत्कालीन हेल्पलाइन उपलब्ध नाही.',
      addEmergencyContact: '+ आपत्कालीन संपर्क जोडा',
      contactPerson: 'संपर्क व्यक्ती:',
      helplinePhone: 'हेल्पलाइन फोन:',
      role: 'पद / भूमिका:',
      notSpecified: 'दिलेले नाही',
      searchPlaceholder: 'चॅनेलवरील पोस्ट आणि घोषणा शोधा...',
      tabs: {
        announcements: 'घोषणा',
        chat: 'चर्चा',
        map: 'पालखी मार्ग',
        info: 'माहिती',
      },
      announcements: {
        postTitle: 'अधिकृत पालखी घोषणा प्रसिद्ध करा',
        placeholder: 'मार्ग बदल, भोजन वेळ, पाणी वाटप किंवा इतर महत्त्वाच्या सूचना सर्व वारकऱ्यांना सांगा...',
        pin: '📌 ही घोषणा सर्वात वर ठेवा',
        broadcasting: 'प्रसारित करत आहे...',
        broadcast: 'घोषणा प्रसिद्ध करा',
        empty: 'अद्याप कोणतीही घोषणा नाही',
        emptySub: 'पालखी प्रमुखांनी केलेल्या अधिकृत घोषणा येथे दिसतील.',
        pinned: 'पिन केलेले',
        badge: 'पालखी घोषणा',
        viewDoc: 'संलग्न दस्तऐवज पहा',
        share: 'शेअर',
      },
      chat: {
        emptyTitle: 'संवाद सुरू करा',
        emptySub: 'चॅनेल सदस्य आणि सेवेकरी येथे थेट संवाद साधू शकतात.',
        sevak: 'सेवेकरी',
        pramukh: 'प्रमुख',
        warkari: 'वारकरी',
        reply: 'उत्तर द्या',
        replyingTo: 'उत्तर देत आहे:',
        attachedPdf: 'संलग्न दस्तऐवज (PDF)',
        placeholder: 'चॅनेलवर संदेश लिहा...',
        replyPlaceholder: 'उत्तर लिहा...',
        joinTitle: 'संवादात सामील व्हा',
        joinSub: 'अपडेट्स शेअर करण्यासाठी आणि वारकऱ्यांशी संवाद साधण्यासाठी साइन इन करा.',
        signIn: 'चॅट करण्यासाठी साइन इन करा',
      },
      map: {
        title: 'पालखी मार्ग आणि मुक्काम',
        desc: 'पालखीचे थेट जीपीएस स्थान, अन्नछत्र तंबू, पिण्याचे पाणी, वैद्यकीय व्हॅन आणि पोलीस मदत केंद्र दाखवणारा रिअल-टाइम नकाशा.',
        nightHalts: 'रात्रीचे मुक्काम',
        annachhatra: 'अन्नछत्र',
        medical: 'वैद्यकीय सेवा',
        waterTanks: 'पाणी वाटप',
        openMap: 'थेट नकाशा उघडा',
      },
      info: {
        aboutTitle: 'या चॅनेलविषयी',
        aboutDefault: 'पालखी अपडेट्स, आरती वेळापत्रक, सेवा तपशील आणि वारकरी भाविकांसाठी समर्पित चॅनेल.',
        helplineTitle: 'पालखी हेल्पलाइन आणि वैद्यकीय मदत',
        editHelpline: 'हेल्पलाइन बदला',
        authorizedSevaks: 'अधिकृत सेवेकरी',
        viewAll: 'सर्व पहा',
        verifiedSevak: 'नोंदणीकृत सेवेकरी',
      },
      modals: {
        emergencyTitle: '🚨 आपत्कालीन हेल्पलाइन अपडेट करा',
        personName: 'संपर्क व्यक्ती / केंद्राचे नाव',
        phone: 'आपत्कालीन फोन नंबर',
        roleDesc: 'पद / भूमिका',
        cancel: 'रद्द करा',
        saveHelpline: 'हेल्पलाइन सेव्ह करा',
        saving: 'सेव्ह करत आहे...',
        detailsTitle: 'चॅनेल तपशील',
        created: 'तयार केले:',
        descLabel: 'वर्णन',
        totalUpdates: 'एकूण अपडेट्स',
        contributorsTitle: 'सर्व सेवेकरी',
        noContributors: 'कोणतेही सेवेकरी नाहीत.',
        remove: 'काढून टाका',
      },
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
