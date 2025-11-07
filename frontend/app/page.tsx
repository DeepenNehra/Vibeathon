import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Heart, Stethoscope, Globe, Zap, Shield, Users, Brain, Languages, FileText, Video, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Arogya-AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-teal-600 dark:text-teal-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-blue-400/10" />
        
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                  AI-Powered Healthcare Platform
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Breaking Language Barriers
                </span>
                <br />
                <span className="text-zinc-900 dark:text-zinc-100">
                  in Healthcare
                </span>
              </h1>
              
              <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Real-time Hindi-English translation for medical consultations. 
                Empowering doctors and patients to communicate seamlessly with AI-powered SOAP notes.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-lg px-8 py-6">
                    <Heart className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-lg px-8 py-6">
                  <Video className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">1000+ Doctors</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-teal-200/50 dark:border-teal-800/50 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">Live Translation</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Hindi ↔ English</p>
                    </div>
                  </div>
                  
                  <div className="bg-teal-50 dark:bg-teal-950/50 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Patient (Hindi):</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">"मुझे सिर में दर्द है"</p>
                    <div className="h-px bg-teal-200 dark:bg-teal-800" />
                    <p className="text-sm text-teal-600 dark:text-teal-400">Translated:</p>
                    <p className="font-medium text-teal-700 dark:text-teal-300">"I have a headache"</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Activity className="w-4 h-4 text-teal-500 animate-pulse" />
                    <span>Real-time processing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              Powerful Features for Modern Healthcare
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Everything you need to provide exceptional patient care
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-teal-200/50 dark:border-teal-800/50 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl w-fit mb-4">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Real-Time Translation</CardTitle>
                <CardDescription>
                  Instant Hindi-English translation during video consultations with AI-powered accuracy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl w-fit mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle>SOAP Note Generation</CardTitle>
                <CardDescription>
                  Automated clinical documentation with AI-generated SOAP notes from consultation transcripts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-gradient-to-br from-blue-500 to-teal-600 p-3 rounded-xl w-fit mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Compassion Reflex</CardTitle>
                <CardDescription>
                  AI-powered suggestions to remove stigmatizing language and promote person-first care
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-teal-200/50 dark:border-teal-800/50 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl w-fit mb-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Video Consultations</CardTitle>
                <CardDescription>
                  High-quality WebRTC video calls with live captions and translation overlay
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl w-fit mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Community Lexicon</CardTitle>
                <CardDescription>
                  Crowdsourced medical terminology database for regional language accuracy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-gradient-to-br from-blue-500 to-teal-600 p-3 rounded-xl w-fit mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle>HIPAA Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security with end-to-end encryption and compliance standards
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Healthcare?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Join thousands of doctors providing better care with AI-powered translation
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 text-lg px-8 py-6">
                  <Heart className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-teal-600 text-lg px-8 py-6 font-semibold">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-zinc-900/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Arogya-AI
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Breaking language barriers in healthcare with AI-powered translation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Features</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Company</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">About</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Blog</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Legal</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Privacy</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Terms</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">HIPAA</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-200 dark:border-zinc-800 mt-8 pt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>© 2024 Arogya-AI. All rights reserved. Built with ❤️ for healthcare professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
