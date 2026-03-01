function Loading({ fullScreen = false, text = "Loading..." }) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="icon-loader text-4xl text-[var(--primary-color)] animate-spin mb-3"></div>
                <p className="text-gray-500 font-medium animate-pulse">{text}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4">
            <div className="icon-loader text-2xl text-[var(--primary-color)] animate-spin mr-2"></div>
            <span className="text-gray-500">{text}</span>
        </div>
    );
}
