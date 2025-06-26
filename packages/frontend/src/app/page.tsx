'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [email, setEmail] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to registration page
    window.location.href = '/auth/register'
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">CompliCal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/docs" className="text-gray-700 hover:text-gray-900">
                Documentation
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Never Miss a Compliance Deadline Again
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CompliCal provides a trusted, developer-first API for government and compliance 
              deadlines in Australia and New Zealand. Integrate once, stay compliant forever.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/auth/register"
                className="bg-black text-white px-6 py-3 rounded-md text-lg hover:bg-gray-800"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                className="border border-gray-300 px-6 py-3 rounded-md text-lg hover:bg-gray-50"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">
            Built for Developers, Trusted by Businesses
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-xl font-semibold mb-3">Real-time Updates</h4>
              <p className="text-gray-600">
                Our automated systems continuously monitor government websites for changes,
                ensuring you always have the latest deadline information.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-xl font-semibold mb-3">Simple Integration</h4>
              <p className="text-gray-600">
                RESTful API with comprehensive documentation. Get started in minutes
                with our SDKs for popular programming languages.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-xl font-semibold mb-3">100% Accurate</h4>
              <p className="text-gray-600">
                Every deadline is verified and includes source attribution. We take
                data accuracy seriously so you can trust our API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">
            Simple to Use
          </h3>
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{`// Get upcoming BAS deadlines
const response = await fetch(
  'https://api.complical.com/v1/au/ato/deadlines?type=BAS_QUARTERLY',
  {
    headers: {
      'X-Api-Key': 'YOUR_API_KEY'
    }
  }
);

const data = await response.json();
console.log(data.deadlines);
// [
//   {
//     "id": "ATO_BAS_QUARTERLY_Q1_FY25",
//     "name": "Quarterly Business Activity Statement",
//     "dueDate": "2024-10-28",
//     "description": "Lodge and pay GST for the quarter"
//   }
// ]`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Start Your Free Trial Today
          </h3>
          <p className="text-xl mb-8 text-gray-300">
            Get 10,000 free API calls per month. No credit card required.
          </p>
          {(
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-white text-gray-900 px-6 py-3 rounded-md hover:bg-gray-100"
              >
                Get Started
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              © 2024 CompliCal. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}