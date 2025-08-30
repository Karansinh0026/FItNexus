import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="bg-white">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="lg:flex lg:items-center lg:gap-12">
            <div className="lg:w-1/2">
              {/* <div className="mb-6">
                <span className="inline-block bg-slate-200 px-3 py-1 text-sm text-slate-700 rounded">
                  Fitness Management Platform
                </span>
              </div> */}
              <h1 className="text-4xl font-semibold text-gray-900 mb-6 lg:text-5xl">
                Connect with your local gyms
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Find gyms near you, manage your memberships, and track your fitness progress. 
                For gym owners, grow your business with our management tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-slate-800 text-white px-6 py-3 rounded text-center font-medium hover:bg-slate-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link 
                  to="/login" 
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded text-center font-medium hover:bg-slate-200 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="bg-white border border-gray-600
               rounded-lg p-4">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Fitness community"
                  className="w-full rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-semibold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Gyms Registered</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What we offer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple tools for gym members and owners to connect and grow together.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded p-6">
              <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">For Members</h3>
              <p className="text-gray-600 mb-4">
                Find gyms near you, manage your memberships, and track your attendance. 
                Stay motivated with progress tracking.
              </p>
              <Link to="/register" className="text-sm text-slate-700 hover:text-slate-900 font-medium">
                Join as member →
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded p-6">
              <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">For Gym Owners</h3>
              <p className="text-gray-600 mb-4">
                Register your gym, manage memberships, and grow your business. 
                Handle requests and track member attendance.
              </p>
              <Link to="/register" className="text-sm text-slate-700 hover:text-slate-900 font-medium">
                Register your gym →
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded p-6">
              <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quality Verified</h3>
              <p className="text-gray-600 mb-4">
                All gyms are verified by our team. We check facilities and maintain 
                a trusted network of fitness providers.
              </p>
              <Link to="/gyms" className="text-sm text-slate-700 hover:text-slate-900 font-medium">
                Browse gyms →
              </Link>
            </div>
          </div>
        </div>
      </div>

             {/* Testimonials Section */}
       <div className="bg-white py-16">
         <div className="mx-auto max-w-6xl px-6">
           <div className="text-center mb-12">
             <h2 className="text-2xl font-semibold text-gray-900 mb-4">
               What people say
             </h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="border border-gray-200 rounded p-6">
               <div className="flex items-center mb-4">
                 <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                   <span className="text-sm font-medium text-slate-700">S</span>
                 </div>
                 <div>
                   <div className="font-medium text-gray-900">Karansinh Sarvaiya</div>
                   <div className="text-sm text-gray-600">Member</div>
                 </div>
               </div>
               <p className="text-gray-600 text-sm">
                 "Easy to find gyms near my office. The membership management works great."
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <div className="flex items-center mb-4">
                 <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                   <span className="text-sm font-medium text-slate-700">M</span>
                 </div>
                 <div>
                   <div className="font-medium text-gray-900">Anish Patel</div>
                   <div className="text-sm text-gray-600">Gym Owner</div>
                 </div>
               </div>
               <p className="text-gray-600 text-sm">
                 "Membership increased by 40% since joining. The platform is user-friendly."
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <div className="flex items-center mb-4">
                 <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                   <span className="text-sm font-medium text-slate-700">A</span>
                 </div>
                 <div>
                   <div className="font-medium text-gray-900">Milav</div>
                   <div className="text-sm text-gray-600">Member</div>
                 </div>
               </div>
               <p className="text-gray-600 text-sm">
                 "Attendance tracking keeps me motivated. Love seeing my progress."
               </p>
             </div>
           </div>
         </div>
       </div>

       {/* How It Works Section */}
       <div className="bg-gray-50 py-16">
         <div className="mx-auto max-w-6xl px-6">
           <div className="text-center mb-12">
             <h2 className="text-2xl font-semibold text-gray-900 mb-4">
               How it works
             </h2>
             <p className="text-gray-600 max-w-2xl mx-auto">
               Simple steps to get started with FitNexus
             </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             <div className="text-center">
               <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-lg font-semibold text-slate-700">1</span>
               </div>
               <h3 className="font-medium text-gray-900 mb-2">Create Account</h3>
               <p className="text-sm text-gray-600">
                 Sign up as a member or gym owner in just a few minutes
               </p>
             </div>
             <div className="text-center">
               <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-lg font-semibold text-slate-700">2</span>
               </div>
               <h3 className="font-medium text-gray-900 mb-2">Find or Register</h3>
               <p className="text-sm text-gray-600">
                 Members browse gyms, owners register their facilities
               </p>
             </div>
             <div className="text-center">
               <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-lg font-semibold text-slate-700">3</span>
               </div>
               <h3 className="font-medium text-gray-900 mb-2">Connect</h3>
               <p className="text-sm text-gray-600">
                 Join memberships and start managing your fitness journey
               </p>
             </div>
             <div className="text-center">
               <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-lg font-semibold text-slate-700">4</span>
               </div>
               <h3 className="font-medium text-gray-900 mb-2">Track Progress</h3>
               <p className="text-sm text-gray-600">
                 Monitor attendance, manage memberships, and stay motivated
               </p>
             </div>
           </div>
         </div>
       </div>

       {/* Benefits Section */}
       <div className="bg-white py-16">
         <div className="mx-auto max-w-6xl px-6">
           <div className="text-center mb-12">
             <h2 className="text-2xl font-semibold text-gray-900 mb-4">
               Why choose FitNexus?
             </h2>
             <p className="text-gray-600 max-w-2xl mx-auto">
               Built for the modern fitness community
             </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="border border-gray-200 rounded p-6">
               <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                 <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
               </div>
               <h3 className="font-medium text-gray-900 mb-3">Secure & Private</h3>
               <p className="text-gray-600 text-sm">
                 Your data is protected with industry-standard security measures
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                 <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <h3 className="font-medium text-gray-900 mb-3">Fast & Reliable</h3>
               <p className="text-gray-600 text-sm">
                 Quick access to gym information and instant membership management
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                 <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                 </svg>
               </div>
               <h3 className="font-medium text-gray-900 mb-3">Community Focused</h3>
               <p className="text-gray-600 text-sm">
                 Connect with local fitness enthusiasts and gym owners
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                 <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
               </div>
               <h3 className="font-medium text-gray-900 mb-3">Analytics & Insights</h3>
               <p className="text-gray-600 text-sm">
                 Track your progress with detailed analytics and reports
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                 <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                 </svg>
               </div>
               <h3 className="font-medium text-gray-900 mb-3">24/7 Access</h3>
               <p className="text-gray-600 text-sm">
                 Manage your fitness journey anytime, anywhere
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mb-4">
                 <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                 </svg>
               </div>
               <h3 className="font-medium text-gray-900 mb-3">Support Team</h3>
               <p className="text-gray-600 text-sm">
                 Get help when you need it with our dedicated support
               </p>
             </div>
           </div>
         </div>
       </div>

       {/* FAQ Section */}
       <div className="bg-gray-50 py-16">
         <div className="mx-auto max-w-6xl px-6">
           <div className="text-center mb-12">
             <h2 className="text-2xl font-semibold text-gray-900 mb-4">
               Frequently asked questions
             </h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="border border-gray-200 rounded p-6">
               <h3 className="font-medium text-gray-900 mb-3">How do I join a gym?</h3>
               <p className="text-gray-600 text-sm">
                 Browse available gyms, select a membership plan, and submit your request. The gym owner will review and approve your membership.
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <h3 className="font-medium text-gray-900 mb-3">How do I register my gym?</h3>
               <p className="text-gray-600 text-sm">
                 Create an account as a gym owner, fill in your gym details, and submit for approval. Our admin team will review and approve your registration.
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <h3 className="font-medium text-gray-900 mb-3">Is my data secure?</h3>
               <p className="text-gray-600 text-sm">
                 Yes, we use industry-standard security measures to protect your personal information and membership data.
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <h3 className="font-medium text-gray-900 mb-3">Can I cancel my membership?</h3>
               <p className="text-gray-600 text-sm">
                 Yes, you can manage your memberships through your dashboard. Contact the gym owner for any specific cancellation policies.
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <h3 className="font-medium text-gray-900 mb-3">How does attendance tracking work?</h3>
               <p className="text-gray-600 text-sm">
                 Members can mark their attendance once per day at their gym. This helps track progress and maintain motivation.
               </p>
             </div>
             <div className="border border-gray-200 rounded p-6">
               <h3 className="font-medium text-gray-900 mb-3">What if I have technical issues?</h3>
               <p className="text-gray-600 text-sm">
                 Our support team is here to help. Contact us through the platform or email for assistance with any technical problems.
               </p>
             </div>
           </div>
         </div>
       </div>

      {/* CTA Section */}
      <div className="bg-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our community of gym members and owners. Start your fitness journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-slate-800 px-6 py-3 rounded font-medium hover:bg-gray-100 transition-colors"
              >
                Create Account
              </Link>
              <Link to="/gyms" className="border border-gray-400 text-white px-6 py-3 rounded font-medium hover:bg-gray-700 transition-colors">
                Browse Gyms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; 2024 FitNexus. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/gyms" className="text-gray-400 hover:text-gray-300 text-sm">
                Browse Gyms
              </Link>
              <Link to="/register" className="text-gray-400 hover:text-gray-300 text-sm">
                Register
              </Link>
              <Link to="/login" className="text-gray-400 hover:text-gray-300 text-sm">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
