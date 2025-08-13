'use client'
import Link from 'next/link'

export default function AccountManagementPage() {
  const plans = [
    { name: 'Lite Phase', price: '', deposit: '$500 - $1,000', profitTarget: '20% in 30 Days', features: ['One-Time Payment', 'Deposit of $500 - $1,000', 'Profit Target: 20%', 'Expert Trader Management'] },
    { name: 'Pro Phase', price: '', deposit: '$1500 - $3,000', profitTarget: '20% in 30 Days', features: ['One-Time Payment', 'Deposit of $1500 - $3,000', 'Profit Target: 20%', 'Expert Trader Management'] },
    { name: 'Geant Phase', price: '', deposit: '$3500 - $5,000', profitTarget: '20% in 30 Days', features: ['One-Time Payment', 'Deposit of $3500 -  $5,000', 'Profit Target: 20%', 'Expert Trader Management'] },
    { name: 'Grande Phase', price: '', deposit: '$10,000', profitTarget: '20% in 30 Days', features: ['One-Time Payment', 'Deposit of $10,000', 'Profit Target: 20%', 'Expert Trader Management'] },
  ]

  return (
    <>
      {/* Public Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Uweh Trading Hub
          </Link>
          <div className="flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            {/* <Link href="/account-management" className="text-gray-700 hover:text-blue-600 transition">
              Account Management
            </Link> */}
            <Link href="/login" className="text-gray-700 hover:text-blue-600 transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold text-center mb-12">Account Management Plans</h1>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div key={idx} className="border rounded-xl shadow-sm hover:shadow-lg transition p-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-lg font-semibold text-gray-600 mb-4">{plan.price}</p>
              <ul className="space-y-2 flex-1">
                <li><strong>Deposit:</strong> {plan.deposit}</li>
                <li><strong>Profit Target:</strong> {plan.profitTarget}</li>
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-700">• {feature}</li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-6 block text-center px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* Steps */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">3 Easy Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 'Step 1', text: 'Choose your preferred account management plan.' },
              { step: 'Step 2', text: 'Pay the one-time management fee securely.' },
              { step: 'Step 3', text: 'Get assigned to your personal account expert.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">{item.step}</h3>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

{/* Terms Acceptance */}
<section className="mt-16 text-center">
  <h2 className="text-3xl font-bold mb-4">Read & Accept Terms</h2>
  <p className="text-gray-700 mb-6">
    Please read our full{" "}
    <a
      href="/terms.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      Terms and Conditions
    </a>{" "}
    before proceeding.
  </p>

  <div className="flex items-center justify-center space-x-2">
    <input
      id="acceptTerms"
      type="checkbox"
      className="w-5 h-5"
    />
    <label htmlFor="acceptTerms" className="text-gray-700">
      I have read and agree to the Terms and Conditions
    </label>
  </div>

  <Link
    href="/login"
    className="mt-6 inline-block px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition disabled:opacity-50"
    onClick={(e) => {
    const checkbox = document.getElementById("acceptTerms") as HTMLInputElement | null;
    if (!checkbox?.checked) {
      e.preventDefault();
      alert("Please accept the Terms and Conditions first.");
    }
  }}
>
    Get Started
  </Link>
</section>

      </div>
    </>
  )
}
