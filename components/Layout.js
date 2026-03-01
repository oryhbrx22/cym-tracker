function Layout({ children, title, isAdmin = false }) {
    const handleLogout = () => {
        if (isAdmin) {
            localStorage.removeItem('cym_admin_auth');
            window.location.reload();
        } else {
            localStorage.removeItem('cym_member_name');
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-200 flex-shrink-0">
                            <div className="icon-flame text-lg"></div>
                        </div>
                        <h1 className="font-bold text-base sm:text-lg tracking-tight text-gray-900 truncate">
                            CYM Tracker <span className="text-[var(--primary-color)] font-normal hidden sm:inline">| {isAdmin ? 'Admin Portal' : 'Member Portal'}</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                         {!isAdmin && (
                            <a href="admin.html" className="text-sm text-gray-500 hover:text-[var(--primary-color)] transition-colors hidden md:block">
                                Admin Login
                            </a>
                        )}
                        {isAdmin && (
                             <a href="index.html" className="text-sm text-gray-500 hover:text-[var(--primary-color)] transition-colors hidden md:block">
                                Member View
                            </a>
                        )}

                        <button 
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Logout / Switch User"
                        >
                            <div className="icon-log-out text-xl"></div>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {title && <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>}
                {children}
            </main>

            <footer className="bg-white border-t border-gray-100 py-6 mt-8">
                <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
                    <p>&copy; 2026 CYM Leaders’ Tracker. Built for simple and effective leadership tracking.</p>
                </div>
            </footer>
        </div>
    );
}
