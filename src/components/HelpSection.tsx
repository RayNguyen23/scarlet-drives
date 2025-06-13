import React, { useState } from 'react'
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Video,
  FileText
} from 'lucide-react'

const HelpSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "How do I upload files to Scarlet Drives?",
      answer: "You can upload files by dragging and dropping them into the main area, or by clicking the upload button. We support all file types and sizes up to your plan limit."
    },
    {
      question: "How does file encryption work?",
      answer: "All files are encrypted using AES-256 encryption before being stored. Your files are encrypted both in transit and at rest, ensuring maximum security."
    },
    {
      question: "Can I share files with people who don't have an account?",
      answer: "Yes, you can create shareable links that allow anyone with the link to access your files. You can set expiration dates and password protection for added security."
    },
    {
      question: "What happens when I delete a file?",
      answer: "Deleted files are moved to the trash where they remain for 30 days (or your configured auto-delete period). You can restore them anytime during this period."
    },
    {
      question: "How do I upgrade or downgrade my plan?",
      answer: "Go to the Plans section in the sidebar and select your desired plan. Changes take effect immediately, and billing is prorated."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, we have mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store."
    },
    {
      question: "How do I enable two-factor authentication?",
      answer: "Go to Security Settings and toggle on Two-Factor Authentication. You'll need an authenticator app like Google Authenticator or Authy."
    },
    {
      question: "What file formats support online editing?",
      answer: "We support online editing for documents (.docx, .txt), spreadsheets (.xlsx, .csv), and presentations (.pptx). More formats are being added regularly."
    }
  ]

  const quickLinks = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using Scarlet Drives",
      icon: Book,
      link: "#"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      icon: Video,
      link: "#"
    },
    {
      title: "API Documentation",
      description: "Integrate with our powerful API",
      icon: FileText,
      link: "#"
    },
    {
      title: "Security Best Practices",
      description: "Keep your files safe and secure",
      icon: HelpCircle,
      link: "#"
    }
  ]

  const contactOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      availability: "Available 24/7",
      action: "Start Chat"
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: Mail,
      availability: "Response within 24 hours",
      action: "Send Email"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our team",
      icon: Phone,
      availability: "Mon-Fri, 9AM-6PM EST",
      action: "Call Now"
    }
  ]

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Help & Support</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm">We're here to help</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles, guides, or FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <a
                key={index}
                href={link.link}
                className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group"
              >
                <Icon className="w-6 h-6 text-red-400" />
                <div className="flex-1">
                  <h4 className="text-white font-medium group-hover:text-red-400 transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-gray-400 text-sm">{link.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
              </a>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="border border-gray-700 rounded-lg">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700 transition-colors"
              >
                <span className="text-white font-medium">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contact Support</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <div key={index} className="bg-gray-700 rounded-lg p-4 text-center">
                <Icon className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h4 className="text-white font-medium mb-2">{option.title}</h4>
                <p className="text-gray-400 text-sm mb-3">{option.description}</p>
                <p className="text-gray-500 text-xs mb-4">{option.availability}</p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200">
                  {option.action}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="space-y-3">
          {[
            { service: 'File Upload/Download', status: 'operational', uptime: '99.9%' },
            { service: 'Authentication', status: 'operational', uptime: '100%' },
            { service: 'File Sharing', status: 'operational', uptime: '99.8%' },
            { service: 'Mobile Apps', status: 'operational', uptime: '99.7%' },
            { service: 'API Services', status: 'operational', uptime: '99.9%' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white font-medium">{item.service}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-green-400 text-sm capitalize">{item.status}</span>
                <span className="text-gray-400 text-sm">{item.uptime} uptime</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Version Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm">Web App</p>
            <p className="text-white font-medium">v2.1.0</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">iOS App</p>
            <p className="text-white font-medium">v1.8.2</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Android App</p>
            <p className="text-white font-medium">v1.8.1</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">API</p>
            <p className="text-white font-medium">v3.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpSection