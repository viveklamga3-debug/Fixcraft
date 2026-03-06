import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Wrench, ArrowRight, Smartphone, Shirt, Bike, Hammer, Zap } from 'lucide-react';
import { Category, Guide } from './types';
import { GuideCard } from './components/GuideCard';
import { DiagnosticTool } from './components/DiagnosticTool';
import { AdSlot } from './components/AdSlot';

const ICON_MAP: Record<string, any> = {
  Cpu: Smartphone,
  Shirt: Shirt,
  Table: Hammer,
  Zap: Zap,
  Bike: Bike
};

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredGuides, setFeaturedGuides] = useState<Guide[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Guide[]>([]);
  const [activeDiagnostic, setActiveDiagnostic] = useState<Category | null>(null);
  const [view, setView] = useState<'home' | 'guide' | 'results'>('home');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [resultsTitle, setResultsTitle] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchFeatured();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const fetchFeatured = async () => {
    try {
      const res = await fetch('/api/guides');
      const data = await res.json();
      setFeaturedGuides(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (err) {
      console.error('Failed to fetch featured guides:', err);
      setFeaturedGuides([]);
    }
  };

  const fetchGuide = async (id: string) => {
    try {
      const res = await fetch(`/api/guides/${id}`);
      if (!res.ok) throw new Error('Guide not found');
      const data = await res.json();
      setSelectedGuide(data);
      setView('guide');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Failed to fetch guide:', err);
      setView('home');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      const res = await fetch(`/api/guides?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
      setResultsTitle(`Search Results for "${searchQuery}"`);
      setView('results');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
      setView('results');
    }
  };

  const handleCategoryClick = async (category: Category) => {
    try {
      const res = await fetch(`/api/guides?category=${category.id}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
      setResultsTitle(`${category.name} Repair Guides`);
      setView('results');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Category fetch failed:', err);
      setSearchResults([]);
      setView('results');
    }
  };

  return (
    <div className="min-h-screen industrial-grid selection:bg-brand selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-industrial-950/80 backdrop-blur-md border-b border-industrial-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <button onClick={() => setView('home')} className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand flex items-center justify-center rounded-lg transform -rotate-6 group-hover:rotate-0 transition-transform">
              <Wrench className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-2xl md:text-3xl font-display tracking-tighter text-white">FIX<span className="text-brand">CRAFT</span></span>
          </button>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => setView('home')} className="text-xs lg:text-sm uppercase tracking-widest font-bold hover:text-brand transition-colors">Home</button>
            <button onClick={() => setView('home')} className="text-xs lg:text-sm uppercase tracking-widest font-bold hover:text-brand transition-colors">Categories</button>
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search repairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-industrial-900 border border-industrial-700 rounded-full py-2 pl-10 pr-4 w-full focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all text-xs md:text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-industrial-500 w-4 h-4" />
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {view === 'home' && (
          <>
            {/* Hero */}
            <section className="mb-16 md:mb-24 text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl sm:text-7xl md:text-9xl mb-6 leading-tight md:leading-none">
                  DON'T TOSS IT.<br />
                  <span className="text-brand">FIX IT.</span>
                </h1>
                <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 md:mb-12 px-4">
                  Join the repair revolution. Access thousands of free, expert-verified DIY guides for everything from smartphones to sneakers.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
                  <button 
                    onClick={() => document.getElementById('diagnostic')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-brand hover:bg-brand/90 text-white px-8 md:px-10 py-4 md:py-5 rounded-lg font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-brand/20"
                  >
                    Start a Repair
                  </button>
                  <button 
                    onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-industrial-800 hover:bg-industrial-700 text-white px-8 md:px-10 py-4 md:py-5 rounded-lg font-bold uppercase tracking-widest border border-industrial-700 transition-all"
                  >
                    Browse Categories
                  </button>
                </div>
              </motion.div>
            </section>

            {/* Diagnostic CTA */}
            <section id="diagnostic" className="mb-24 scroll-mt-24">
              <div className="bg-linear-to-r from-industrial-900 to-industrial-800 border border-industrial-700 rounded-3xl p-8 md:p-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-brand/5 skew-x-12 transform translate-x-32" />
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/20 text-brand rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-brand/30">
                      Smart Diagnostic
                    </div>
                    <h2 className="text-5xl mb-6">Not sure what's broken?</h2>
                    <p className="text-gray-400 text-lg mb-8">
                      Our interactive diagnostic tool helps you identify the exact issue in 3 simple steps. Just answer a few questions about your device's behavior.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {(Array.isArray(categories) ? categories : []).slice(0, 3).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveDiagnostic(cat)}
                          className="px-6 py-3 bg-industrial-700 hover:bg-brand hover:text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                          {cat.name} <ArrowRight size={16} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:block relative">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-industrial-950 p-8 rounded-2xl border border-industrial-700 shadow-2xl relative z-10"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center">
                          <Wrench className="text-brand" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-industrial-500">Step 1 of 3</div>
                          <div className="font-bold">Identifying Issue...</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-12 bg-industrial-800 rounded-lg border border-industrial-700" />
                        <div className="h-12 bg-industrial-800 rounded-lg border border-industrial-700" />
                        <div className="h-12 bg-brand/20 rounded-lg border border-brand/50" />
                      </div>
                    </motion.div>
                    <div className="absolute -bottom-4 -right-4 w-full h-full bg-brand/10 rounded-2xl -z-10" />
                  </div>
                </div>
              </div>
            </section>

            {/* Categories */}
            <section id="categories" className="mb-24 scroll-mt-24">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl mb-2">Browse by Category</h2>
                  <p className="text-industrial-500">Find the right tools for the job.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {(Array.isArray(categories) ? categories : []).map((cat) => {
                  const Icon = ICON_MAP[cat.icon] || Hammer;
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      whileHover={{ scale: 1.05 }}
                      className="bg-industrial-900 border border-industrial-700 p-8 rounded-2xl text-center group hover:border-brand transition-all"
                    >
                      <div className="w-16 h-16 bg-industrial-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
                        <Icon size={32} />
                      </div>
                      <h3 className="text-xl mb-2">{cat.name}</h3>
                      <p className="text-[10px] text-industrial-500 uppercase tracking-widest">{cat.description}</p>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            <AdSlot position="top" />

            {/* Featured Guides */}
            <section className="mb-24">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl mb-2">Popular Repairs</h2>
                  <p className="text-industrial-500">Most viewed guides this week.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {(Array.isArray(featuredGuides) ? featuredGuides : []).map(guide => (
                  <div key={guide.id} onClick={() => fetchGuide(guide.id)} className="cursor-pointer">
                    <GuideCard guide={guide} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'results' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button onClick={() => setView('home')} className="inline-flex items-center gap-2 text-industrial-500 hover:text-brand mb-8 transition-colors uppercase text-xs font-bold tracking-widest">
              ← Back to Home
            </button>
            <h1 className="text-5xl mb-12">{resultsTitle}</h1>
            {(Array.isArray(searchResults) ? searchResults : []).length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {(Array.isArray(searchResults) ? searchResults : []).map(guide => (
                  <div key={guide.id} onClick={() => fetchGuide(guide.id)} className="cursor-pointer">
                    <GuideCard guide={guide} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-industrial-900 border border-industrial-700 rounded-3xl">
                <Search size={48} className="mx-auto mb-6 text-industrial-700" />
                <h3 className="text-2xl mb-2">No guides found</h3>
                <p className="text-industrial-500">Try searching for something else or browse categories.</p>
              </div>
            )}
            <AdSlot position="bottom" />
          </motion.div>
        )}

        {view === 'guide' && selectedGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid lg:grid-cols-3 gap-8 md:gap-12"
          >
            <div className="lg:col-span-2">
              <button onClick={() => setView('home')} className="inline-flex items-center gap-2 text-industrial-500 hover:text-brand mb-6 md:mb-8 transition-colors uppercase text-[10px] md:text-xs font-bold tracking-widest">
                ← Back to Home
              </button>
              
              <h1 className="text-4xl sm:text-6xl md:text-8xl mb-4 md:mb-6 leading-tight">{selectedGuide.title}</h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-12">{selectedGuide.summary}</p>

              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12 p-4 md:p-6 bg-industrial-900 border border-industrial-700 rounded-2xl">
                <div className="text-center border-r border-industrial-800">
                  <div className="text-industrial-500 text-[8px] md:text-[10px] uppercase tracking-widest mb-1">Difficulty</div>
                  <div className="font-bold text-brand text-xs md:text-base">{selectedGuide.difficulty}</div>
                </div>
                <div className="text-center border-r border-industrial-800">
                  <div className="text-industrial-500 text-[8px] md:text-[10px] uppercase tracking-widest mb-1">Time</div>
                  <div className="font-bold text-white text-xs md:text-base">{selectedGuide.time_estimate}</div>
                </div>
                <div className="text-center">
                  <div className="text-industrial-500 text-[8px] md:text-[10px] uppercase tracking-widest mb-1">Cost</div>
                  <div className="font-bold text-white text-xs md:text-base">{selectedGuide.cost_estimate}</div>
                </div>
              </div>

              <img
                src={selectedGuide.image_url}
                alt={selectedGuide.title}
                className="w-full h-[250px] sm:h-[400px] object-cover rounded-2xl md:rounded-3xl mb-8 md:mb-12 border border-industrial-700"
                referrerPolicy="no-referrer"
              />

              <div className="space-y-8 md:space-y-12">
                <h2 className="text-3xl md:text-4xl border-b border-industrial-800 pb-4">Step-by-Step Instructions</h2>
                {selectedGuide.steps?.map((step, idx) => (
                  <div key={step.id} className="flex gap-4 md:gap-8 relative">
                    <div className="flex-none">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-industrial-800 border-2 border-brand text-brand rounded-full flex items-center justify-center font-display text-xl md:text-2xl">
                        {idx + 1}
                      </div>
                      {idx < (selectedGuide.steps?.length || 0) - 1 && (
                        <div className="w-0.5 h-full bg-industrial-800 absolute left-5 md:left-6 top-10 md:top-12 -z-10" />
                      )}
                    </div>
                    <div className="pb-8 md:pb-12">
                      <h3 className="text-xl md:text-2xl mb-3 md:mb-4 text-white">{step.title}</h3>
                      <p className="text-gray-400 leading-relaxed text-base md:text-lg">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-8">
              <div className="bg-industrial-900 border border-industrial-700 p-6 md:p-8 rounded-2xl lg:sticky lg:top-32">
                <h3 className="text-xl md:text-2xl mb-6">Tools Needed</h3>
                <ul className="space-y-3 md:space-y-4 mb-8">
                  {['Precision Screwdriver Set', 'Opening Picks', 'Tweezers', 'Spudger'].map(tool => (
                    <li key={tool} className="flex items-center gap-3 text-gray-400 text-sm md:text-base">
                      <div className="w-1.5 h-1.5 bg-brand rounded-full shrink-0" />
                      {tool}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-brand text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition-all text-sm md:text-base">
                  Buy Repair Kit
                </button>
              </div>
              <AdSlot position="sidebar" />
            </aside>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-industrial-950 border-t border-industrial-800 py-24 mt-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-brand flex items-center justify-center rounded-lg transform -rotate-6">
                <Wrench className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-display tracking-tighter text-white">FIX<span className="text-brand">CRAFT</span></span>
            </a>
            <p className="text-industrial-500 max-w-sm mb-8">
              FixCraft is a global community of repair enthusiasts. We believe that everyone should have the right to repair their own things.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 bg-industrial-900 border border-industrial-700 rounded-lg flex items-center justify-center hover:border-brand transition-colors cursor-pointer">
                  <div className="w-4 h-4 bg-industrial-600 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-8">Resources</h4>
            <ul className="space-y-4 text-industrial-500 text-sm">
              <li><a href="#" className="hover:text-brand transition-colors">Repair Guides</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Diagnostic Tool</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Parts Store</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Safety Info</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-8">Company</h4>
            <ul className="space-y-4 text-industrial-500 text-sm">
              <li><a href="#" className="hover:text-brand transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Manifesto</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-industrial-900 text-center text-industrial-600 text-[10px] uppercase tracking-[0.2em]">
          © 2026 FixCraft Repair Culture Hub. All Rights Reserved.
        </div>
      </footer>

      {/* Diagnostic Modal */}
      <AnimatePresence>
        {activeDiagnostic && (
          <DiagnosticTool
            category={activeDiagnostic}
            onClose={() => setActiveDiagnostic(null)}
            onSelectGuide={(id) => {
              setActiveDiagnostic(null);
              fetchGuide(id);
            }}
            onSelectCategory={(cat) => {
              setActiveDiagnostic(null);
              handleCategoryClick(cat);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
