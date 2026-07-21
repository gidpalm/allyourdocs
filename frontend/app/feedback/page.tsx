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
import { useToast } from "@/components/ToastProvider"

interface FeedbackForm {
  name: string
  email: string
  feedbackType: string
  message: string
  rating: number
}

type FeedbackType = 'suggestion' | 'bug' | 'feature' | 'compliment' | 'question' | 'other'

const FEEDBACK_TYPES: Array<{ value: FeedbackType; label: string; icon: React.ReactNode; description: string; accent: string }> = [
  {
    value: 'suggestion',
    label: 'Suggestion',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Suggest improvements',
    accent: 'border-indigo-200 bg-indigo-50 text-indigo-700'
  },
  {
    value: 'bug',
    label: 'Bug Report',
    icon: <Bug className="w-5 h-5" />,
    description: 'Report an issue',
    accent: 'border-rose-200 bg-rose-50 text-rose-700'
  },
  {
    value: 'feature',
    label: 'Feature Request',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Request new feature',
    accent: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  {
    value: 'compliment',
    label: 'Compliment',
    icon: <ThumbsUp className="w-5 h-5" />,
    description: 'Share positive feedback',
    accent: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  {
    value: 'question',
    label: 'Question',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'Ask a question',
    accent: 'border-sky-200 bg-sky-50 text-sky-700'
  },
  {
    value: 'other',
    label: 'Other',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Something else',
    accent: 'border-slate-200 bg-slate-50 text-slate-700'
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
  const [charCount, setCharCount] = useState(0)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false
  })
  const { addToast } = useToast()

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
    if (!email) return true
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = () => {
    if (!formData.message.trim()) {
      addToast("Please enter your feedback message", "error")
      return false
    }
    if (formData.message.trim().length < 10) {
      addToast("Please provide more details (minimum 10 characters)", "error")
      return false
    }
    if (formData.message.trim().length > 5000) {
      addToast("Message is too long (maximum 5000 characters)", "error")
      return false
    }
    if (!validateEmail(formData.email)) {
      addToast("Please enter a valid email address", "error")
      return false
    }
    return true
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'message') {
      setCharCount(value.length)
    }
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Submitting feedback:', {
        type: formData.feedbackType,
        hasEmail: !!formData.email,
        rating: formData.rating,
        messageLength: formData.message.length
      })

      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        addToast(result.message || 'Thank you for your feedback!', "success")
        setTimeout(() => {
          setFormData({ name: "", email: "", feedbackType: "suggestion", message: "", rating: 5 })
          setCharCount(0)
          setTouched({ name: false, email: false, message: false })
        }, 3000)
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
      if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        addToast("Network error. Please check your connection and try again.", "error")
      } else if (error.message.includes('429')) {
        addToast("Too many requests. Please wait a moment before trying again.", "error")
      } else {
        addToast(error.message || "Failed to send feedback. Please try again.", "error")
      }
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
    setFormData({ name: "", email: "", feedbackType: "suggestion", message: "", rating: 5 })
    setCharCount(0)
    setTouched({ name: false, email: false, message: false })
  }

  const handleCloseSuccess = () => {
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6 border border-emerald-200">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Thank You for Your Feedback!
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Your feedback helps us improve AllYourDocs for everyone.
            </p>
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleCloseSuccess}
                  className="btn-primary w-full"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Submit More Feedback
                </button>
                <Link
                  href="/"
                  className="btn-secondary w-full"
                >
                  ← Back to Home
                </Link>
                <div className="pt-4">
                  <p className="text-sm text-slate-500">
                    Expect a response within 24-48 hours if you provided your email
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat">
              <div className="stat-value">24-48h</div>
              <div className="stat-label">Typical response time</div>
            </div>
            <div className="stat">
              <div className="stat-value">100%</div>
              <div className="stat-label">Feedback reviewed</div>
            </div>
            <div className="stat">
              <div className="stat-value">30+</div>
              <div className="stat-label">Features from feedback</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Share Your <span className="text-indigo-600">Feedback</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Help us improve AllYourDocs. Your feedback directly shapes our tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="card p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">
                      Your Name
                      <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      className="input"
                      placeholder="Gideon Laryea"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="label">
                      Email Address
                      <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                      <span className="block text-sm text-slate-400 font-normal mt-1">For follow-up only</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`input ${
                        touched.email && formData.email && !validateEmail(formData.email)
                          ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                          : ''
                      }`}
                      placeholder="palmergideon@example.com"
                      maxLength={255}
                    />
                    {touched.email && formData.email && !validateEmail(formData.email) && (
                      <p className="text-red-600 text-sm mt-1">Please enter a valid email</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">
                    What type of feedback do you have? *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FEEDBACK_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, feedbackType: type.value }))}
                        className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                          formData.feedbackType === type.value
                            ? `${type.accent} border-current scale-[1.02] shadow-sm`
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`p-1.5 rounded ${formData.feedbackType === type.value ? 'bg-white/40' : 'bg-slate-100'}`}>
                            {type.icon}
                          </div>
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm opacity-75">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">
                    How would you rate your experience? *
                    <span className="block text-sm text-slate-400 font-normal mt-1">Select 1-5 stars</span>
                  </label>
                  <div className="flex items-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none transition-transform hover:scale-110"
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                      >
                        {star <= formData.rating ? (
                          <Star className="w-10 h-10 fill-amber-400 text-amber-400" />
                        ) : (
                          <Star className="w-10 h-10 text-slate-300" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-slate-700">
                      {RATING_LABELS[formData.rating]}
                      <span className="ml-2 text-slate-400">({formData.rating}/5)</span>
                    </span>
                    <div className="text-sm text-slate-400">Click stars to adjust</div>
                  </div>
                </div>

                <div>
                  <label className="label">
                    Your Message *
                    <span className="block text-sm text-slate-400 font-normal mt-1">
                      Please be specific so we can understand and act on your feedback
                    </span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={() => handleBlur('message')}
                    rows={6}
                    className={`input resize-none ${
                      touched.message && !formData.message.trim()
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="Tell us what you think... What worked well? What could be better?"
                    required
                    minLength={10}
                    maxLength={5000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-slate-400">
                      {touched.message && !formData.message.trim() ? (
                        <span className="text-red-600">Message is required</span>
                      ) : formData.message.trim().length < 10 ? (
                        <span className="text-amber-600">
                          Minimum 10 characters ({10 - formData.message.trim().length} more needed)
                        </span>
                      ) : (
                        <span>
                          {charCount} / 5000 characters
                          {charCount > 4000 && <span className="text-amber-600 ml-2">Getting long</span>}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">Required</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center transition-all ${
                      isSubmitting
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'btn-primary'
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
                    className="btn-secondary"
                  >
                    Reset Form
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-indigo-600">
                    <strong>Privacy Note:</strong> Your feedback is sent directly to our team.
                    We never share your email with third parties. All feedback is stored securely
                    and used only to improve our services.
                  </p>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-indigo-600" />
                How It Works
              </h3>
              <ol className="space-y-3">
                {[
                  "Submit your feedback",
                  "We receive instant notification",
                  "Team reviews & prioritizes",
                  "We implement improvements",
                ].map((step, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center mr-3 mt-0.5 border border-indigo-100">
                      <span className="text-sm font-medium text-indigo-600">{i + 1}</span>
                    </div>
                    <span className="text-slate-600">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Our Feedback Impact</h3>
              <div className="space-y-4">
                <div>
                  <div className="stat-value">87%</div>
                  <div className="stat-label">of features come from user feedback</div>
                </div>
                <div>
                  <div className="stat-value">&lt; 24h</div>
                  <div className="stat-label">Average response time</div>
                </div>
                <div>
                  <div className="stat-value">500+</div>
                  <div className="stat-label">Improvements made</div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full mb-4 border border-indigo-100">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Other Ways to Reach Us</h3>
              <p className="text-slate-600 text-sm mb-4">
                Prefer a different method? We&apos;re here to help.
              </p>
              <a href="mailto:palmergideon@gmail.com" className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                <Mail className="w-4 h-4 mr-2" />
                palmergideon@gmail.com
              </a>
            </div>

            <div className="text-center pt-4">
              <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                ← Back to All Tools
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-indigo-600">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              No spam, ever
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              100% private
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Human responses
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            All feedback is encrypted in transit and stored securely. We comply with data protection regulations.
          </p>
        </div>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
