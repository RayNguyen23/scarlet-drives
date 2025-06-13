import React, { useState } from 'react'
import { ArrowLeft, Shield, Check, Star, CreditCard, Zap, Crown, Users, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

interface PaymentSectionProps {
  selectedPlan: string | null
  onBack: () => void
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ selectedPlan, onBack }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const planDetails = {
    'Free': { 
      price: 0, 
      icon: Shield,
      color: 'from-gray-600 to-gray-700',
      features: ['1 GB storage', 'Basic encryption', 'Community support', 'Web access only'] 
    },
    'Personal': { 
      price: 5, 
      icon: Star,
      color: 'from-blue-600 to-blue-700',
      features: ['100 GB storage', 'Advanced encryption', 'Email support', 'Basic editing', 'Mobile app access'] 
    },
    'Pro': { 
      price: 15, 
      icon: Zap,
      color: 'from-red-600 to-red-700',
      features: ['1 TB storage', 'End-to-end encryption', 'Priority support', 'Full editing', 'Basic AI tools', 'Version history'] 
    },
    'Business': { 
      price: 30, 
      icon: Users,
      color: 'from-purple-600 to-purple-700',
      features: ['5 TB storage', 'Advanced security', '24/7 support', 'Team features', 'Advanced AI', 'Admin dashboard'] 
    },
    'Enterprise': { 
      price: null, 
      icon: Crown,
      color: 'from-yellow-600 to-yellow-700',
      features: ['Unlimited storage', 'Full compliance', 'Dedicated manager', 'Custom integrations', 'SLA guarantees'] 
    }
  }

  const currentPlan = selectedPlan ? planDetails[selectedPlan as keyof typeof planDetails] : null
  const price = currentPlan?.price
  const finalPrice = price === null ? 'Custom' : price === 0 ? 0 : billingCycle === 'yearly' ? price * 10 : price
  const Icon = currentPlan?.icon || Shield

  const handlePayment = async () => {
    setProcessing(true)
    setPaymentError(null)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, we'll just show success
      // You can replace this with your actual payment logic
      setPaymentSuccess(true)
    } catch (error) {
      setPaymentError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleFreePlan = () => {
    setPaymentSuccess(true)
  }

  const handleEnterprisePlan = () => {
    // Redirect to contact form or open email client
    window.location.href = 'mailto:sales@scarletdrives.com?subject=Enterprise Plan Inquiry'
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 rounded-2xl border border-green-700 p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-green-200 text-lg mb-6">
            Welcome to Scarlet Drives {selectedPlan} Plan
          </p>
          
          <div className="bg-green-800 bg-opacity-50 rounded-lg p-4 mb-6">
            <p className="text-green-100 text-sm">
              Your subscription is now active. You can start enjoying all the premium features immediately.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-green-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Continue to Dashboard
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Plans
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Complete Your Purchase</h1>
          <p className="text-gray-400">Secure payment processing</p>
        </div>
      </div>

      {paymentError && (
        <div className="mb-6 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{paymentError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plan Summary */}
        <div className="space-y-6">
          {/* Selected Plan Card */}
          <div className={`bg-gradient-to-br ${currentPlan?.color} rounded-2xl border border-gray-600 p-6 shadow-xl`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedPlan} Plan</h2>
                <p className="text-white text-opacity-80">
                  {billingCycle === 'yearly' ? 'Annual billing' : 'Monthly billing'}
                </p>
              </div>
            </div>
            
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-white mb-2">
                {typeof finalPrice === 'number' ? `$${finalPrice}` : finalPrice}
              </div>
              <p className="text-white text-opacity-80">
                {price === null ? 'Contact us' : price === 0 ? 'Free forever' : billingCycle === 'yearly' ? 'per year' : 'per month'}
              </p>
              {billingCycle === 'yearly' && price && price > 0 && (
                <div className="mt-2">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Save ${price * 2} per year
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          {price !== null && price > 0 && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Billing Cycle</h3>
                {billingCycle === 'yearly' && (
                  <span className="px-3 py-1 bg-green-900 text-green-300 text-sm rounded-full font-medium">
                    17% OFF
                  </span>
                )}
              </div>
              <div className="flex items-center bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                  <div className="text-xs opacity-75 mt-1">${price}/month</div>
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                    billingCycle === 'yearly'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <div className="text-xs opacity-75 mt-1">${price * 10}/year</div>
                </button>
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">What's included:</h3>
            <ul className="space-y-3">
              {currentPlan?.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Section */}
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Payment Method</h3>
            </div>

            {price === 0 ? (
              /* Free Plan */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-900 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">No Payment Required</h4>
                <p className="text-gray-400 mb-6">The Free plan doesn't require any payment information.</p>
                <button 
                  onClick={handleFreePlan}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                >
                  Activate Free Plan
                </button>
              </div>
            ) : price === null ? (
              /* Enterprise Plan */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-900 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Custom Enterprise Solution</h4>
                <p className="text-gray-400 mb-6">Contact our sales team for enterprise pricing and custom solutions tailored to your organization.</p>
                <button 
                  onClick={handleEnterprisePlan}
                  className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg font-medium hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Contact Sales Team
                </button>
              </div>
            ) : (
              /* Paid Plans */
              <div className="space-y-6">
                <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-white font-medium">Secure Payment Processing</h4>
                  </div>
                  <p className="text-blue-200 text-sm">
                    Click the button below to proceed with your payment. You can integrate your preferred payment method here.
                  </p>
                </div>

                {/* Payment Button */}
                <div className="space-y-4">
                  {processing && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-400">Processing payment...</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                      processing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    {processing ? 'Processing...' : `Pay $${finalPrice}`}
                  </button>
                  
                  <p className="text-center text-xs text-gray-500">
                    Replace this button with your PayPal integration
                  </p>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-3 p-4 bg-green-900 bg-opacity-20 rounded-lg border border-green-700">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-300">256-bit SSL Encryption</p>
                    <p className="text-xs text-green-400">Your payment information is fully encrypted and secure</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{selectedPlan} Plan</span>
                <span className="text-white font-medium">
                  {typeof finalPrice === 'number' ? `$${finalPrice}` : finalPrice}
                </span>
              </div>
              {billingCycle === 'yearly' && price && price > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Discount (17% off)</span>
                  <span className="text-green-400">-${price * 2}</span>
                </div>
              )}
              <hr className="border-gray-600" />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-white">Total</span>
                <span className="text-white">
                  {typeof finalPrice === 'number' ? `$${finalPrice}` : finalPrice}
                </span>
              </div>
              {price !== null && price > 0 && (
                <p className="text-gray-400 text-sm">
                  {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'} • Cancel anytime
                </p>
              )}
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By completing this purchase, you agree to our{' '}
            <a href="#" className="text-red-400 hover:text-red-300 underline">Terms of Service</a> and{' '}
            <a href="#" className="text-red-400 hover:text-red-300 underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSection