/* eslint-disable @next/next/no-img-element */
export default function DonateSection() {
    return (
        <section id="donate" className="py-16 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-5xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800">Transform Lives Through Your Generosity</h2>
            <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            Your donation directly supports youth ministries, outreach programs, and spiritual growth initiatives.
            </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <form className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name*</label>
                <input
                type="text"
                placeholder="Your Name"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <div>
                <label className="block text-gray-700 font-semibold mb-1">Email Address*</label>
                <input
                type="email"
                placeholder="example@email.com"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                title="Please enter a valid email address"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onBlur={(e) => {
                    const email = e.target.value;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (email && !emailRegex.test(email)) {
                        e.target.setCustomValidity('Please enter a valid email address');
                        e.target.classList.add('border-red-500');
                    } else {
                        e.target.setCustomValidity('');
                        e.target.classList.remove('border-red-500');
                    }
                }}
                onChange={(e) => {
                    e.target.classList.remove('border-red-500');
                    e.target.setCustomValidity('');
                }}
                />
                <p className="text-xs text-gray-500 mt-1">We&apos;ll send you a receipt at this email address</p>
            </div>

            <div>
                <label className="block text-gray-700 font-semibold mb-1">Amount (GHS)*</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                <button type="button" className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition">
                    GHS 5
                </button>
                <button type="button" className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition">
                    GHS 10
                </button>
                <button type="button" className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition">
                    GHS 20
                </button>
                <button type="button" className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition">
                    GHS 50
                </button>
                <button type="button" className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition">
                    GHS 100
                </button>
                <button type="button" className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition">
                    GHS 200
                </button>
                </div>
                <input
                type="number"
                placeholder="Other amount"
                required
                className="w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">GHS 50 provides Bibles for 2 youth members</p>
            </div>

            <div>
                <label className="block text-gray-700 font-semibold mb-1">Payment Method*</label>
                <select 
                className="w-full rounded-xl text-gray-800 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                >
                <option value="">Select method</option>
                <option value="momo">Mobile Money</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                </select>
                
                {/* Mobile Money Instructions (shown when selected) */}
                <div id="momo-instructions" className="hidden mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>To pay:</strong> Dial *170# → Choose &apos;Mobile Money&apos; → Select &apos;Pay Bill&apos;
                </p>
                                 <div className="hidden lg:flex justify-center gap-4 mt-2">
                     <img src="/mobile/mtn.png" alt="MTN" className="h-6" />
                     <img src="/mobile/telecel.png" alt="Vodafone" className="h-6" />
                     <img src="/mobile/airteltigo.png" alt="AirtelTigo" className="h-6" />
                 </div>
                </div>
            </div>

            <div className="flex items-center">
                <input type="checkbox" id="recurring" className="mr-2" />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                Make this a monthly donation
                </label>
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-300 hover:scale-[1.02]"
            >
                Donate Now
            </button>
            
            <p className="text-xs text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 inline-block mr-1">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                </svg>
                100% Secure Donations | SSL Encrypted
            </p>

            {/* Success Message (hidden by default) */}
            <div id="success-message" className="hidden bg-green-50 p-4 rounded-xl">
                <h3 className="text-green-700 font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                Thank You!
                </h3>
                <p className="text-green-600 mt-1">We&apos;ve emailed your receipt. God bless you!</p>
            </div>
            </form>

            {/* Treasurer Info */}
            <div className="bg-blue-50 rounded-2xl p-6 shadow-inner border border-blue-200">
            <div className="flex flex-col items-center mb-4">
                <img 
                src="/mobile/akos.jpg" 
                alt="Treasurer Priscilla Asante"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-300 mb-2"
                />
                <h3 className="text-xl font-bold text-blue-700">Need Help or Want to Pay?</h3>
            </div>
            
            <div className="space-y-4 text-gray-700">
                <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600 mr-2 mt-0.5">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
                <div>
                    <p className="font-medium">Available 24/7</p>
                    <p className="text-sm text-gray-600">Any day, any time</p>
                </div>
                </div>

                <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600 mr-2">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
                <div>
                    <p className="font-medium">Treasurer</p>
                    <p className="text-sm text-gray-600">Priscilla Asante</p>
                </div>
                </div>

                <a 
                href="tel:+233541107445" 
                className="flex items-center p-2 -mx-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600 mr-2">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-600 font-medium">+233 54 110 7445</span>
                </a>

                <a 
                href="https://wa.me/233541107445" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-2 -mx-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-600 mr-2">
                    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
                <span className="text-blue-600 font-medium">Chat on WhatsApp</span>
                </a>
            </div>

            <div className="mt-6 p-4 bg-white border border-dashed border-blue-300 rounded-xl">
                <p className="text-sm text-gray-600">
                <strong>Note:</strong> For Mobile Money payments, please use your full name as reference.
                </p>
            </div>

            <div className="mt-6 bg-white p-4 rounded-lg">
                <p className="text-sm italic text-gray-600 mb-2">
                &quot;Seeing how our donations helped build the youth center was priceless!&quot;
                </p>
                <p className="text-sm font-medium text-gray-700">— Mr Bright Asenso., Donor since 2020</p>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2">Monthly Goal</h4>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">GHS 7,500 of GHS 10,000 (75%)</p>
            </div>
            </div>
        </div>
        </section>
    );
}