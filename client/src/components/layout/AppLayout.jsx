import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleMobileMenuToggle = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-gray-900">
            <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />
            
            <div className="flex-1 flex flex-col">
                <Navbar onMobileMenuToggle={handleMobileMenuToggle} />
                
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
