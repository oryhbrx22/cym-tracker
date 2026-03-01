function Alert({ message, type = 'info', onClose }) {
    if (!message) return null;

    const bgColors = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    };

    const icons = {
        success: 'circle-check',
        error: 'circle-alert',
        info: 'info',
        warning: 'triangle-alert'
    };

    return (
        <div className={`fixed top-4 right-4 z-50 animate-bounce-in`}>
            <div className={`flex items-center p-4 rounded-lg border shadow-md ${bgColors[type] || bgColors.info} min-w-[300px]`}>
                <div className={`icon-${icons[type] || 'info'} mr-3 text-lg`}></div>
                <div className="flex-1 text-sm font-medium">{message}</div>
                <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100">
                    <div className="icon-x text-sm"></div>
                </button>
            </div>
        </div>
    );
}
