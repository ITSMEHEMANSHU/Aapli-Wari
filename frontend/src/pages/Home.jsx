import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiPlay, FiChevronLeft, FiChevronRight,
  FiBook, FiUsers, FiShare2, FiShield, FiGlobe, FiVideo,
  FiMapPin, FiRadio, FiCpu, FiHeart
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

import { IMAGES, heroImage, cardImage } from '../utils/cloudinary';

/* ─────────────────────────────────────────────────────────────────────────────
 * CONFIG & STATIC DATA
 * ─────────────────────────────────────────────────────────────────────────────
 */
const HERO_TYPE = 'image'; // ← 'image' | 'video'
const HERO_VIDEO_URL = 'https://res.cloudinary.com/dqrqcnlpx/video/upload/your-video-id.mp4';

/* ── Section 2: Carousel Content Data ── */
const carouselSlides = [
  {
    category: 'Live Tracking',
    title: 'Live Map',
    subtitle: 'Track Palkhi route',
    description: 'Track the real-time coordinates, daily stopovers, and live movement of Sant Tukaram Maharaj and Sant Dnyaneshwar Maharaj Palkhis.',
    buttonText: 'View Live Route',
    link: '/explore?type=map',
    icon: FiMapPin,
    bgColor: 'bg-amber-100',
    iconColor: 'text-[#E87A1E]',
    imageKey: IMAGES.palkhis
  },
  {
    category: 'Devotional Broadcasts',
    title: 'Channels',
    subtitle: 'Dindi broadcasts',
    description: 'Listen to non-stop live audio broadcasts, soulful kirtans, and abhangs streamed straight from active Dindi groups.',
    buttonText: 'Tune In Now',
    link: '/channels',
    icon: FiRadio,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-700',
    imageKey: IMAGES.abhangs
  },
  {
    category: 'Virtual Guide',
    title: 'AI Assistant',
    subtitle: '24/7 Route help',
    description: 'Get instant answers for schedule updates, accommodation options, emergency contacts, or historical significance.',
    buttonText: 'Ask AI Assistant',
    link: '/ai-assistant',
    icon: FiCpu,
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    imageKey: IMAGES.holyPlaces
  },
  {
    category: 'Digital Seva',
    title: 'Contribute',
    subtitle: 'Share your Seva',
    description: 'Participate in community service initiatives by offering meal points, medical support, or sharing voluntary efforts.',
    buttonText: 'Share Your Seva',
    link: '/contribute',
    icon: FiHeart,
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600',
    imageKey: IMAGES.seva
  }
];

const pillars = [
  { icon: FiBook,   title: 'Discover',  desc: 'Traditions, stories and hidden wisdom' },
  { icon: FiUsers,  title: 'Learn',     desc: 'From saints, scholars and Warkaris' },
  { icon: FiShare2, title: 'Share',     desc: 'Your experiences, knowledge and seva' },
  { icon: FiShield, title: 'Preserve',  desc: 'Authentic heritage for generations' },
  { icon: FiGlobe,  title: 'Connect',   desc: 'A global community of Warkari devotees' },
];

const experience = [
  { title: 'Palkhis',         desc: 'Follow the sacred palanquin processions and their routes.', imageKey: IMAGES.palkhis,    to: '/explore?type=palkhis' },
  { title: 'Abhangs & Kirtan', desc: 'Listen, read and feel the divine words of the saints.',  imageKey: IMAGES.abhangs,    to: '/explore?type=abhangs' },
  { title: 'Manuscripts',     desc: 'Rare texts and ancient wisdom preserved for all.',          imageKey: IMAGES.manuscripts, to: '/explore?type=manuscripts' },
  { title: 'Holy Places',    desc: 'Explore sacred locations connected to Wari.',               imageKey: IMAGES.holyPlaces,  to: '/explore?type=holy-places' },
  { title: 'Seva & Samaj',   desc: 'The stories of selfless service that keeps Wari alive.',   imageKey: IMAGES.seva,        to: '/explore?type=seva' },
];

const shorts = [
  { title: 'Ringan Sohala at Indapur 🚩', views: '125K views', imageKey: IMAGES.palkhis, to: '/shorts/1' },
  { title: 'Mauli Palkhi Departure Moments ✨', views: '98K views', imageKey: IMAGES.holyPlaces, to: '/shorts/2' },
  { title: 'Soulful Abhang in Midnight Kirtan 🎶', views: '210K views', imageKey: IMAGES.abhangs, to: '/shorts/3' },
  { title: 'The Seva of Free Meals (Annadaan) 🍲', views: '75K views', imageKey: IMAGES.seva, to: '/shorts/4' },
  { title: 'Ancient Manuscripts Preserved 📜', views: '45K views', imageKey: IMAGES.manuscripts, to: '/shorts/5' },
];

const stats = [
  { value: '500+',  label: 'Authentic Stories' },
  { value: '200+',  label: 'Palkhi Routes' },
  { value: '1000+', label: 'Warkari Contributors' },
  { value: '50K+',  label: 'Global Devotees' },
];

/* ── Component ───────────────────────────────────────────────────────────── */

export const Home = () => {
  const [email, setEmail] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);

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

  return (
    <div className="w-full bg-[#FDF8F0] font-['Poppins',sans-serif] antialiased selection:bg-[#E87A1E] selection:text-white">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#1E110A] text-white">
        <div className="absolute inset-0 z-0">
          {HERO_TYPE === 'video' ? (
            <video
              src={HERO_VIDEO_URL}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover object-center"
            />
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
                आषाढी वारी — The Digital Heritage Portal
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6 drop-shadow-md tracking-tight">
              Walk the path.<br />
              Live the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-400 to-[#E87A1E]">legacy.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/85 max-w-lg mb-8 leading-relaxed font-light">
              Aapli Wari is a digital sanctuary preserving the living heritage of Pandharpur Wari. Discover abhangs, track live processions, and connect with millions.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link to="/explore">
                <button className="inline-flex items-center gap-2.5 bg-[#E87A1E] hover:bg-[#C8521A] text-white font-bold px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 text-sm sm:text-base active:scale-95 cursor-pointer">
                  Explore Wari <FiArrowRight className="text-lg" />
                </button>
              </Link>
              <Link to="/ai-assistant">
                <button className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold px-7 py-3.5 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 text-sm sm:text-base active:scale-95 cursor-pointer">
                  <HiSparkles className="text-amber-300" /> Ask Aapli Wari AI
                </button>
              </Link>
            </div>

            <button className="inline-flex items-center gap-3 text-xs sm:text-sm text-white/80 hover:text-white transition-colors group cursor-pointer">
              <span className="w-9 h-9 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-[#E87A1E] group-hover:border-[#E87A1E] transition-all duration-300 shadow-md">
                <FiPlay size={12} className="ml-0.5 fill-current text-white" />
              </span>
              <span className="font-medium tracking-wide">Watch the journey in 90 seconds</span>
            </button>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          2. FIVE PILLARS STRIP
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F9F1E5] border-b border-[#E8D9C3]/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-4">
            {pillars.map((item, i) => (
              <div
                key={i}
                className={`group text-center flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 bg-white/80 hover:shadow-xs ${
                  i < pillars.length - 1 ? 'md:border-r border-[#E8D9C3]/60' : ''
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


      {/* ══════════════════════════════════════════════════════════════════════
          3. FEATURED CAROUSEL (FULL-WIDTH BOTTOM BORDER)
      ══════════════════════════════════════════════════════════════════════ */}
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

    {/* Updated Navigation Grid with static #F7ECC1 background for icons */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      {carouselSlides.map((slide, idx) => {
        const Icon = slide.icon;
        const isActive = currentSlide === idx;
        return (
          <button
            key={idx}
            onClick={() => changeSlide(idx)}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3.5 cursor-pointer ${
              isActive
                ? 'bg-white border-[#E87A1E] shadow-md -translate-y-0.5'
                : 'bg-white/70 border-[#E8D9C3] hover:bg-white hover:border-[#E87A1E]/50'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl bg-[#F7ECC1] ${slide.iconColor} flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div className="overflow-hidden">
              <div className={`font-bold text-xs sm:text-sm truncate ${isActive ? 'text-[#E87A1E]' : 'text-[#2D1B0E]'}`}>
                {slide.title}
              </div>
              <div className="text-[11px] text-[#5A4030]/80 truncate">
                {slide.subtitle}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
</section>


      {/* ══════════════════════════════════════════════════════════════════════
          4. WARI EXPERIENCE (ALT COLOR: #DDE3E9)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F9F1E5] py-16 border-b border-[#E8D9C3]/80 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 text-[#E87A1E] text-xs font-bold tracking-widest uppercase mb-2">
                ⟿ The Wari Experience
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1B0E] leading-tight">
                More than a journey,<br />
                it's a <span className="text-[#E87A1E] italic">way of life</span>.
              </h2>
            </div>
            <div className="md:max-w-xs">
              <p className="text-xs sm:text-sm text-[#5A4030] mb-4 leading-relaxed">
                From holy abhangs to real-time Palkhi schedules, experience the devotion in one place.
              </p>
              <Link to="/explore">
                <button className="inline-flex items-center gap-2 border border-[#E87A1E] text-[#E87A1E] hover:bg-[#E87A1E] hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 text-sm active:scale-95 cursor-pointer">
                  Start Exploring <FiArrowRight />
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {experience.map((item, i) => (
              <Link key={i} to={item.to} className="group block">
                <div className="h-full rounded-2xl overflow-hidden border border-[#E8D9C3] bg-white hover:border-[#E87A1E]/50 hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="h-44 overflow-hidden bg-[#F5EADA] relative">
                    <img
                      src={cardImage(item.imageKey)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[#2D1B0E] text-base mb-1.5 group-hover:text-[#E87A1E] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#5A4030]/80 leading-relaxed mb-4">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#E87A1E] group-hover:translate-x-1 transition-transform duration-200">
                      <span>Explore</span>
                      <FiArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          5. SHORTS SECTION (BASE COLOR)
      ══════════════════════════════════════════════════════════════════════ */}
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
              <Link key={i} to={short.to} className="group shrink-0 w-44 sm:w-auto block">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#E8D9C3] bg-[#2D1B0E] shadow-md hover:shadow-xl hover:border-[#E87A1E] hover:-translate-y-1.5 transition-all duration-300">
                  <img
                    src={cardImage(short.imageKey)}
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
                    <span className="text-[10px] text-white/70 font-medium">{short.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          6. STATS BAND (ALT COLOR: #DDE3E9)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F9F1E5] py-20 border-b border-[#E8D9C3]/80 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl bg-gradient-to-r from-[#E87A1E] via-[#C8521A] to-[#A23B19] px-8 sm:px-12 py-12 sm:py-16 shadow-xl relative overflow-hidden text-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center relative z-10">
              {stats.map((s, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-none mb-2">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-orange-100 font-medium tracking-wide">{s.label}</div>
                </div>
              ))}
              <div className="col-span-2 sm:col-span-1 text-center md:text-left border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-6">
                <p className="text-xl font-semibold text-white leading-snug">One Heritage.</p>
                <p className="text-xl font-semibold text-orange-200 leading-snug">One Family.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          7. NEWSLETTER CTA (BASE COLOR)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl bg-white border border-[#E8D9C3] shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-12 relative z-10">
              <div className="max-w-lg text-center lg:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-[#E87A1E] mb-2 block">Stay Connected</span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1B0E] mb-2">
                  Be a part of the movement.
                </h3>
                <p className="text-sm text-[#5A4030] leading-relaxed">
                  Join our community and receive authentic updates, live route alerts, and sacred Wari highlights.
                </p>
              </div>
              
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  className="w-full lg:w-72 px-5 py-3.5 rounded-xl border border-[#E8D9C3] bg-[#FDF8F0] text-sm text-[#2D1B0E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87A1E]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-[#E87A1E] hover:bg-[#C8521A] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 text-sm whitespace-nowrap shadow-md active:scale-95 cursor-pointer"
                >
                  Join Now <FiArrowRight />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;