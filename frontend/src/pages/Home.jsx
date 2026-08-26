import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiShare2, FiShield, FiGlobe, FiPlay, FiArrowRight } from 'react-icons/fi';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Home = () => {
  const pillars = [
    { icon: FiBook, title: 'Discover', desc: 'Traditions, stories and hidden wisdom' },
    { icon: FiUsers, title: 'Learn', desc: 'From saints, scholars and Warkaris' },
    { icon: FiShare2, title: 'Share', desc: 'Your experiences, knowledge and seva' },
    { icon: FiShield, title: 'Preserve', desc: 'Authentic heritage for generations' },
    { icon: FiGlobe, title: 'Connect', desc: 'A global community of Warkari devotees' },
  ];

  const experience = [
    { title: 'Palkhis', desc: 'Follow the sacred palanquin processions and their routes.', img: '/images/palkhis.jpg' },
    { title: 'Abhangs & Kirtan', desc: 'Listen, read and feel the divine words of the saints.', img: '/images/abhangs.jpg' },
    { title: 'Manuscripts', desc: 'Rare texts and ancient wisdom preserved for all.', img: '/images/manuscripts.jpg' },
    { title: 'Holy Places', desc: 'Explore sacred locations connected to Wari.', img: '/images/holy-places.jpg' },
    { title: 'Seva & Samaj', desc: 'The stories of selfless service that keeps Wari alive.', img: '/images/seva.jpg' },
  ];

  const stats = [
    { value: '500+', label: 'Authentic Stories' },
    { value: '200+', label: 'Palkhi Routes' },
    { value: '1000+', label: 'Warkari Contributors' },
    { value: '50K+', label: 'Global Devotees' },
  ];

  return (
    <div className="bg-[#FBF5EC]">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-temple.jpg"
            alt="Wari heritage temple at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FBF5EC] via-[#FBF5EC]/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 md:py-32">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2B1B12] leading-tight mb-6">
            Walk the path.<br />
            Live the <span className="text-[#DD6B35]">legacy.</span>
          </h1>
          <p className="text-lg text-[#4A392E]/80 max-w-md mb-8">
            Aapli Wari is a digital home for the living heritage of Pandharpur Wari.
            Discover. Learn. Share. Preserve.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              variant="primary"
              size="lg"
              className="bg-[#DD6B35] hover:bg-[#C85A28] text-white shadow-lg flex items-center gap-2"
            >
              Explore the Wari <FiArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/80 border border-[#DD6B35]/30 text-[#2B1B12] hover:bg-white"
            >
              Ask Aapli Wari AI ✳
            </Button>
          </div>
          <button className="flex items-center gap-2 text-sm text-[#4A392E]/70 hover:text-[#DD6B35] transition">
            <span className="w-8 h-8 rounded-full border border-[#4A392E]/30 flex items-center justify-center">
              <FiPlay className="text-xs ml-0.5" />
            </span>
            Watch the journey in 90 seconds
          </button>
        </div>
      </section>

      {/* Five Pillars Strip */}
      <section className="bg-[#F5EADA] border-y border-[#E8D9C3]">
        <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
          {pillars.map((item, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-white text-[#DD6B35] mb-3 shadow-sm">
                <item.icon className="text-2xl" />
              </div>
              <h3 className="font-serif font-bold text-[#2B1B12] mb-1">{item.title}</h3>
              <p className="text-xs text-[#4A392E]/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wari Experience */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[#DD6B35] text-sm font-semibold mb-3">
              ⟿ THE WARI EXPERIENCE ⟿
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2B1B12]">
              More than a journey,<br />it's a <span className="text-[#DD6B35]">way of life</span>.
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm text-[#4A392E]/70 mb-4">
              From the abhangs of saints to the footsteps of millions, explore every aspect of Wari in one unified platform.
            </p>
            <Button variant="outline" className="border border-[#2B1B12]/20 text-[#2B1B12] flex items-center gap-2">
              Start Exploring <FiArrowRight />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {experience.map((item, index) => (
            <Card key={index} className="group p-0 overflow-hidden border border-[#E8D9C3] hover:shadow-xl transition-all">
              <div className="h-32 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-serif font-bold text-[#2B1B12] mb-1">{item.title}</h3>
                <p className="text-xs text-[#4A392E]/70 leading-relaxed mb-2">{item.desc}</p>
                <FiArrowRight className="text-[#DD6B35]" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Stats Band */}
      <section className="max-w-7xl mx-auto px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#3A2417] to-[#2B1810] text-white p-10 md:p-14 grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
          {stats.map((s, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="text-3xl font-serif font-bold text-[#E8A15C]">{s.value}</div>
              <div className="text-xs text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <p className="text-lg font-serif">One Heritage.</p>
            <p className="text-lg font-serif text-[#E8A15C]">One Family.</p>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="rounded-3xl bg-[#F5EADA] border border-[#E8D9C3] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-[#2B1B12] mb-1">Be a part of the movement.</h3>
            <p className="text-sm text-[#4A392E]/70">Join our community and never miss important updates, stories and Wari moments.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-64 px-4 py-3 rounded-lg border border-[#E8D9C3] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40"
            />
            <Button variant="primary" className="bg-[#DD6B35] hover:bg-[#C85A28] text-white flex items-center gap-2 whitespace-nowrap">
              Join Now <FiArrowRight />
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;