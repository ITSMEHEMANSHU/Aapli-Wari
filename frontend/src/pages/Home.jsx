import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiPlay,
  FiChevronLeft,
  FiChevronRight,
  FiBook,
  FiUsers,
  FiShare2,
  FiShield,
  FiGlobe,
  FiVideo,
  FiMapPin,
  FiRadio,
  FiCpu,
  FiHeart,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

import { IMAGES, heroImage, cardImage, videoUrl, videoPosterUrl } from '../utils/cloudinary';
import { useLanguage } from '../context/LanguageContext';

const HERO_TYPE = 'image';
const HERO_VIDEO_URL = 'https://res.cloudinary.com/dqrqcnlpx/video/upload/your-video-id.mp4';

const carouselSlides = [
  {
    category: 'Live Tracking',
    title: 'Live Map',
    subtitle: 'Track Palkhi route',
    description: 'Track the real-time coordinates, daily stopovers, and live movement of Sant Tukaram Maharaj and Sant Dnyaneshwar Maharaj Palkhis.',
    buttonText: 'View Live Route',
    link: '/explore?type=map',
    icon: FiMapPin,
    iconColor: 'text-[#E87A1E]',
    imageKey: IMAGES.palkhis,
  },
  {
    category: 'Devotional Broadcasts',
    title: 'Channels',
    subtitle: 'Dindi broadcasts',
    description: 'Listen to non-stop live audio broadcasts, soulful kirtans, and abhangs streamed straight from active Dindi groups.',
    buttonText: 'Tune In Now',
    link: '/channels',
    icon: FiRadio,
    iconColor: 'text-amber-700',
    imageKey: IMAGES.abhangs,
  },
  {
    category: 'Virtual Guide',
    title: 'AI Assistant',
    subtitle: '24/7 Route help',
    description: 'Get instant answers for schedule updates, accommodation options, emergency contacts, or historical significance.',
    buttonText: 'Ask AI Assistant',
    link: '/ai-assistant',
    icon: FiCpu,
    iconColor: 'text-emerald-600',
    imageKey: IMAGES.holyPlaces,
  },
  {
    category: 'Digital Seva',
    title: 'Contribute',
    subtitle: 'Share your Seva',
    description: 'Participate in community service initiatives by offering meal points, medical support, or sharing voluntary efforts.',
    buttonText: 'Share Your Seva',
    link: '/contribute',
    icon: FiHeart,
    iconColor: 'text-rose-600',
    imageKey: IMAGES.seva,
  },
];

const pillars = [
  { icon: FiBook, title: 'Discover', desc: 'Traditions, stories and hidden wisdom' },
  { icon: FiUsers, title: 'Learn', desc: 'From saints, scholars and Warkaris' },
  { icon: FiShare2, title: 'Share', desc: 'Your experiences, knowledge and seva' },
  { icon: FiShield, title: 'Preserve', desc: 'Authentic heritage for generations' },
  { icon: FiGlobe, title: 'Connect', desc: 'A global community of Warkari devotees' },
];

const shorts = [
  { title: 'Ringan Sohala at Indapur 🚩', views: 0, videoId: '2_k5rw5y', posterId: '2_k5rw5y' },
  { title: 'Mauli Palkhi Departure Moments ✨', views: 0, videoId: '5_xvtqyk', posterId: '5_xvtqyk' },
  { title: 'Soulful Abhang in Midnight Kirtan 🎶', views: 0, videoId: '3_1_xbsqp6', posterId: '3_1_xbsqp6' },
  { title: 'The Seva of Free Meals (Annadaan) 🍲', views: 0, videoId: '2_1_hsijyi', posterId: '2_1_hsijyi' },
  { title: 'Ancient Manuscripts Preserved 📜', views: 0, videoId: '3_mxqflg', posterId: '3_mxqflg' },
];

const stats = [
  { value: '500+', label: 'Authentic Stories' },
  { value: '200+', label: 'Palkhi Routes' },
  { value: '1000+', label: 'Warkari Contributors' },
  { value: '50K+', label: 'Global Devotees' },
];

export const Home = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [selectedShort, setSelectedShort] = useState(null);
  const [shortViewMap, setShortViewMap] = useState({});

  const text = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const changeSlide = (newIndex) => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentSlide(newIndex);
      setIsFading(false);
    }, 250);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      changeSlide((currentSlide + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handlePrevSlide = () => {
    const prevIndex = currentSlide === 0 ? carouselSlides.length - 1 : currentSlide - 1;
    changeSlide(prevIndex);
  };

  const handleNextSlide = () => {
    const nextIndex = (currentSlide + 1) % carouselSlides.length;
    changeSlide(nextIndex);
  };

  const translatedPillars = pillars.map((item, idx) => ({
    ...item,
    title: text(`home.pillars.${['discover', 'learn', 'share', 'preserve', 'connect'][idx]}.title`, item.title),
    desc: text(`home.pillars.${['discover', 'learn', 'share', 'preserve', 'connect'][idx]}.desc`, item.desc),
  }));

  const getShortViewCount = (short) => {
    const shortId = short?.videoId;
    const count = shortId ? shortViewMap[shortId] ?? short.views ?? 0 : short.views ?? 0;
    return `${count} view${count === 1 ? '' : 's'}`;
  };

  const openShortVideo = (short) => {
    if (!short?.videoId) return;
    setShortViewMap((prev) => ({
      ...prev,
      [short.videoId]: (prev[short.videoId] ?? short.views ?? 0) + 1,
    }));
    setSelectedShort(short);
  };

  return (
    <div className="w-full bg-[#FDF8F0] font-['Poppins',sans-serif] antialiased selection:bg-[#E87A1E] selection:text-white">
      <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#1E110A] text-white">
        <div className="absolute inset-0 z-0">
          {HERO_TYPE === 'video' ? (
            <video src={HERO_VIDEO_URL} autoPlay muted loop playsInline className="w-full h-full object-cover object-center" />
          ) : (
            <img
              src={heroImage(IMAGES.hero)}
              alt="Pandharpur Wari"
              className="w-full h-full object-cover object-center sm:object-top"
              loading="eager"
            />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0C05]/95 via-[#2B150A]/75 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0C05] via-transparent to-transparent z-[1]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-xs">
              <span className="text-xs font-semibold text-orange-200 tracking-wider uppercase">
                {text('home.heroBadge', 'आषाढी वारी — The Digital Heritage Portal')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6 drop-shadow-md tracking-tight">
              {text('home.heroTitleOne', 'Walk the path.')}<br />
              {text('home.heroTitleTwo', 'Live the')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-400 to-[#E87A1E]">{text('home.heroTitleAccent', 'legacy.')}</span>
            </h1>

            <p className="text-base sm:text-lg text-white/85 max-w-lg mb-8 leading-relaxed font-light">
              {text('home.heroSubtitle', 'Aapli Wari is a digital sanctuary preserving the living heritage of Pandharpur Wari. Discover abhangs, track live processions, and connect with millions.')}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link to="/explore">
                <button className="inline-flex items-center gap-2.5 bg-[#E87A1E] hover:bg-[#C8521A] text-white font-bold px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 text-sm sm:text-base active:scale-95 cursor-pointer">
                  {text('home.exploreButton', 'Explore Wari')} <FiArrowRight className="text-lg" />
                </button>
              </Link>
              <Link to="/ai-assistant">
                <button className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold px-7 py-3.5 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 text-sm sm:text-base active:scale-95 cursor-pointer">
                  <HiSparkles className="text-amber-300" /> {text('home.aiButton', 'Ask Aapli Wari AI')}
                </button>
              </Link>
            </div>

            <button className="inline-flex items-center gap-3 text-xs sm:text-sm text-white/80 hover:text-white transition-colors group cursor-pointer">
              <span className="w-9 h-9 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-[#E87A1E] group-hover:border-[#E87A1E] transition-all duration-300 shadow-md">
                <FiPlay size={12} className="ml-0.5 fill-current text-white" />
              </span>
              <span className="font-medium tracking-wide">{text('home.watchJourney', 'Watch the journey in 90 seconds')}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#F9F1E5] border-b border-[#E8D9C3]/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-4">
            {translatedPillars.map((item, i) => (
              <div
                key={i}
                className={`group text-center flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 bg-white/80 hover:shadow-xs ${
                  i < translatedPillars.length - 1 ? 'md:border-r border-[#E8D9C3]/60' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl border text-white flex items-center justify-center shadow-2xs border-[#E87A1E] bg-[#E87A1E] group-hover:scale-105 transition-all duration-300">
                  <item.icon size={20} />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <h3 className="font-bold text-[#2D1B0E] text-sm sm:text-base tracking-wide">{item.title}</h3>
                </div>
                <p className="text-xs text-[#5A4030]/80 leading-relaxed max-w-[140px] font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-[#FDF8F0] border-b border-[#E8D9C3]/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-[#E87A1E] uppercase tracking-widest">
              Featured Highlights
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2D1B0E] mt-1">
              Essential Digital Services
            </h2>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E8D9C3]/50 bg-[#1F1008]">
            <div className="relative h-[360px] sm:h-[400px] w-full overflow-hidden">
              <img
                src={cardImage(carouselSlides[currentSlide].imageKey)}
                alt={carouselSlides[currentSlide].title}
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  isFading ? 'opacity-40 scale-100' : 'opacity-100 scale-105'
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1008] via-[#1F1008]/80 to-[#1F1008]/40" />

              <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 sm:px-16 text-white max-w-3xl mx-auto transition-all duration-500 ease-in-out ${
                  isFading ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
                }`}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-medium text-orange-100 mb-3 shadow-xs">
                  <span>🚩</span> {carouselSlides[currentSlide].category}
                </div>

                <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-1 drop-shadow-md">
                  {carouselSlides[currentSlide].title}
                </h3>
                <p className="text-sm sm:text-base text-orange-300 font-medium mb-3">
                  {carouselSlides[currentSlide].subtitle}
                </p>

                <p className="text-xs sm:text-sm text-gray-200/90 max-w-xl font-light leading-relaxed mb-6 line-clamp-2">
                  {carouselSlides[currentSlide].description}
                </p>

                <Link to={carouselSlides[currentSlide].link}>
                  <button className="inline-flex items-center gap-2 bg-[#E87A1E] hover:bg-[#C8521A] text-white font-bold px-7 py-3 rounded-full text-xs sm:text-sm shadow-lg hover:shadow-orange-600/30 transition-all duration-300 active:scale-95 cursor-pointer">
                    {carouselSlides[currentSlide].buttonText} <FiArrowRight size={14} />
                  </button>
                </Link>
              </div>

              <button
                onClick={handlePrevSlide}
                aria-label="Previous Slide"
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-[#E87A1E] text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer active:scale-90 z-20"
              >
                <FiChevronLeft size={20} />
              </button>

              <button
                onClick={handleNextSlide}
                aria-label="Next Slide"
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-[#E87A1E] text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer active:scale-90 z-20"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {carouselSlides.map((slide, idx) => {
              const Icon = slide.icon;
              const isActive = currentSlide === idx;
              return (
                <button
                  key={idx}
                  onClick={() => changeSlide(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3.5 cursor-pointer ${
                    isActive ? 'bg-white border-[#E87A1E] shadow-md -translate-y-0.5' : 'bg-white/70 border-[#E8D9C3] hover:bg-white hover:border-[#E87A1E]/50'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-[#F7ECC1] ${slide.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <div className={`font-bold text-xs sm:text-sm truncate ${isActive ? 'text-[#E87A1E]' : 'text-[#2D1B0E]'}`}>
                      {slide.title}
                    </div>
                    <div className="text-[11px] text-[#5A4030]/80 truncate">{slide.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#F9F1E5] py-16 border-b border-[#E8D9C3]/80 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 text-[#E87A1E] text-xs font-bold tracking-widest uppercase mb-3">
                ⟿ THE WARI EXPERIENCE
              </span>
              <h2 className="text-4xl sm:text-6xl lg:text-[5.5rem] font-black text-[#2D1B0E] leading-[0.95] tracking-[-0.06em]">
                More than a journey,<br />
                it's a <span className="text-[#E87A1E] italic font-black">way of life.</span>
              </h2>
            </div>

            <div className="md:max-w-sm lg:max-w-md md:pb-4">
              <p className="text-lg sm:text-xl text-[#5A4030] leading-relaxed mb-5 font-medium">
                From holy abhangs to real-time Palkhi schedules, experience the devotion in one place.
              </p>
              <Link to="/explore">
                <button className="inline-flex items-center gap-2 border border-[#E87A1E] text-[#E87A1E] hover:bg-[#E87A1E] hover:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 text-base active:scale-95 cursor-pointer">
                  Start Exploring <FiArrowRight />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-[#E8D9C3]/80 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 border border-[#E87A1E]/30 flex items-center justify-center text-[#E87A1E]">
                <FiVideo size={22} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#2D1B0E]">
                  Wari <span className="text-[#E87A1E]">Shorts</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#5A4030]">Bite-sized divine moments</p>
              </div>
            </div>
            <Link to="/shorts">
              <button className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#E87A1E] hover:text-[#A23B19] uppercase tracking-wider transition-colors cursor-pointer">
                View All Shorts <FiArrowRight />
              </button>
            </Link>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 sm:pb-0 scrollbar-none">
            {shorts.map((short, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openShortVideo(short)}
                className="group shrink-0 w-44 sm:w-auto block text-left cursor-pointer"
              >
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#E8D9C3] bg-[#2D1B0E] shadow-md hover:shadow-xl hover:border-[#E87A1E] hover:-translate-y-1.5 transition-all duration-300">
                  <img
                    src={videoPosterUrl(short.posterId || short.videoId, { width: 500, height: 900, crop: 'fill', quality: 'auto', format: 'jpg' })}
                    alt={short.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md p-2 rounded-full text-white/90">
                    <FiVideo size={12} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="w-11 h-11 rounded-full bg-[#E87A1E] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <FiPlay size={16} className="ml-0.5 fill-current" />
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                    <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 mb-1 group-hover:text-orange-200 transition-colors">
                      {short.title}
                    </h3>
                    <span className="text-[10px] text-white/70 font-medium">{getShortViewCount(short)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedShort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 bg-[#140E0B] shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedShort(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/55 border border-white/15 text-white px-3 py-1.5 text-sm font-medium hover:bg-black/80"
            >
              Close
            </button>
            <video
              key={selectedShort.videoId}
              src={videoUrl(selectedShort.videoId, { format: 'mp4' })}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[80vh] object-contain bg-black"
            />
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-6 pb-20 pt-16">
        <div className="rounded-3xl bg-gradient-to-r from-[#3D2518] to-[#2B1810] px-10 py-12 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center">
            {stats.map((s, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-3xl sm:text-4xl font-serif font-bold text-[#E8A15C] leading-none">{s.value}</div>
                <div className="text-xs text-white/60 mt-1.5">{s.label}</div>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-1 text-center md:text-left">
              <p className="text-xl font-serif font-semibold text-white leading-snug">One Heritage.</p>
              <p className="text-xl font-serif font-semibold text-[#E8A15C] leading-snug">One Family.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-[#F5EADA] border border-[#E8D9C3]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 sm:p-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B1B12] mb-1">
                {text('home.newsletter.title', 'Be a part of the movement.')}
              </h3>
              <p className="text-sm text-[#4A392E]/70">
                {text('home.newsletter.subtitle', 'Join our community and never miss important updates, stories and Wari moments.')}
              </p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={text('home.newsletter.placeholder', 'Enter your email')}
                aria-label="Email address"
                className="flex-1 md:w-64 px-4 py-3 rounded-lg border border-[#E8D9C3] bg-white text-sm text-[#2B1B12] placeholder-[#4A392E]/40 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40"
              />
              <button
                type="submit"
                className="bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors text-sm"
              >
                {text('home.newsletter.button', 'Join')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
