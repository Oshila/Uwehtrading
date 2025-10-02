'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/autoplay'
import { Autoplay } from 'swiper/modules'
import { TrendingUp, Zap, Users } from 'lucide-react'

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const sliderImages = Array.from({ length: 14 }, (_, i) => `/profits/sample${i + 1}.jpg`)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <header className="p-6 border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-[#0f172a]/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 group">
            <img src="/uweh-logo.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Uwehs Trade HUB</h1>
          </div>

         {/* NAVBAR LINKS */}
<nav className="hidden md:flex space-x-4 items-center">
  <a href="#features" className="hover:text-blue-400 transition-colors duration-300 relative group">
    Features
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
  </a>
  <a href="#free" className="hover:text-blue-400 transition-colors duration-300 relative group">
    Free Offers
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
  </a>
  <a href="#pricing" className="hover:text-blue-400 transition-colors duration-300 relative group">
    Pricing
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
  </a>
  <a href="#profits" className="hover:text-blue-400 transition-colors duration-300 relative group">
    Trade Setups
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
  </a>
  <a href="/account-management-public" className="hover:text-blue-400 transition-colors duration-300 relative group">
    Account Management
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
  </a>
  <a href="/login" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">Login</a>
</nav>


          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-4 px-4 space-y-3 animate-fadeIn">
            <a href="#features" className="block hover:text-blue-400 transition-colors">Features</a>
            <a href="#pricing" className="block hover:text-blue-400 transition-colors">Pricing</a>
            <a href="#free" className="block hover:text-blue-400 transition-colors">Free Offers</a>
            <a href="#profits" className="block hover:text-blue-400 transition-colors">Trade Setups</a>
            <a href="/account-management-public" className="block hover:text-blue-400 transition-colors">Account Management</a>
            <a href="/login" className="block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl w-max hover:shadow-lg transition-all">Login</a>
          </div>
        )}
      </header>

      {/* Hero Section with Parallax Effect */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto relative" style={{transform: `translateY(${scrollY * 0.1}px)`}}>
        <div className="animate-fadeInUp">
          <div className="inline-block mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium animate-pulse">
              <Zap className="w-4 h-4" />
              Live Trading Signals
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Trade Smarter.
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Earn Better.
            </span>
          </h2>
          
          <p className="text-xl text-white/70 mb-10 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            Join a trusted space where you grow with every trade — reliable signals, clear pricing, and real results.
          </p>
          
          <div className="flex gap-4 justify-center items-center animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <a href="/register" className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 overflow-hidden">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            
            <a href="#features" className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white/20 hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-300 hover:scale-105">
              Learn More
            </a>
          </div>
        </div>

        {/* Floating stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:bg-white/10">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-white/60">Win Rate</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:bg-white/10">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold">5000+</div>
            <div className="text-sm text-white/60">Active Traders</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:bg-white/10">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">Daily</div>
            <div className="text-sm text-white/60">Signals</div>
          </div>
        </div>
      </section>

            {/* Free Features Section */}
      <section id="free" className="py-20 bg-gradient-to-r from-blue-900 to-cyan-900 text-white px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Free for the Rest of {new Date().getFullYear()}
          </h2>
          <p className="text-lg text-white/70 mb-12">
            To celebrate our community, enjoy free access to signals and mentorship for the rest of this year!
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Signals */}
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Free Signals</h3>
              <p className="mb-6 text-white/70">
                Get daily trading signals directly from Uweh — available both on Telegram and within your dashboard.
              </p>
              <a 
                href="/login" 
                className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all"
              >
                Access Free Signals
              </a>
            </div>

            {/* Free Mentorship */}
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold mb-3 text-purple-300">Free Mentorship</h3>
              <p className="mb-6 text-white/70">
                Join our weekly mentorship sessions on Zoom — learn strategy, psychology, and real trading skills.
              </p>
              <a 
                href="login" 
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all"
              >
                Join Mentorship
              </a>
            </div>
          </div>
        </div>
      </section>


            <section id="features" className="py-20 bg-white text-black">
           <h2 className="text-4xl font-bold mb-6">About us</h2>   
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          {[
            { title: 'Private Signal Room', desc: 'Only your paid subscribers can access premium trading calls securely.' },
            { title: 'Telegram Push Updates', desc: 'Instantly deliver accurate and timely alerts to all your clients via Telegram.' },
            { title: 'Designed for Traders', desc: 'Built with you in mind — clean layout, fast performance, and intuitive flows for seamless trading support.' }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-105 hover:border-blue-300 transition-all duration-300 group animate-fadeInUp" style={{animationDelay: `${i * 0.1}s`}}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4 group-hover:rotate-6 transition-transform duration-300"></div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Telegram Section with 3D Effect */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="animate-fadeInUp">
            <div className="inline-block mb-6 relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 animate-pulse"></div>
              <svg className="w-16 h-16 mx-auto relative" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.03-.73 4.04-1.76 6.73-2.92 8.08-3.49 3.85-1.62 4.65-1.9 5.17-1.91.11 0 .37.03.54.17.14.12.18.28.2.46-.01.06.01.24 0 .38z"/>
              </svg>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Join Our Free Telegram Channel
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Get free trading signals and updates daily. Our Telegram community helps you stay ahead with the market.
            </p>
            
            <a
              href="https://t.me/milkingwithuwehs"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden"
            >
              <span className="relative z-10">Join Telegram</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>

            <div className="mt-8 flex justify-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Real-time Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Active Community</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      <section id="profits" className="py-20 bg-gray-900 text-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Our Trade Setups, Profits & Testimonials</h2>
          <Swiper
            slidesPerView={'auto'}
            spaceBetween={20}
            loop
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            modules={[Autoplay]}
            className="w-full"
          >
            {sliderImages.map((src, index) => (
              <SwiperSlide key={index} className="!w-auto">
                <img
                  src={src}
                  alt={`Sample ${index + 1}`}
                  className="h-56 md:h-64 rounded-xl object-cover hover:scale-105 hover:shadow-2xl transition-all duration-300"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="py-20 px-6 bg-white text-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Why Choose UwehsTradeHub?</h2>
          <ul className="space-y-4 text-left max-w-md mx-auto text-lg">
            {[
              'Consistent Daily Signals from Market Experts',
              'Transparent Trade History and Updates',
              'Strong Community with Real-Time Support'
            ].map((item, i) => (
              <li key={i} className="flex items-start group hover:translate-x-2 transition-transform duration-300">
                <span className="text-green-600 font-bold text-xl mr-2 group-hover:scale-125 transition-transform">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 text-gray-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4">1-on-1 Mentorship</h2>
            <p className="text-lg text-gray-700 mb-4">
              Ready to level up your trading journey? Work directly with UwehFX to master strategy, psychology, and consistent profits.
            </p>
            <a href="https://t.me/UWEHFX" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Apply Now
            </a>
          </div>
          <div className="flex justify-center">
            <img
              src="/acc-manage.jpg"
              alt="Mentorship"
              className="rounded-2xl shadow-lg max-h-80 object-cover hover:scale-105 hover:shadow-2xl transition-all duration-300"
            />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-6 bg-white text-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-blue-800">Choose Your Plan</h2>
          <p className="text-gray-600 mb-12">Flexible pricing for every trader. Upgrade anytime.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Bronze', price: '$15 / 2 Weeks', benefits: ['Access to VIP Signal Room', 'Telegram Notifications'], accent: 'from-orange-400 to-orange-600' },
              { title: 'Silver', price: '$30 / 1 Month', benefits: ['Everything in Bronze', 'Priority Entry Signals'], accent: 'from-gray-400 to-gray-600' },
              { title: 'Gold', price: '$60 / 2 Months', benefits: ['All Silver Features', 'Weekly Market Breakdown'], accent: 'from-yellow-400 to-yellow-600' },
              { title: 'Platinum', price: '$360 / 1 Year', benefits: ['Everything Unlocked', '1-on-1 Strategy Session', 'Lifetime Chart Templates'], accent: 'from-purple-400 to-purple-600' },
            ].map(({ title, price, benefits, accent }, i) => (
              <div key={title} className="p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group animate-fadeInUp" style={{animationDelay: `${i * 0.1}s`}}>
                <div className={`w-12 h-1 bg-gradient-to-r ${accent} mx-auto mb-4 group-hover:w-full transition-all duration-300`}></div>
                <h3 className="text-xl font-bold text-blue-700">{title}</h3>
                <p className="my-2 text-lg font-semibold">{price}</p>
                <ul className="text-sm text-gray-700 mb-4 space-y-1">
                  {benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <a href="/login" className="bg-blue-600 text-white w-full py-2 rounded-xl hover:bg-blue-700 transition-all duration-300 block text-center hover:shadow-lg">Subscribe</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-blue-950 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Uwehs Trade HUB</h3>
            <p className="text-sm text-white/70">Empowering traders through education, signals, and community. Impossible Is Absolutely Nothing...</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Contact</h4>
            <p>Email: <a href="mailto:Uwehstradehub@gmail.com" className="underline hover:text-blue-400 transition-colors">Uwehstradehub@gmail.com</a></p>
            <p>Phone: +2347049507442</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
            <div className="space-x-4">
              <a href="https://t.me/milkingwithuwehs" target="_blank" className="hover:text-blue-400 transition-colors">Telegram</a>
              <a href="https://www.instagram.com/uwehstradehub?igsh=MTgxcTNmcjVxMGNreg==" target="_blank" className="hover:text-blue-400 transition-colors">Instagram</a>
              <a href="https://x.com/uwehstradehub?s=21" target="_blank" className="hover:text-blue-400 transition-colors">X (Twitter)</a>
            </div>
          </div>
        </div>
        <div className="text-center text-white/50 text-sm mt-10">
          © {new Date().getFullYear()} UwehsTradeHub. All rights reserved.
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}