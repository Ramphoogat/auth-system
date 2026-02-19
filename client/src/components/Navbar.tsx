import { FiMenu, FiBell, FiSearch } from "react-icons/fi";
import ThemeComponent from "./ThemeComponent";
import DashboardSwitcher from "./DashboardSwitcher";
import NotificationCenter from "./NotificationCenter";
import { useNotifications } from "../context/NotificationContext";

interface NavbarProps {
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    showNotifications: boolean;
    setShowNotifications: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
    setIsMobileMenuOpen,
    showNotifications,
    setShowNotifications,
}) => {
    const { notifications: contextNotifications } = useNotifications();

    return (
        <header className="h-20 lg:h-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center space-x-2 md:space-x-4">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300"
                >
                    <FiMenu className="w-6 h-6" />
                </button>
                <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-900/50 rounded-2xl px-4 py-2 w-48 md:w-64 lg:w-96 border border-transparent focus-within:border-emerald-500/50 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all shadow-inner">
                    <FiSearch className="text-gray-400 w-4 h-4 shrink-0" />
                    <input
                        id="search-input"
                        name="search"
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm w-full ml-3 text-gray-700 dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-3 lg:space-x-6">
                <div className="block">
                    <DashboardSwitcher />
                </div>
                <div className="scale-90 sm:scale-100">
                    <ThemeComponent />
                </div>
                {/* Notification Bell Starts here */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifications(!showNotifications);
                        }}
                        className={`p-2 rounded-xl transition-all ${showNotifications ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                        <div className="relative">
                            <FiBell className="w-6 h-6" />
                            {contextNotifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                    {contextNotifications.length}
                                </span>
                            )}
                        </div>
                    </button>
                    {/* Notification Bell Ends here */}
                    {showNotifications && (
                        <NotificationCenter onClose={() => setShowNotifications(false)} />
                    )}

                </div>
            </div>
        </header>
    );
};

export default Navbar;
