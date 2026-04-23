import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleMobileMenuToggle = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onMobileMenuToggle={handleMobileMenuToggle} />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
