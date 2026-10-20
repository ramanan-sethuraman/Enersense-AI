import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  Receipt,
  Cpu,
  Sparkles,
  TrendingUp,
  Leaf,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  HelpCircle,
  BarChart3,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Do I need smart meters or hardware installed in my house?',
      a: 'No! The initial version of Enersense AI works 100% in software without any additional hardware or electrician visits. You simply photograph your regular electricity meter display or enter readings manually.',
    },
    {
      q: 'How does Enersense AI calculate electricity bills?',
      a: 'Unlike generic calculators that multiply total units by a single average price, Enersense AI incorporates your state utility tariff (e.g., TANGEDCO, KSEB, BESCOM, APCPDCL, TGSPDCL, MSEDCL, BSES, UPPCL) using progressive slabs, fixed load charges, and state electricity duties.',
    },
    {
      q: 'Does the AI invent or fabricate savings predictions?',
      a: 'Never. Enersense AI enforces strict deterministic calculations. For example, if your air conditioner consumes an estimated 1.45 kW, reducing usage by 1 hour daily saves exactly 1.45 kW × 1 hr × 30 days = 43.5 kWh/month. Every estimate is explicitly cited.',
    },
    {
      q: 'What happens to my uploaded meter photographs?',
      a: 'Your meter photographs are processed in temporary server memory by the OCR engine to extract numeric digits and then deleted securely. We do not sell or share private household images.',
    },
    {
      q: 'Can Enersense AI connect with IoT smart meters in the future?',
      a: 'Yes. The backend architecture includes dedicated REST and MQTT schemas prepared for future smart electricity meters, ESP32 gateways, and current-transformer sensors.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-emerald-600/5 to-transparent blur-[120px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Intelligent Energy Efficiency & Bill Prediction
            </span>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Take Control of Your Electricity.{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
              Save Smarter with AI.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Turn your electricity readings into meaningful insights. Understand your energy consumption, estimate upcoming bills, and discover practical ways to save.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="hero"
                icon={<ArrowRight className="w-4 h-4 shrink-0" />}
                iconPosition="right"
                className="w-full sm:w-auto px-6 sm:px-8 font-semibold whitespace-nowrap"
              >
                Get Started Free
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="hero" className="w-full sm:w-auto px-6 sm:px-8 font-semibold whitespace-nowrap">
                Explore Features
              </Button>
            </a>
          </div>


          {/* HERO DASHBOARD PREVIEW MOCKUP */}
          <div className="pt-8 sm:pt-12 max-w-5xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-slate-200/60 to-slate-300/40 dark:from-neutral-950 dark:to-black border border-slate-300/60 dark:border-emerald-500/50 shadow-2xl backdrop-blur-xl dark:shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)]">
              <div className="bg-white dark:bg-black rounded-xl sm:rounded-2xl p-3.5 sm:p-6 text-left space-y-4 sm:space-y-6 border border-transparent dark:border-emerald-500/30">
                {/* Header mock */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-emerald-500/20">
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">Household Energy Dashboard Preview</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Tamil Nadu (TANGEDCO) • Domestic 200 Units Free Scheme</p>
                  </div>
                  <Badge variant="success" size="sm">
                    Verified Meter OCR Active
                  </Badge>
                </div>

                {/* 4 Cards Mock */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-black border border-emerald-500 dark:border-emerald-500 shadow-sm dark:shadow-[0_0_12px_-3px_rgba(16,185,129,0.2)] min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Current Period</span>
                    <p className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">245 kWh</p>
                    <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">↓ 12.4% vs peak</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-black border border-emerald-500 dark:border-emerald-500 shadow-sm dark:shadow-[0_0_12px_-3px_rgba(16,185,129,0.2)] min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Estimated Bill</span>
                    <p className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">₹212</p>
                    <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">200 Free Units Applied</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-black border border-emerald-500 dark:border-emerald-500 shadow-sm dark:shadow-[0_0_12px_-3px_rgba(16,185,129,0.2)] min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Top Consumer</span>
                    <p className="text-sm xs:text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">1.5 Ton AC</p>
                    <span className="text-[9px] sm:text-[10px] text-amber-600 font-semibold block truncate">41.2% of usage</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-black border border-emerald-500 dark:border-emerald-500 shadow-sm dark:shadow-[0_0_12px_-3px_rgba(16,185,129,0.2)] min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">AI Goal Progress</span>
                    <p className="text-lg xs:text-xl sm:text-2xl font-black text-emerald-600 mt-1 truncate">60% Done</p>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Target &lt; 220 kWh</span>
                  </div>
                </div>

                {/* Micro recommendation bar */}
                <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">
                      <strong>AI Tip:</strong> Operating Living Room AC at 24°C saves ~62.6 kWh (₹282/mo under TANGEDCO).
                    </span>
                  </div>
                  <span className="hidden sm:inline-block font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Save ₹282
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES (Sections 1 through 6) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="info">Engineered for Households</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comprehensive Energy Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything your household needs to monitor, predict, and systematically optimize electricity expenses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1: Meter Scanner */}
          <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)] hover:shadow-lg hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.45)] transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-neutral-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
              <ScanLine className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Meter Scanner</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload a clear photograph of your mechanical or digital electricity meter. Built-in OCR detects numeric digits with confidence scoring and allows instant manual verification.
            </p>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
              <span>Automatic rollover &amp; reset detection</span>
            </div>
          </div>

          {/* Feature 2: Intelligent Bill Estimation */}
          <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)] hover:shadow-lg hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.45)] transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-neutral-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Intelligent Bill Estimation</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculates estimated electricity charges based on your distribution company’s progressive slabs, fixed capacity charges, fuel surcharges, and state subsidies.
            </p>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 pt-1">
              <span>Configurable tariff slabs &amp; taxes</span>
            </div>
          </div>

          {/* Feature 3: Appliance Usage Insights */}
          <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)] hover:shadow-lg hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.45)] transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-neutral-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appliance Usage Insights</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Input power ratings and operating schedules for your appliances. Enersense dynamically ranks your top energy consumers and computes monthly device costs.
            </p>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
              <span>Discrepancy audit against meter totals</span>
            </div>
          </div>

          {/* Feature 4: AI Energy Advisor */}
          <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)] hover:shadow-lg hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.45)] transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-neutral-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Energy Advisor</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Get personalized energy-saving recommendations based on your actual logged appliances and reading history. Includes mathematical formulas showing exact kWh and rupee savings.
            </p>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
              <span>Deterministic rule engine + AI provider</span>
            </div>
          </div>

          {/* Feature 5: Future Bill Prediction */}
          <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)] hover:shadow-lg hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.45)] transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-neutral-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Predictive Forecasting</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Statistical baseline modeling uses your chronological readings to calculate daily consumption velocity and project upcoming cycle bills before utility invoices arrive.
            </p>
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 pt-1">
              <span>Clear uncertainty interval margins</span>
            </div>
          </div>

          {/* Feature 6: Sustainable Living */}
          <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)] hover:shadow-lg hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.45)] transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-neutral-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sustainable Living</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Establish monthly energy reduction targets. Celebrate milestones, unlock efficiency achievement badges, and track your household carbon footprint reduction.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="neutral">Seamless 3-Step Process</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Enersense AI Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Zero complicated wiring or hardware setup. Start turning electricity readings into savings in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white dark:bg-black p-6 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.35)] transition-all duration-300 space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Snap or Enter Reading</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Take a photo of your meter counter or enter your current reading manually. The OCR scanner automatically extracts displayed kWh digits.
            </p>
          </div>

          <div className="bg-white dark:bg-black p-6 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.35)] transition-all duration-300 space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Calculate with Tariff Rules</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enersense AI calculates units consumed and applies your regional distribution company’s progressive slabs, fixed charges, and subsidies.
            </p>
          </div>

          <div className="bg-white dark:bg-black p-6 rounded-2xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-soft dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] hover:dark:shadow-[0_0_25px_-2px_rgba(16,185,129,0.35)] transition-all duration-300 space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Optimize &amp; Save More</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Identify top consuming appliances, review personalized recommendations with transparent savings formulas, and track your reduction goals.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="neutral">Got Questions?</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-black rounded-xl border border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 dark:hover:border-emerald-400 dark:shadow-[0_0_12px_-3px_rgba(16,185,129,0.15)] transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeFaq === index ? 'rotate-90 text-emerald-500' : ''
                  }`}
                />
              </button>
              {activeFaq === index && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-emerald-500/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Control of Your Electricity?
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
            Join households across India making smarter energy decisions with Enersense AI.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 font-bold shadow-lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
