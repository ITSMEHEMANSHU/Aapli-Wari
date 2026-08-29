import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiPlay,
  FiBook, FiUsers, FiShare2, FiShield, FiGlobe,
} from 'react-icons/fi';
import { IMAGES, heroImage, cardImage } from '../utils/cloudinary';
import { useLanguage } from '../context/LanguageContext';

/* ─────────────────────────────────────────────────────────────────────────────
 * HERO MEDIA CONFIG
 * Change HERO_TYPE to 'video' and set HERO_VIDEO_URL to use a video background.
 * Upload video in Cloudinary → Video tab → copy the direct .mp4 URL.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const HERO_TYPE = 'image'; // ← 'image' | 'video'
const HERO_VIDEO_URL = 'https://res.cloudinary.com/dqrqcnlpx/video/upload/your-video-id.mp4';

/* ── Static data ─────────────────────────────────────────────────────────── */

const pillars = [
  { icon: FiBook,   title: 'Discover',  desc: 'Traditions, stories and hidden wisdom' },
  { icon: FiUsers,  title: 'Learn',     desc: 'From saints, scholars and Warkaris' },
  { icon: FiShare2, title: 'Share',     desc: 'Your experiences, knowledge and seva' },
  { icon: FiShield, title: 'Preserve',  desc: 'Authentic heritage for generations' },
  { icon: FiGlobe,  title: 'Connect',   desc: 'A global community of Warkari devotees' },
];

const experience = [
  { title: 'Palkhis',        desc: 'Follow the sacred palanquin processions and their routes.', imageKey: IMAGES.palkhis,     to: '/explore?type=palkhis' },
  { title: 'Abhangs & Kirtan', desc: 'Listen, read and feel the divine words of the saints.',  imageKey: IMAGES.abhangs,     to: '/explore?type=abhangs' },
  { title: 'Manuscripts',    desc: 'Rare texts and ancient wisdom preserved for all.',          imageKey: IMAGES.manuscripts, to: '/explore?type=manuscripts' },
  { title: 'Holy Places',    desc: 'Explore sacred locations connected to Wari.',               imageKey: IMAGES.holyPlaces,  to: '/explore?type=holy-places' },
  { title: 'Seva & Samaj',   desc: 'The stories of selfless service that keeps Wari alive.',   imageKey: IMAGES.seva,        to: '/explore?type=seva' },
];

const stats = [
  { value: '500+',  label: 'Authentic Stories' },
  { value: '200+',  label: 'Palkhi Routes' },
  { value: '1000+', label: 'Warkari Contributors' },
  { value: '50K+',  label: 'Global Devotees' },
];

/* ── Component ───────────────────────────────────────────────────────────── */

const Home = () => {
  const [email, setEmail] = useState('');
  const { t, language } = useLanguage();

  const pillarTranslations = [
    { icon: FiBook, key: 'discover' },
    { icon: FiUsers, key: 'learn' },
    { icon: FiShare2, key: 'share' },
    { icon: FiShield, key: 'preserve' },
    { icon: FiGlobe, key: 'connect' },
  ];

  const translatedPillars = pillarTranslations.map(({ icon, key }) => ({
    icon,
    title: t(`home.pillars.${key}.title`),
    desc: t(`home.pillars.${key}.desc`),
  }));

  return (
    <div className="w-full">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO — full viewport, image or video background
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[calc(100vh-64px)] min-h-150 flex items-center overflow-hidden">

        {/* Media layer */}
        <div className="absolute inset-0">
          {HERO_TYPE === 'video' ? (
            <video
              src={HERO_VIDEO_URL}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={heroImage(IMAGES.hero)}
              alt="Pandharpur Wari — devotees walking towards the temple at sunset"
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
          )}
          {/* Left-side dark fade so text is readable; right side stays bright */}
          <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
        </div>

        {/* Text content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10">
          <div className="max-w-xl">
            <h1 className="text-5xl sm:text-6xl font-serif font-bold text-white leading-[1.1] mb-5">
              {t('home.heroTitleOne')}<br />
              {t('home.heroTitleTwo')} <span className="text-[#E8723A]">{t('home.heroTitleAccent')}</span>
            </h1>

            <p className="text-base sm:text-lg text-white/85 max-w-sm mb-8 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>

            <div className="flex flex-wrap gap-3 mb-7">
              <Link to="/explore">
                <button className="inline-flex items-center gap-2 bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-colors text-sm sm:text-base">
                  {t('home.exploreButton')} <FiArrowRight />
                </button>
              </Link>
              <Link to="/ai-assistant">
                <button className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#2B1B12] font-semibold px-6 py-3 rounded-full shadow-lg transition-colors text-sm sm:text-base">
                  {t('home.aiButton')} ✳
                </button>
              </Link>
            </div>

            <button className="inline-flex items-center gap-2.5 text-sm text-white/75 hover:text-white transition-colors group">
              <span className="w-8 h-8 rounded-full border border-white/40 bg-white/10 flex items-center justify-center group-hover:border-white transition-colors">
                <FiPlay size={11} className="ml-0.5" />
              </span>
              {t('home.watchJourney')}
            </button>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          2. FIVE PILLARS STRIP
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FBF5EC] border-y border-[#E8D9C3]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0">
            {translatedPillars.map((item, i) => (
              <div
                key={i}
                className={`text-center flex flex-col items-center gap-3 px-4 py-2
                  ${i < translatedPillars.length - 1 ? 'md:border-r border-[#E8D9C3]' : ''}`}
              >
                {/* Icon circle */}
                <div className="w-11 h-11 rounded-full border border-[#E8D9C3] bg-white text-[#DD6B35] flex items-center justify-center shadow-sm">
                  <item.icon size={20} />
                </div>
                {/* Dot separator */}
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-px bg-[#DD6B35]/40" />
                  <h3 className="font-bold text-[#2B1B12] text-sm tracking-wide">{item.title}</h3>
                  <div className="w-4 h-px bg-[#DD6B35]/40" />
                </div>
                <p className="text-xs text-[#4A392E]/60 leading-relaxed max-w-32">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          3. WARI EXPERIENCE — 5 cards
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[#DD6B35] text-xs font-semibold tracking-widest uppercase mb-3">
              ⟿ {t('home.experience.eyebrow')} ⟿
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2B1B12] leading-tight">
              {t('home.experience.titleOne')}<br />
              {t('home.experience.titleTwo')} <span className="text-[#DD6B35]">{t('home.experience.titleAccent')}</span>.
            </h2>
          </div>
          <div className="md:max-w-xs">
            <p className="text-sm text-[#4A392E]/70 mb-4 leading-relaxed">
              {t('home.experience.description')}
            </p>
            <Link to="/explore">
              <button className="inline-flex items-center gap-2 border border-[#2B1B12]/20 text-[#2B1B12] hover:bg-[#F5EADA] font-medium px-5 py-2.5 rounded-lg transition-colors text-sm">
                {t('home.experience.cta')} <FiArrowRight />
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {experience.map((item, i) => (
            <Link key={i} to={item.to} className="group block">
              <div className="rounded-2xl overflow-hidden border border-[#E8D9C3] bg-white hover:shadow-xl transition-all duration-300">
                <div className="h-28 sm:h-36 overflow-hidden bg-[#F5EADA]">
                  <img
                    src={cardImage(item.imageKey)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-bold text-[#2B1B12] text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#4A392E]/65 leading-relaxed mb-3">{item.desc}</p>
                  <FiArrowRight className="text-[#DD6B35] text-base" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          4. IMPACT STATS BAND
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-linear-to-br from-[#3D2518] to-[#2B1810] px-10 py-12 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center">
            {stats.map((s, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-3xl sm:text-4xl font-serif font-bold text-[#E8A15C] leading-none">{s.value}</div>
                <div className="text-xs text-white/60 mt-1.5">
                  {i === 0 ? t('home.stats.authenticStories') : i === 1 ? t('home.stats.palkhiRoutes') : i === 2 ? t('home.stats.contributors') : t('home.stats.devotees')}
                </div>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-1 text-center md:text-left">
              <p className="text-xl font-serif font-semibold text-white leading-snug">One Heritage.</p>
              <p className="text-xl font-serif font-semibold text-[#E8A15C] leading-snug">One Family.</p>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          5. NEWSLETTER CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-[#F5EADA] border border-[#E8D9C3]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 sm:p-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B1B12] mb-1">
                {t('home.newsletter.title')}
              </h3>
              <p className="text-sm text-[#4A392E]/70">
                {t('home.newsletter.subtitle')}
              </p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('home.newsletter.placeholder')}
                aria-label="Email address"
                className="flex-1 md:w-64 px-4 py-3 rounded-lg border border-[#E8D9C3] bg-white text-sm text-[#2B1B12] placeholder-[#4A392E]/40 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm whitespace-nowrap shadow-sm"
              >
                Join Now <FiArrowRight />
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
