"use client"

import { useState, ChangeEvent, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Send,
  MessageSquare,
  ThumbsUp,
  Bug,
  Lightbulb,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  Star,
  X,
  HelpCircle,
  ExternalLink
} from "lucide-react"

interface FeedbackForm {
  name: string
  email: string
  feedbackType: string
  message: string
  rating: number
}

type FeedbackType = 'suggestion' | 'bug' | 'feature' | 'compliment' | 'question' | 'other'

const FEEDBACK_TYPES: Array<{ value: FeedbackType; label: string; icon: React.ReactNode; description: string; color: string }> = [
  {
    value: 'suggestion',
    label: 'Suggestion',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Suggest improvements',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
  },
  {
    value: 'bug',
    label: 'Bug Report',
    icon: <Bug className="w-5 h-5" />,
    description: 'Report an issue',
    color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
  },
  {
    value: 'feature',
    label: 'Feature Request',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Request new feature',
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
  },
  {
    value: 'compliment',
    label: 'Compliment',
    icon: <ThumbsUp className="w-5 h-5" />,
    description: 'Share positive feedback',
    color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
  },
  {
    value: 'question',
    label: 'Question',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'Ask a question',
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
  },
  {
    value: 'other',
    label: 'Other',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Something else',
    color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
  }
]

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
}

export default function FeedbackPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FeedbackForm>({
    name: "",
    email: "",
    feedbackType: "suggestion",
    message: "",
    rating: 5
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false
  })

  // Handle browser back button
  useEffect(() => {
    const handleBackButton = () => {
      if (isSubmitted) {
        setIsSubmitted(false)
      }
    }
    
    window.addEventListener('popstate', handleBackButton)
    return () => window.removeEventListener('popstate', handleBackButton)
  }, [isSubmitted])

  const validateEmail = (email: string) => {
    if (!email) return true // Email is optional
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = () => {
    if (!formData.message.trim()) {
      setError("Please enter your feedback message")
      return false
    }
    
    if (formData.message.trim().length < 10) {
      setError("Please provide more details (minimum 10 characters)")
      return false
    }
    
    if (formData.message.trim().length > 5000) {
      setError("Message is too long (maximum 5000 characters)")
      return false
    }
    
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    
    setError("")
    return true
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (name === 'message') {
      setCharCount(value.length)
    }
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Add telemetry/analytics here if needed
      console.log('Submitting feedback:', {
        type: formData.feedbackType,
        hasEmail: !!formData.email,
        rating: formData.rating,
        messageLength: formData.message.length
      })

      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          language: navigator.language,
          referrer: document.referrer || 'direct'
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setSuccessMessage(result.message || 'Thank you for your feedback!')
        
        // Reset form after delay
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            feedbackType: "suggestion",
            message: "",
            rating: 5
          })
          setCharCount(0)
          setTouched({
            name: false,
            email: false,
            message: false
          })
        }, 3000)
        
        // Track successful submission (for analytics)
        if (window.gtag) {
          window.gtag('event', 'feedback_submitted', {
            event_category: 'engagement',
            event_label: formData.feedbackType,
            value: formData.rating
          })
        }
      } else {
        throw new Error(result.message || `Failed to send feedback (${response.status})`)
      }
    } catch (error: any) {
      console.error("Error submitting feedback:", error)
      
      // User-friendly error messages
      if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        setError("Network error. Please check your connection and try again.")
      } else if (error.message.includes('429')) {
        setError("Too many requests. Please wait a moment before trying again.")
      } else {
        setError(error.message || "Failed to send feedback. Please try again.")
      }
      
      // Log error for debugging
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: `Feedback submission failed: ${error.message}`,
          fatal: false
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      feedbackType: "suggestion",
      message: "",
      rating: 5
    })
    setError("")
    setCharCount(0)
    setTouched({
      name: false,
      email: false,
      message: false
    })
  }

  const handleCloseSuccess = () => {
    setIsSubmitted(false)
    setSuccessMessage("")
  }

  // Render success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Feedback! ✨
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              {successMessage}
            </p>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Feedback received</span>
                </div>
                {formData.email && (
                  <p className="text-sm text-green-600 mt-2">
                    A confirmation has been sent to {formData.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleCloseSuccess}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Submit More Feedback
                </button>
                
                <Link
                  href="/"
                  className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  ← Back to Home
                </Link>
                
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Expect a response within 24-48 hours if you provided your email
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">24-48h</div>
              <div className="text-sm text-gray-600">Typical response time</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600">Feedback reviewed</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
              <div className="text-2xl font-bold text-purple-600">30+</div>
              <div className="text-sm text-gray-600">Features from feedback</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Share Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Feedback</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us improve AllYourDocs. Your feedback directly shapes our tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={() => setError("")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Your Name
                      <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="John Doe"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email Address
                      <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                      <span className="block text-sm text-gray-500 font-normal mt-1">
                        For follow-up only
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        touched.email && formData.email && !validateEmail(formData.email)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                      maxLength={255}
                    />
                    {touched.email && formData.email && !validateEmail(formData.email) && (
                      <p className="text-red-500 text-sm mt-1">Please enter a valid email</p>
                    )}
                  </div>
                </div>

                {/* Feedback Type */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">
                    What type of feedback do you have? *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FEEDBACK_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, feedbackType: type.value }))}
                        className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                          formData.feedbackType === type.value
                            ? `${type.color} border-current scale-[1.02] shadow-sm`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`p-1.5 rounded ${
                            formData.feedbackType === type.value ? 'bg-white/20' : 'bg-gray-100'
                          }`}>
                            {type.icon}
                          </div>
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm opacity-75">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">
                    How would you rate your experience? *
                    <span className="block text-sm text-gray-500 font-normal mt-1">
                      Select 1-5 stars
                    </span>
                  </label>
                  <div className="flex items-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="text-4xl focus:outline-none transition-transform hover:scale-110"
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                      >
                        {star <= formData.rating ? (
                          <Star className="w-10 h-10 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <Star className="w-10 h-10 text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-700">
                      {RATING_LABELS[formData.rating]}
                      <span className="ml-2 text-gray-500">({formData.rating}/5)</span>
                    </span>
                    <div className="text-sm text-gray-500">
                      Click stars to adjust
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Your Message *
                    <span className="block text-sm text-gray-500 font-normal mt-1">
                      Please be specific so we can understand and act on your feedback
                    </span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={() => handleBlur('message')}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none ${
                      touched.message && !formData.message.trim()
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="Tell us what you think... What worked well? What could be better? Any specific issues or suggestions?"
                    required
                    minLength={10}
                    maxLength={5000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-500">
                      {touched.message && !formData.message.trim() ? (
                        <span className="text-red-500">Message is required</span>
                      ) : formData.message.trim().length < 10 ? (
                        <span className="text-yellow-600">
                          Minimum 10 characters ({10 - formData.message.trim().length} more needed)
                        </span>
                      ) : (
                        <span>
                          {charCount} / 5000 characters
                          {charCount > 4000 && (
                            <span className="text-yellow-600 ml-2">Getting long</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Required
                    </div>
                  </div>
                </div>

                {/* Submit & Reset */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-4 rounded-lg font-medium flex items-center justify-center transition-all ${
                      isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Feedback
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="px-6 py-4 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset Form
                  </button>
                </div>

                {/* Privacy Notice */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    <strong>Privacy Note:</strong> Your feedback is sent directly to our team. 
                    We never share your email with third parties. All feedback is stored securely 
                    and used only to improve our services.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                How It Works
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <span className="text-gray-600">Submit your feedback</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <span className="text-gray-600">We receive instant notification</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-medium text-blue-600">3</span>
                  </div>
                  <span className="text-gray-600">Team reviews & prioritizes</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-medium text-blue-600">4</span>
                  </div>
                  <span className="text-gray-600">We implement improvements</span>
                </li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Our Feedback Impact</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-gray-600">of features come from user feedback</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">&lt; 24h</div>
                  <div className="text-sm text-gray-600">Average response time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-600">Improvements made</div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                <Mail className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Other Ways to Reach Us</h3>
              <p className="text-gray-600 text-sm mb-4">
                Prefer a different method? We're here to help.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:palmergideon@gmail.com"
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  palmergideon@gmail.com
                </a>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center pt-4">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to All Tools
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
              No spam, ever
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
              100% private
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
              Human responses
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            All feedback is encrypted in transit and stored securely. We comply with data protection regulations.
          </p>
        </div>
      </div>
    </div>
  )
}

// Add type for gtag if using Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}