import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
            {/* Navigation / Header */}
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <span className="font-semibold text-xl tracking-tight">CollabSpace</span>
                </div>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Login
                </Link>
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-4 min-h-[80vh] flex flex-col items-center justify-center">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                        Workspaces, simplified.
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Book seats, manage meeting rooms, and understand your office utilization with a fast, modern platform built for teams.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium rounded-lg transition-colors shadow-sm"
                        >
                            Book a Room
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white border-y border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-16 text-gray-900">
                        Everything you need to run your office
                    </h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Booking</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Book seats and rooms instantly with live availability updates.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-tenant SaaS</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Secure organization-based access with complete data isolation.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Maps</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Floor plan view with interactive seat selection and status indicators.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Track utilization rates, booking patterns, and workspace insights.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} CollabSpace. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
