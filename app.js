// Member Portal Application

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                    <div className="icon-triangle-alert text-5xl text-red-500 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6 max-w-md">We encountered an unexpected error. Please try reloading the page.</p>
                    
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    const [user, setUser] = React.useState(null); // { name: string }
    const [loading, setLoading] = React.useState(false);
    const [alert, setAlert] = React.useState(null);

    // Initial check for stored user
    React.useEffect(() => {
        const storedName = localStorage.getItem('cym_member_name');
        if (storedName) {
            setUser({ name: storedName });
        }
    }, []);

    const handleLogin = (name) => {
        localStorage.setItem('cym_member_name', name);
        setUser({ name });
    };

    const showAlert = (msg, type = 'info') => {
        setAlert({ message: msg, type });
        setTimeout(() => setAlert(null), 3000);
    };

    return (
        <div data-name="app-container">
            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            
            {!user ? (
                <WelcomeScreen onJoin={handleLogin} />
            ) : (
                <TrackerDashboard user={user} showAlert={showAlert} />
            )}
        </div>
    );
}

function WelcomeScreen({ onJoin }) {
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        onJoin(name.trim());
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[var(--secondary-color)] to-white">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-green-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
                        <div className="icon-flame text-3xl"></div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, Leader!</h1>
                    <p className="text-gray-500 mt-2">Enter your name to start tracking your devotion and attendance.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <div className="icon-user text-lg"></div>
                            </div>
                            <input
                                type="text"
                                className="input-field pl-10"
                                placeholder="e.g. John Doe"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError('');
                                }}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 text-lg shadow-lg shadow-green-200/50">
                        Enter Dashboard
                    </button>
                </form>
                
                <div className="mt-8 text-center">
                    <a href="admin.html" className="text-sm text-gray-400 hover:text-[var(--primary-color)]">
                        Access Admin Portal
                    </a>
                </div>
            </div>
        </div>
    );
}

function TrackerDashboard({ user, showAlert }) {
    const today = new Date();
    const [month, setMonth] = React.useState(today.getMonth() + 1);
    const [year, setYear] = React.useState(today.getFullYear());
    const [loading, setLoading] = React.useState(false);
    
    // State for tracking
    const [pushEnabled, setPushEnabled] = React.useState(false);
    const [devotions, setDevotions] = React.useState({}); // { "1": true, "2": false ... }
    const [meetings, setMeetings] = React.useState({
        w12_discipleship: [0,0,0,0,0], // 0: none, 1: present, 2: absent
        cell_group: [0,0,0,0,0],
        w12_meeting: [0,0,0,0,0],
        sunday_services: [0,0,0,0,0],
        cym_night: [0,0,0,0,0],
        thursday_training: [0,0,0,0,0],
        prayer_meeting: [0,0,0,0,0]
    });
    const [meetingNotes, setMeetingNotes] = React.useState({}); // { w12_discipleship: "Name1, Name2..." }
    
    // Submission status
    const [status, setStatus] = React.useState({
        mid: false,
        end: false
    });

    // Load data on month/year change
    React.useEffect(() => {
        loadData();
        checkPushStatus();
    }, [month, year]);

    const checkPushStatus = async () => {
        const isSubscribed = await PushManager.checkSubscription();
        setPushEnabled(isSubscribed);
    };

    const handleEnablePush = async () => {
        // Ask user for the key since we can't hardcode it easily without backend envs in this static setup
        // For a better UX, we would normally fetch this from an API, but here we might need to rely on 
        // a configured constant or prompt. 
        // For this demo, I will use a placeholder constant in push.js and assume the developer replaces it.
        // Or I can ask the user to input it if it's missing.
        
        try {
            // Replace this with your actual VAPID Public Key generated from the openssl command
            const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_STRING_HERE'; 
            
            // Basic validation to prevent crash if key is not set
            if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_STRING_HERE' || VAPID_PUBLIC_KEY.length < 10) {
                alert("Please configure the VAPID Public Key in the code (app.js handleEnablePush) to enable push notifications.");
                return;
            }

            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await PushManager.subscribeUser(user.name, VAPID_PUBLIC_KEY);
                setPushEnabled(true);
                showAlert('Push notifications enabled!', 'success');
            } else {
                showAlert('Permission denied for notifications', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('Failed to enable push notifications', 'error');
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            // Get user submissions for this period
            const allSubmissions = await DB.getSubmissionsByDate(month, year);
            const mySubmissions = allSubmissions.filter(s => s.objectData.member_name.toLowerCase() === user.name.toLowerCase());
            
            const midSub = mySubmissions.find(s => s.objectData.submission_type === 'mid');
            const endSub = mySubmissions.find(s => s.objectData.submission_type === 'end');
            
            let newDevotions = {};
            let newMeetings = {
                w12_discipleship: [0,0,0,0,0],
                cell_group: [0,0,0,0,0],
                w12_meeting: [0,0,0,0,0],
                sunday_services: [0,0,0,0,0],
                cym_night: [0,0,0,0,0],
                thursday_training: [0,0,0,0,0],
                prayer_meeting: [0,0,0,0,0]
            };
            let newNotes = {};
            
            // Merge data from submissions if they exist
            if (midSub) {
                 const data = JSON.parse(midSub.objectData.data_json);
                 // Only take devotions 1-15 from mid sub
                 Object.keys(data.devotions || {}).forEach(d => {
                     if (parseInt(d) <= 15) newDevotions[d] = data.devotions[d];
                 });
            }
            
            if (endSub) {
                const data = JSON.parse(endSub.objectData.data_json);
                newDevotions = { ...newDevotions, ...(data.devotions || {}) };
                if (data.meetings) newMeetings = data.meetings;
                if (data.meeting_notes) newNotes = data.meeting_notes;
            }

            setDevotions(newDevotions);
            setMeetings(newMeetings);
            setMeetingNotes(newNotes);
            setStatus({
                mid: !!midSub,
                end: !!endSub
            });
            
        } catch (e) {
            console.error(e);
            showAlert('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleDevotion = (day) => {
        // Prevent editing if submitted
        if (day <= 15 && status.mid) return;
        if (status.end) return;

        setDevotions(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };
    
    const updateMeeting = (type, weekIndex) => {
        if (status.end) return;
        
        setMeetings(prev => {
            const newList = [...prev[type]];
            // Cycle: 0 (Gray/Null) -> 1 (Green/Present) -> 2 (Red/Absent) -> 0
            newList[weekIndex] = (newList[weekIndex] + 1) % 3;
            return {
                ...prev,
                [type]: newList
            };
        });
    };

    const updateMeetingNote = (type, value) => {
        if (status.end) return;
        setMeetingNotes(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleSubmit = async (type) => {
        if (!confirm(`Are you sure you want to submit your ${type}-month report? This cannot be undone.`)) return;
        
        setLoading(true);
        try {
            // Calculate counts
            const devotionCount = Object.values(devotions).filter(Boolean).length;
            
            const payload = {
                member_name: user.name,
                year: parseInt(year),
                month: parseInt(month),
                submission_type: type,
                devotion_count: devotionCount,
                data_json: JSON.stringify({
                    devotions,
                    meetings: type === 'end' ? meetings : null,
                    meeting_notes: type === 'end' ? meetingNotes : null
                }),
                submitted_at: new Date().toISOString()
            };

            await DB.saveSubmission(payload);
            showAlert(`${type === 'mid' ? 'Mid-Month' : 'End-Month'} Report Submitted Successfully!`, 'success');
            await loadData(); // Reload to lock fields
        } catch (e) {
            console.error(e);
            showAlert('Submission failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <Layout>
            {loading && <Loading fullScreen text="Syncing..." />}
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Hi, <span className="text-[var(--primary-color)]">{user.name}</span></h2>
                    <p className="text-sm sm:text-base text-gray-500">Track your progress for {monthNames[month-1]} {year}</p>
                </div>
                
                <div className="w-full sm:w-auto flex items-center gap-2">
                     {!pushEnabled && (
                        <button 
                            onClick={handleEnablePush}
                            className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                            title="Enable Push Notifications"
                        >
                            <div className="icon-bell text-sm"></div>
                            <span className="hidden sm:inline">Enable Notifications</span>
                        </button>
                    )}
                    
                    <div className="flex-1 sm:flex-none flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer px-2 w-full sm:w-auto"
                        >
                            {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                        </select>
                        <div className="w-px h-4 bg-gray-300 mx-2 flex-shrink-0"></div>
                        <select 
                            value={year} 
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer px-2"
                        >
                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between ${status.mid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Mid-Month</p>
                        <p className={`font-bold text-sm sm:text-base ${status.mid ? 'text-green-700' : 'text-gray-400'}`}>
                            {status.mid ? 'Submitted' : 'Pending'}
                        </p>
                    </div>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${status.mid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        <div className={`icon-${status.mid ? 'check' : 'clock'} text-base sm:text-lg`}></div>
                    </div>
                </div>
                <div className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between ${status.end ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">End-Month</p>
                        <p className={`font-bold text-sm sm:text-base ${status.end ? 'text-green-700' : 'text-gray-400'}`}>
                            {status.end ? 'Submitted' : 'Pending'}
                        </p>
                    </div>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${status.end ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        <div className={`icon-${status.end ? 'check' : 'clock'} text-base sm:text-lg`}></div>
                    </div>
                </div>
            </div>

            {/* Devotion Calendar */}
            <div className="card mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                        <div className="icon-book-open text-[var(--primary-color)]"></div>
                        Devotion Tracker
                    </h3>
                    <div className="text-xs sm:text-sm font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full whitespace-nowrap">
                        Total: {Object.values(devotions).filter(Boolean).length} Days
                    </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 sm:gap-4">
                    {['S','M','T','W','T','F','S'].map((d,i) => (
                        <div key={i} className="text-center text-[10px] sm:text-xs font-bold text-gray-400 mb-1 sm:mb-2">{d}</div>
                    ))}
                    {daysArray.map(day => {
                        const isMidPeriod = day <= 15;
                        const isLocked = (isMidPeriod && status.mid) || status.end;
                        const isChecked = !!devotions[day];
                        
                        return (
                            <button
                                key={day}
                                onClick={() => toggleDevotion(day)}
                                disabled={isLocked}
                                className={`
                                    aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all
                                    ${isChecked 
                                        ? 'bg-[var(--primary-color)] text-white shadow-sm sm:shadow-md shadow-green-200' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
                                    ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                                `}
                            >
                                {day}
                                {isChecked && <div className="icon-check text-[10px] sm:text-xs mt-0.5 sm:mt-1"></div>}
                            </button>
                        );
                    })}
                </div>
                
                {/* Mid Month Submit Action */}
                {!status.mid && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex justify-end">
                        <button 
                            onClick={() => handleSubmit('mid')}
                            disabled={status.end} // Cannot sub
