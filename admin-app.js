// Admin Portal Application

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

function AdminApp() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [alert, setAlert] = React.useState(null);

    React.useEffect(() => {
        const auth = localStorage.getItem('cym_admin_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (password) => {
        if (password === 'admin') {
            localStorage.setItem('cym_admin_auth', 'true');
            setIsAuthenticated(true);
        } else {
            setAlert({ message: 'Incorrect Password', type: 'error' });
            setTimeout(() => setAlert(null), 3000);
        }
    };

    return (
        <div data-name="admin-app">
            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            
            {!isAuthenticated ? (
                <AdminLogin onLogin={handleLogin} />
            ) : (
                <AdminDashboard showAlert={(msg, type) => {
                    setAlert({ message: msg, type });
                    setTimeout(() => setAlert(null), 3000);
                }} />
            )}
        </div>
    );
}

function AdminLogin({ onLogin }) {
    const [pass, setPass] = React.useState('');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="card w-full max-w-sm text-center">
                <div className="w-12 h-12 bg-gray-800 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="icon-shield-check text-2xl"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Access</h2>
                <form onSubmit={(e) => { e.preventDefault(); onLogin(pass); }}>
                    <input 
                        type="password" 
                        placeholder="Enter Password" 
                        className="input-field mb-4 text-center"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn-primary w-full bg-gray-900 hover:bg-gray-800">
                        Unlock Portal
                    </button>
                </form>
                <div className="mt-6">
                    <a href="index.html" className="text-sm text-gray-500 hover:underline">Go to Member Portal</a>
                </div>
            </div>
        </div>
    );
}

function DetailsModal({ submission, onClose }) {
    if (!submission) return null;
    
    const { objectData } = submission;
    const data = JSON.parse(objectData.data_json || '{}');
    const devotions = data.devotions || {};
    const meetings = data.meetings || {};
    const notes = data.meeting_notes || {};

    const daysInMonth = new Date(objectData.year, objectData.month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const meetingLabels = {
        w12_discipleship: 'W12 Discipleship',
        cell_group: 'Cell Group',
        w12_meeting: 'W12 Meeting',
        sunday_services: 'Sunday Services',
        cym_night: 'CYM Night',
        thursday_training: 'Thursday Training',
        prayer_meeting: 'Prayer Meeting',
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <div className="flex items-center gap-2">
                             <h3 className="text-xl font-bold text-gray-900">{objectData.member_name}</h3>
                             {objectData.status === 'archived' && (
                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium border border-gray-200">Archived</span>
                             )}
                        </div>
                        <p className="text-sm text-gray-500">
                            {objectData.submission_type === 'mid' ? 'Mid-Month Report' : 'End-Month Report'} • 
                            {new Date(objectData.year, objectData.month - 1).toLocaleString('default', { month: 'long' })} {objectData.year}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <div className="icon-x text-xl text-gray-500"></div>
                    </button>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Devotion Section */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <div className="icon-book-open text-[var(--primary-color)]"></div>
                            Devotion Tracker ({objectData.devotion_count} Days)
                        </h4>
                        <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                            {daysArray.map(day => (
                                <div 
                                    key={day} 
                                    className={`
                                        aspect-square rounded flex items-center justify-center text-xs font-medium border
                                        ${devotions[day] 
                                            ? 'bg-green-100 text-green-700 border-green-200' 
                                            : 'bg-gray-50 text-gray-400 border-gray-100'}
                                    `}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meetings Section */}
                    {objectData.submission_type === 'end' && (
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="icon-users text-[var(--primary-color)]"></div>
                                Meeting Attendance
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="p-3 font-medium w-1/4">Meeting</th>
                                            {[1,2,3,4,5].map(w => <th key={w} className="p-3 text-center w-10">W{w}</th>)}
                                            <th className="p-3 text-left">List of Names / Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {Object.keys(meetingLabels).map(key => {
                                            const records = meetings[key] || [0,0,0,0,0];
                                            const note = notes[key] || '';
                                            return (
                                                <tr key={key}>
                                                    <td className="p-3 font-medium text-gray-700 align-top">{meetingLabels[key]}</td>
                                                    {records.map((r, i) => (
                                                        <td key={i} className="p-3 text-center align-top">
                                                            {r === 1 && <div className="w-6 h-6 rounded-full bg-green-500 mx-auto flex items-center justify-center" title="Present"><div className="icon-check text-white text-[10px]"></div></div>}
                                                            {r === 2 && <div className="w-6 h-6 rounded-full bg-red-500 mx-auto flex items-center justify-center" title="Absent"><div className="icon-x text-white text-[10px]"></div></div>}
                                                            {r === 0 && <span className="text-gray-300">-</span>}
                                                        </td>
                                                    ))}
                                                    <td className="p-3 align-top">
                                                        {note ? (
                                                            <div className="text-gray-600 whitespace-pre-wrap">{note}</div>
                                                        ) : (
                                                            <span className="text-gray-300 italic">No notes</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {objectData.submission_type === 'mid' && (
                        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm italic">
                            Meeting attendance is only available in End-Month reports.
                        </div>
                    )}
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="btn-secondary">Close</button>
                </div>
            </div>
        </div>
    );
}

function AdminDashboard({ showAlert }) {
    const today = new Date();
    const [month, setMonth] = React.useState(today.getMonth() + 1);
    const [year, setYear] = React.useState(today.getFullYear());
    const [typeFilter, setTypeFilter] = React.useState('all'); // all, mid, end
    const [showArchived, setShowArchived] = React.useState(false); // Toggle for archived items
    const [loading, setLoading] = React.useState(false);
    const [data, setData] = React.useState([]);
    const [stats, setStats] = React.useState({ total: 0, avgDevotion: 0, highestDevotion: 0 });
    const [selectedItem, setSelectedItem] = React.useState(null);

    React.useEffect(() => {
        fetchData();
    }, [month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await DB.getSubmissionsByDate(month, year);
            setData(result);
            calculateStats(result);
        } catch (error) {
            console.error(error);
            showAlert('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (items) => {
        // Only calculate stats for active items usually, but let's include all loaded for now or just active
        const activeItems = items.filter(i => i.objectData.status !== 'archived');
        
        if (activeItems.length === 0) {
            setStats({ total: 0, avgDevotion: 0, highestDevotion: 0 });
            return;
        }

        const totalDevotions = activeItems.reduce((acc, curr) => acc + (curr.objectData.devotion_count || 0), 0);
        const maxDevotion = Math.max(...activeItems.map(i => i.objectData.devotion_count || 0));

        setStats({
            total: activeItems.length,
            avgDevotion: Math.round(totalDevotions / activeItems.length),
            highestDevotion: maxDevotion
        });
    };
    
    // Action Handlers
    const handleArchive = async (id, currentStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus === 'archived' ? 'restore' : 'archive'} this submission?`)) return;
        
        try {
            if (currentStatus === 'archived') {
                await DB.restoreSubmission(id);
                showAlert('Submission restored successfully', 'success');
            } else {
                await DB.archiveSubmission(id);
                showAlert('Submission archived successfully', 'info');
            }
            fetchData();
        } catch (e) {
            console.error(e);
            showAlert('Action failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this submission? This cannot be undone.')) return;
        
        try {
            await DB.deleteSubmission(id);
            showAlert('Submission deleted permanently', 'success');
            fetchData();
        } catch (e) {
            console.error(e);
            showAlert('Delete failed', 'error');
        }
    };
    
    const filteredData = data.filter(item => {
        const matchesType = typeFilter === 'all' ? true : item.objectData.submission_type === typeFilter;
        const isArchived = item.objectData.status === 'archived';
        
        if (showArchived) {
             return matchesType && isArchived;
        } else {
             return matchesType && !isArchived;
        }
    });
    
    // Helper to get meeting count
    const getMeetingCount = (item, meetingKey) => {
        if (item.objectData.submission_type !== 'end') return '-';
        try {
            const data = JSON.parse(item.objectData.data_json);
            const meetings = data.meetings?.[meetingKey] || [];
            return meetings.filter(r => r === 1).length;
        } catch(e) { return '-'; }
    };

    // Helper to get notes for CSV
    const getMeetingNotes = (item, meetingKey) => {
        if (item.objectData.submission_type !== 'end') return '';
        try {
            const data = JSON.parse(item.objectData.data_json);
            return (data.meeting_notes?.[meetingKey] || '').replace(/,/g, ';').replace(/\n/g, ' '); // Clean for CSV
        } catch(e) { return ''; }
    };

    const exportCSV = () => {
        const meetingKeys = ['w12_discipleship', 'cell_group', 'w12_meeting', 'sunday_services', 'cym_night', 'thursday_training', 'prayer_meeting'];
        
        // Build headers: Name, Type, Devotion, [Meeting Count, Meeting Note]..., Date
        let headers = ['Name', 'Status', 'Type', 'Devotion Count'];
        meetingKeys.forEach(k => {
            headers.push(`${k} Count`);
            headers.push(`${k} Notes`);
        });
        headers.push('Submitted At', 'Year', 'Month');
        
        const rows = filteredData.map(item => {
            const basicInfo = [
                item.objectData.member_name,
                item.objectData.status || 'active',
                item.objectData.submission_type,
                item.objectData.devotion_count
            ];
            
            const meetingData = [];
            meetingKeys.forEach(k => {
                meetingData.push(getMeetingCount(item, k));
                meetingData.push(getMeetingNotes(item, k));
            });
            
            const metaInfo = [
                new Date(item.objectData.submitted_at).toLocaleDateString(),
                item.objectData.year,
                item.objectData.month
            ];
            
            return [...basicInfo, ...meetingData, ...metaInfo];
        });
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `cym_report_${year}_${month}_${showArchived ? 'archived' : 'active'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <Layout isAdmin title="Admin Dashboard">
            {loading && <Loading fullScreen />}
            {selectedItem && <DetailsModal submission={selectedItem} onClose={() => setSelectedItem(null)} />}
            
            {/* Filters */}
            <div className="card mb-8 flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                         <select 
                            value={month} 
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="input-field py-1"
                        >
                            {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                        </select>
                        <select 
                            value={year} 
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="input-field py-1"
                        >
                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    
                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                    
                    <div className="flex gap-2">
                        {['all', 'mid', 'end'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                                    typeFilter === t 
                                    ? 'bg-gray-900 text-white' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${showArchived ? 'bg-orange-500' : 'bg-gray-300'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${showArchived ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={showArchived} 
                            onChange={(e) => setShowArchived(e.target.checked)} 
                        />
                        <span className={`text-sm font-medium ${showArchived ? 'text-orange-600' : 'text-gray-500'}`}>
                            {showArchived ? 'Viewing Archived' : 'View Active'}
                        </span>
                    </label>

                    <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap">
                        <div className="icon-download text-sm"></div>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards (Hidden when archived) */}
            {!showArchived && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100">
                        <div className="text-blue-600 mb-2 font-medium">Total Active</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="card bg-gradient-to-br from-green-50 to-white border-green-100">
                        <div className="text-green-600 mb-2 font-medium">Avg. Devotion Days</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.avgDevotion}</div>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-100">
                        <div className="text-purple-600 mb-2 font-medium">Highest Devotion</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.highestDevotion}</div>
                    </div>
                </div>
            )}
            
            {showArchived && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3 text-orange-800">
                    <div className="icon-archive text-xl"></div>
                    <div>
                        <span className="font-bold">Archived View Mode</span> — You are viewing archived submissions. Restore them to include in main statistics.
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Name</th>
                                <th className="p-4 font-semibold text-center">Type</th>
                                <th className="p-4 font-semibold text-center">Devotion</th>
                                <th className="p-4 font-semibold text-center" title="W12 Discipleship">W12 D</th>
                                <th className="p-4 font-semibold text-center" title="Cell Group">Cell</th>
                                <th className="p-4 font-semibold text-center" title="W12 Meeting">W12 M</th>
                                <th className="p-4 font-semibold text-center" title="Sunday Services">Sun</th>
                                <th className="p-4 font-semibold text-center" title="CYM Night">CYM</th>
                                <th className="p-4 font-semibold text-center" title="Thursday Training">Thu</th>
                                <th className="p-4 font-semibold text-center" title="Prayer Meeting">Prayer</th>
                                <th className="p-4 font-semibold text-right">Submitted</th>
                                <th className="p-4 font-semibold text-center sticky right-0 bg-gray-50 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.objectId} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            {item.objectData.member_name}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                item.objectData.submission_type === 'mid' 
                                                ? 'bg-orange-100 text-orange-700' 
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                                {item.objectData.submission_type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold">{item.objectData.devotion_count}</span>
                                        </td>
                                        {/* Meeting Stats Columns */}
                                        <td className="p-4 text-center text-gray-600">{getMeetingCount(item, 'w12_discipleship')}</td>
                                        <td className="p-4 text-center text-gray-600">{getMeetingCount(item, 'cell_group')}</td>
                                        <td className="p-4 text-center text-gray-600">{getMeetingCount(item, 'w12_meeting')}</td>
                                        <td className="p-4 text-center text-gray-600">{getMeetingCount(item, 'sunday_services')}</td>
                                        <td className="p-4 text-center text-gray-600">{getMeetingCount(item, 'cym_night')}</td>
                                        <td className="p-4 text-center text-gray-600">{getMeetingCount(item, 'thursday_training')}</td>
                                        <td className="p-4 text-center text-gray-600">{getMeetingCount(item, 'prayer_meeting')}</td>
                                        
                                        <td className="p-4 text-right text-gray-500">
                                            {new Date(item.objectData.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-center sticky right-0 bg-white hover:bg-gray-50 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center justify-center gap-1">
                                                <button 
                                                    onClick={() => setSelectedItem(item)}
                                                    className="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <div className="icon-eye text-lg"></div>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleArchive(item.objectId, item.objectData.status)}
                                                    className={`p-1.5 rounded transition-colors ${
                                                        showArchived 
                                                        ? 'hover:bg-green-50 text-gray-400 hover:text-green-600' 
                                                        : 'hover:bg-orange-50 text-gray-400 hover:text-orange-600'
                                                    }`}
                                                    title={showArchived ? "Restore" : "Archive"}
                                                >
                                                    <div className={`icon-${showArchived ? 'refresh-ccw' : 'archive'} text-lg`}></div>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDelete(item.objectId)}
                                                    className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete Permanently"
                                                >
                                                    <div className="icon-trash-2 text-lg"></div>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="p-8 text-center text-gray-400">
                                        No {showArchived ? 'archived' : 'active'} submissions found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);