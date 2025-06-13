import React, { useState } from 'react'
import { Check, Star, Zap, Shield, Users } from 'lucide-react'

interface PlansSectionProps {
  onPlanSelect: (planName: string) => void
}

const PlansSection: React.FC<PlansSectionProps> = ({ onPlanSelect }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Free',
      price: 0,
      storage: '1 GB',
      security: 'Basic SSL Encryption',
      selfDestruct: 'Not Available',
      editing: 'Not Available',
      ai: 'Not Available',
      support: 'Community Support',
      features: [
        '1 GB storage space',
        'Basic file sharing',
        'SSL encryption',
        'Community support',
        'Web access only'
      ],
      color: 'border-gray-600',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      popular: false,
      icon: Shield
    },
    {
      name: 'Personal',
      price: 5,
      storage: '100 GB',
      security: 'Advanced Encryption',
      selfDestruct: '7-Day Limit',
      editing: 'Basic Editing Tools',
      ai: 'Not Available',
      support: 'Email Support',
      features: [
        '100 GB storage space',
        'Advanced encryption',
        'File self-destruct (7 days)',
        'Basic editing tools',
        'Email support',
        'Mobile app access'
      ],
      color: 'border-red-500',
      buttonColor: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
      popular: false,
      icon: Star
    },
    {
      name: 'Pro',
      price: 15,
      storage: '1 TB',
      security: 'End-to-End Encryption',
      selfDestruct: 'Custom Time Limit',
      editing: 'Full Editing Access',
      ai: 'Basic AI Integration',
      support: 'Priority Email Support',
      features: [
        '1 TB storage space',
        'End-to-end encryption',
        'Custom self-destruct timing',
        'Full editing suite',
        'Basic AI tools',
        'Priority support',
        'Advanced sharing options',
        'Version history'
      ],
      color: 'border-red-500',
      buttonColor: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
      popular: true,
      icon: Zap
    },
    {
      name: 'Business',
      price: 30,
      storage: '5 TB',
      security: 'E2E + Audit Logs',
      selfDestruct: 'Advanced Rules',
      editing: 'Full Editing Access',
      ai: 'Advanced AI Tools',
      support: '24/7 Technical Support',
      features: [
        '5 TB storage space',
        'Advanced security + audit logs',
        'Smart self-destruct rules',
        'Team collaboration tools',
        'Advanced AI features',
        '24/7 support',
        'Admin dashboard',
        'API access'
      ],
      color: 'border-gray-600',
      buttonColor: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900',
      popular: false,
      icon: Users
    },
    {
      name: 'Enterprise',
      price: null,
      storage: 'Unlimited',
      security: 'Compliance-Ready (HIPAA, GDPR)',
      selfDestruct: 'AI Smart Triggers',
      editing: 'Full Team Editing',
      ai: 'Full AI Suite',
      support: 'Dedicated Manager',
      features: [
        'Unlimited storage',
        'Full compliance suite',
        'AI-powered automation',
        'Advanced team features',
        'Complete AI integration',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantees'
      ],
      color: 'border-yellow-500',
      buttonColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      popular: false,
      icon: Shield
    }
  ]

  const getPrice = (price: number | null) => {
    if (price === null) return 'Custom'
    if (price === 0) return 'Free'
    return billingCycle === 'yearly' ? `$${price * 10}` : `$${price}`
  }

  const getPricePeriod = (price: number | null) => {
    if (price === null) return 'Contact us'
    if (price === 0) return 'Forever'
    return billingCycle === 'yearly' ? 'per year' : 'per month'
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Choose Your <span className="text-red-400">Scarlet Drives</span> Plan
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Secure, powerful cloud storage solutions for every need
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              billingCycle === 'monthly'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              billingCycle === 'yearly'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.name}
              className={`relative bg-gray-800 rounded-2xl border-2 ${plan.color} p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'transform scale-105 shadow-red-500/20 ring-2 ring-red-500/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">
                    {getPrice(plan.price)}
                  </span>
                  <span className="text-gray-400 ml-1 text-sm">
                    {getPricePeriod(plan.price)}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onPlanSelect(plan.name)}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${plan.buttonColor} ${
                  plan.popular ? 'shadow-lg' : ''
                }`}
              >
                {plan.price === null ? 'Contact Sales' : plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
        <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Detailed Feature Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.name} className="px-6 py-4 text-center text-sm font-medium text-gray-400">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-white">Storage Limit</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="px-6 py-4 text-sm text-center text-gray-300">
                    {plan.storage}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-900/50">
                <td className="px-6 py-4 text-sm font-medium text-white">File Security</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="px-6 py-4 text-sm text-center text-gray-300">
                    {plan.security}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-white">Self-Destruct</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="px-6 py-4 text-sm text-center text-gray-300">
                    {plan.selfDestruct}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-900/50">
                <td className="px-6 py-4 text-sm font-medium text-white">File Editing</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="px-6 py-4 text-sm text-center text-gray-300">
                    {plan.editing}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-white">AI Tools</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="px-6 py-4 text-sm text-center text-gray-300">
                    {plan.ai}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-900/50">
                <td className="px-6 py-4 text-sm font-medium text-white">Support</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="px-6 py-4 text-sm text-center text-gray-300">
                    {plan.support}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PlansSection