import React, { useState, useEffect, useRef } from 'react';

// --- ENHANCED MOCK DATA ---
const MOCK_DRONES = [
    { id: 'SCT-SW-01', type: 'Scout Swarm', status: 'Scanning Area', battery: 82, batteryHealth: 'Good', range: '5 km', connectivity: 'Strong', position: { lat: 28.6139, lng: 77.2090 }, speed: 45, altitude: 120, issue: null },
    { id: 'PAY-LD-01', type: 'Payload', status: 'Delivering Medkit', battery: 98, batteryHealth: 'Good', range: '4.8 km', connectivity: 'Strong', position: { lat: 28.6339, lng: 77.2190 }, speed: 60, altitude: 90, issue: null },
    { id: 'SCT-SW-02', type: 'Scout Swarm', status: 'Idle', battery: 100, batteryHealth: 'Good', range: '5 km', connectivity: 'Excellent', position: { lat: 28.6300, lng: 77.2150 }, speed: 0, altitude: 0, issue: null },
    { id: 'PAY-LD-02', type: 'Payload', status: 'Returning to Base', battery: 67, batteryHealth: 'Degraded', range: '2.1 km', connectivity: 'Weak', position: { lat: 28.5839, lng: 77.2390 }, speed: 55, altitude: 100, issue: 'Battery health degraded. Recommend maintenance.' },
    { id: 'SCT-SW-03', type: 'Scout Swarm', status: 'Charging', battery: 45, batteryHealth: 'Good', range: 'N/A', connectivity: 'N/A', position: { lat: 28.6539, lng: 77.1890 }, speed: 0, altitude: 0, issue: null },
    { id: 'PAY-LD-03', type: 'Payload', status: 'ERROR', battery :15, batteryHealth: 'Critical', range: '0.5 km', connectivity: 'Lost', position: { lat: 28.60, lng: 77.23 }, speed: 5, altitude: 20, issue: 'Rotor 3 Malfunction. Immediate landing initiated.' },
];

const MOCK_POIS = [ // Points of Interest for the map
    { id: 'poi-1', type: 'High Prone Area', label: 'Flood Zone A', position: { lat: 28.625, lng: 77.235 } },
    { id: 'poi-2', type: 'Survivor Sighting', label: '3 Individuals', position: { lat: 28.61, lng: 77.19 } },
    { id: 'poi-3', type: 'Infrastructure Damage', label: 'Bridge Collapse', position: { lat: 28.59, lng: 77.22 } },
];

const MOCK_MISSIONS = [
    { id: 'MSN-101', type: 'Reconnaissance', status: 'Active', progress: 65, droneId: 'SCT-SW-01', eta: '12 mins' },
    { id: 'MSN-102', type: 'Supply Drop', status: 'Completed', progress: 100, droneId: 'PAY-LD-01', eta: '0 mins' },
    { id: 'MSN-103', type: 'Area Scan', status: 'Queued', progress: 0, droneId: 'SCT-SW-02', eta: 'N/A' },
];

const MOCK_INITIAL_SUPPLY_REQUESTS = [
    { id: 'REQ-101', item: 'Medicines', priority: 'Critical', status: 'Delivered' },
    { id: 'REQ-102', item: 'First Aid', priority: 'High', status: 'In-Flight' },
    { id: 'REQ-103', item: 'Food & Water', priority: 'Normal', status: 'Pending' },
];

const MOCK_INVENTORY = [
    { name: 'Medicines', stock: 85, capacity: 100, unit: 'kits' },
    { name: 'Food & Water', stock: 60, capacity: 100, unit: 'kg' },
    { name: 'First Aid Kits', stock: 92, capacity: 100, unit: 'kits' },
    { name: 'Communication Devices', stock: 40, capacity: 50, unit: 'units' },
];

const MOCK_TEAM = [
    { name: 'Aditya Sharma', role: 'Team Lead', status: 'online' },
    { name: 'Priya Singh', role: 'Drone Pilot', status: 'online' },
    { name: 'Rohan Mehta', role: 'Medic', status: 'offline' },
    { name: 'Sneha Gupta', role: 'Logistics', status: 'online' },
    { name: 'NDRF Unit 7', role: 'Ground Team', status: 'standby'},
    { name: 'Medical Team B', role: 'Field Hospital', status: 'active'}
];

const MOCK_CHAT = [
    { sender: 'Priya Singh', message: 'SCT-SW-01 has reached waypoint 3. Starting thermal scan.', time: '10:45 AM' },
    { sender: 'Aditya Sharma', message: 'Copy that. Any signs of survivors?', time: '10:46 AM' },
    { sender: 'Priya Singh', message: 'Heat signatures detected in the north-east quadrant. Sending coordinates.', time: '10:47 AM' },
    { sender: 'You', message: 'Excellent work. PAY-LD-02, prepare for first aid drop at those coordinates.', time: '10:48 AM' },
];


// --- ICONS ---
const ICONS = {
    logo: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z",
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    map: "M20.5 3l-6.5 18-6.5-18L20.5 3zM12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
    supply: "M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z",
    droneControl: "M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4l4-4-4-4v4h-4.35z",
    missionStatus: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    teamChat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
    sos: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    inventory: "M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z",
    settings: "M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61-.25-1.17-.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19-.15-.24-.42-.12-.64l2 3.46c.12-.22.39.3.61-.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    fire: "M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z",
    flood: "M12 2.5c-4.69 0-8.5 3.81-8.5 8.5 0 2.54 1.12 4.82 2.91 6.44.52.48 1.07.93 1.65 1.34.28.2.56.4.84.58.3.18.6.35.91.5.31.15.62.29.94.41.32.12.65.22.98.31.34.09.68.16 1.03.21.35.05.7.08 1.05.08s.7-.03 1.05-.08c.35-.05.69-.12 1.03-.21.33-.09.66-.19.98-.31.32-.12.63-.26.94-.41.31-.15.61-.32.91-.5.28-.18.56-.38.84-.58.58-.41 1.13-.86 1.65-1.34 1.79-1.62 2.91-3.9 2.91-6.44C20.5 6.31 16.69 2.5 12 2.5zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z",
    collapse: "M2 17h2v2H2v-2zm4 0h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM4 2H2v2h2V2zm16 0h-2v2h2V2zM12 2c-5.52 0-10 4.48-10 10h2c0-4.42 3.58-8 8-8s8 3.58 8 8h2c0-5.52-4.48-10-10-10zm-4 4H6v2h2V6zm8 0h-2v2h2V6zm-4 0h-2v2h2V6z",
    send: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
};
const Icon = ({ path, className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d={path} /></svg>);

// --- GOOGLE MAPS LOADER HOOK ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const useGoogleMapsScript = (apiKey) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_GOES_HERE") {
            setError(true);
            return;
        }
        if (window.google?.maps) {
            setIsLoaded(true);
            return;
        }
        
        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => setError(true);
        document.head.appendChild(script);

    }, [apiKey]);
    return { isLoaded, loadError: error };
};


// --- SCREEN COMPONENTS ---

const LoginScreen = ({ onLogin, onBypass }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-blue-500/20">
            <div className="text-center">
                <Icon path={ICONS.logo} className="w-16 h-16 mx-auto text-blue-400" />
                <h1 className="text-4xl font-bold text-blue-300 mt-4">RescueConnect</h1>
                <p className="mt-2 text-blue-400">Drone-Powered Emergency Response</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-6">
                <div>
                    <label className="text-sm font-bold text-blue-300">Username</label>
                    <input type="text" defaultValue="ops_lead" className="w-full p-3 mt-1 text-gray-200 bg-slate-700/50 border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                    <label className="text-sm font-bold text-blue-300">Password</label>
                    <input type="password" defaultValue="password123" className="w-full p-3 mt-1 text-gray-200 bg-slate-700/50 border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="space-y-4 pt-2">
                    <button type="submit" className="w-full p-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300">Login</button>
                    <button type="button" onClick={onBypass} className="w-full p-3 font-bold text-yellow-200 bg-red-600/80 rounded-md hover:bg-red-700/80 transition-colors duration-300 flex items-center justify-center gap-2">
                        <Icon path={ICONS.sos} className="w-5 h-5" />Emergency Bypass
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const DashboardScreen = ({ onNavigate }) => (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-200 mb-2">Dashboard</h1>
        <p className="text-blue-400 mb-6">Welcome, Operations Lead. Current time in India: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        <div className="flex justify-around p-4 mb-8 bg-slate-800 rounded-lg border border-blue-500/20">
            <div className="text-center"><p className="text-2xl font-bold text-blue-300">{MOCK_DRONES.filter(d => d.status.toLowerCase() !== 'idle' && d.status.toLowerCase() !== 'charging').length}</p><p className="text-xs text-blue-400 uppercase">Active Drones</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-blue-300">{MOCK_MISSIONS.filter(m => m.status === 'Active').length}</p><p className="text-xs text-blue-400 uppercase">Active Missions</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-blue-300">87%</p><p className="text-xs text-blue-400 uppercase">Avg. Battery</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <button onClick={() => onNavigate('map')} className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-blue-600/50 transition-colors border border-blue-500/20 shadow-lg"><Icon path={ICONS.map} className="w-10 h-10 mb-2 text-blue-300" /><span className="text-sm text-center">Live Map</span></button>
            <button onClick={() => onNavigate('supply')} className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-blue-600/50 transition-colors border border-blue-500/20 shadow-lg"><Icon path={ICONS.supply} className="w-10 h-10 mb-2 text-blue-300" /><span className="text-sm text-center">Request Supplies</span></button>
            <button onClick={() => onNavigate('control')} className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-blue-600/50 transition-colors border border-blue-500/20 shadow-lg"><Icon path={ICONS.droneControl} className="w-10 h-10 mb-2 text-blue-300" /><span className="text-sm text-center">Drone Control</span></button>
            <button onClick={() => onNavigate('missions')} className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-blue-600/50 transition-colors border border-blue-500/20 shadow-lg"><Icon path={ICONS.missionStatus} className="w-10 h-10 mb-2 text-blue-300" /><span className="text-sm text-center">Mission Status</span></button>
            <button onClick={() => onNavigate('chat')} className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-blue-600/50 transition-colors border border-blue-500/20 shadow-lg"><Icon path={ICONS.teamChat} className="w-10 h-10 mb-2 text-blue-300" /><span className="text-sm text-center">Team Chat</span></button>
            <button onClick={() => onNavigate('sos')} className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-red-600/50 transition-colors border border-red-500/20 shadow-lg"><Icon path={ICONS.sos} className="w-10 h-10 mb-2 text-red-400" /><span className="text-sm text-center">Emergency SOS</span></button>
        </div>
    </div>
);

const LiveMapScreen = () => {
    const mapRef = useRef(null);
    const { isLoaded, loadError } = useGoogleMapsScript(GOOGLE_MAPS_API_KEY);

    useEffect(() => {
        if (!isLoaded || !mapRef.current || !window.google) return;
        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 28.6139, lng: 77.2090 },
            zoom: 12,
            disableDefaultUI: true,
            styles: [ { "featureType": "all", "elementType": "labels.text.fill", "stylers": [ { "color": "#ffffff" } ] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [ { "visibility": "on" }, { "color": "#3e606f" }, { "weight": 2 }, { "gamma": 0.84 } ] }, { "featureType": "all", "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] }, { "featureType": "administrative", "elementType": "geometry", "stylers": [ { "weight": 0.6 }, { "color": "#1a3541" } ] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [ { "color": "#2c5a71" } ] }, { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#406d80" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#2c5a71" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#29768a" }, { "lightness": -37 } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#406d80" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#193341" } ] } ]
        });

        const infoWindow = new window.google.maps.InfoWindow({ content: '', pixelOffset: new window.google.maps.Size(0, -30) });

        MOCK_DRONES.forEach(d => {
            const marker = new window.google.maps.Marker({
                position: d.position, map,
                icon: {
                    path: d.type === 'Scout Swarm' ? window.google.maps.SymbolPath.CIRCLE : 'M21 15.46l-5.27-.61-2.52 2.52c-2.83-1.44-5.15-3.75-6.59-6.59l2.53-2.53L8.54 3H3.03C2.45 13.18 10.82 21.55 21 20.97v-5.51z',
                    scale: d.type === 'Scout Swarm' ? 6 : 1.2,
                    fillColor: d.type === 'Scout Swarm' ? '#3b82f6' : '#22c55e', fillOpacity: 1, strokeColor: 'white', strokeWeight: 1.5,
                    anchor: new window.google.maps.Point(d.type === 'Scout Swarm' ? 0 : 12, d.type === 'Scout Swarm' ? 0 : 12),
                }
            });
             marker.addListener('click', () => {
                infoWindow.setContent(`<div class="text-black p-1"><p class="font-bold">${d.id}</p><p>${d.status} - ${d.battery}%</p></div>`);
                infoWindow.open(map, marker);
            });
        });

        MOCK_POIS.forEach(poi => {
            const icons = {
                'High Prone Area': { color: '#ef4444', path: window.google.maps.SymbolPath.CIRCLE },
                'Survivor Sighting': { color: '#facc15', path: 'M12,1L9,9h6z M12,14c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S14.2,14,12,14z' },
                'Infrastructure Damage': { color: '#a855f7', path: 'M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h14v-8h3L12 3z'}
            };
            const marker = new window.google.maps.Marker({
                position: poi.position, map,
                icon: {
                    path: icons[poi.type].path,
                    scale: poi.type === 'High Prone Area' ? 20 : (poi.type === 'Survivor Sighting' ? 1.5 : 1),
                    fillColor: icons[poi.type].color, fillOpacity: poi.type === 'High Prone Area' ? 0.3 : 1, strokeColor: icons[poi.type].color, strokeWeight: 2,
                    anchor: new window.google.maps.Point(poi.type === 'Survivor Sighting' ? 12 : 0, poi.type === 'Survivor Sighting' ? 12 : 0),
                }
            });
             marker.addListener('click', () => {
                infoWindow.setContent(`<div class="text-black p-1"><p class="font-bold">${poi.type}</p><p>${poi.label}</p></div>`);
                infoWindow.open(map, marker);
            });
        });
    }, [isLoaded]);

    return (
        <div className="p-8 flex flex-col h-full">
            <h1 className="text-3xl font-bold text-gray-200 mb-6">Live Drone Map</h1>
            <div className="flex-grow relative bg-slate-800 rounded-lg shadow-inner overflow-hidden border-2 border-slate-700">
                {loadError && (
                     <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                        <Icon path={ICONS.sos} className="w-16 h-16 text-red-500 mb-4"/>
                        <h2 className="text-2xl font-bold text-red-400">Map Failed to Load</h2>
                        <p className="text-slate-300 mt-2 text-center max-w-sm">Please ensure you have replaced the placeholder API key with a valid Google Maps API key.</p>
                    </div>
                )}
                {!isLoaded && !loadError && <div className="flex items-center justify-center h-full">Loading Map...</div>}
                <div ref={mapRef} className="w-full h-full" />
            </div>
        </div>
    );
};

const SupplyRequestScreen = () => {
    const [requests, setRequests] = useState(MOCK_INITIAL_SUPPLY_REQUESTS);
    const [priority, setPriority] = useState('Normal');
    const [submissionStatus, setSubmissionStatus] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newRequest = {
            id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
            item: formData.get('supplyType'),
            priority: priority,
            status: 'Pending',
        };
        setRequests(prev => [newRequest, ...prev]);
        setSubmissionStatus('Success! Request logged.');
        setTimeout(() => setSubmissionStatus(null), 3000);
        e.target.reset();
        setPriority('Normal');
    };

    const getPriorityColor = (p) => {
        if (p === 'Critical') return 'bg-red-500 border-red-400';
        if (p === 'High') return 'bg-yellow-500 border-yellow-400';
        return 'bg-blue-500 border-blue-400';
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-200 mb-6">Supply Request</h1>
            {submissionStatus && <div className="mb-4 p-3 text-center bg-green-600/50 border border-green-500 rounded-lg">{submissionStatus}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 bg-slate-800 rounded-lg border border-blue-500/20">
                    <h2 className="text-xl font-bold mb-4">New Request</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-bold text-blue-300">Supply Type</label>
                            <select name="supplyType" required className="w-full p-3 mt-1 text-gray-200 bg-slate-700 border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <option>Medicines</option><option>Food & Water</option><option>First Aid</option><option>Communication</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-blue-300">Priority</label>
                            <div className="flex justify-around mt-2 p-1 bg-slate-700 rounded-md">
                                {['Critical', 'High', 'Normal'].map(p => (
                                    <button type="button" key={p} onClick={() => setPriority(p)} className={`w-full py-2 rounded text-sm font-semibold transition-colors ${priority === p ? (p === 'Critical' ? 'bg-red-600' : p === 'High' ? 'bg-yellow-500 text-slate-900' : 'bg-blue-600') : 'hover:bg-slate-600'}`}>{p}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-blue-300">Quantity (1kg - 5kg)</label>
                            <input name="quantity" type="range" min="1" max="5" defaultValue="2.5" step="0.5" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-blue-300">Location</label>
                            <input name="location" type="text" placeholder="Enter coordinates or drop pin on map" required className="w-full p-3 mt-1 text-gray-200 bg-slate-700 border border-blue-500/30 rounded-md" />
                        </div>
                        <button type="submit" className="w-full p-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Submit Request</button>
                    </form>
                </div>
                <div className="p-6 bg-slate-800 rounded-lg border border-blue-500/20">
                    <h2 className="text-xl font-bold mb-4">Recent Requests</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {requests.map(req => (
                            <div key={req.id} className="p-3 bg-slate-700 rounded-lg flex justify-between items-center">
                                <div><p className="font-bold">{req.item}</p><p className="text-xs text-slate-400">{req.id}</p></div>
                                <div><span className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(req.priority)}`}>{req.priority}</span></div>
                                <p className="text-sm">{req.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DroneMissionControlScreen = () => {
    const [selectedDrone, setSelectedDrone] = useState(MOCK_DRONES[0]);
    const mapRef = useRef(null);
    const { isLoaded, loadError } = useGoogleMapsScript(GOOGLE_MAPS_API_KEY);

    useEffect(() => {
        if (!isLoaded || !mapRef.current || !window.google || !selectedDrone) return;

        const map = new window.google.maps.Map(mapRef.current, {
            center: selectedDrone.position,
            zoom: 18,
            disableDefaultUI: true,
            mapTypeId: 'satellite',
            tilt: 45
        });

        new window.google.maps.Marker({
            position: selectedDrone.position,
            map,
            icon: {
                path: 'M21 15.46l-5.27-.61-2.52 2.52c-2.83-1.44-5.15-3.75-6.59-6.59l2.53-2.53L8.54 3H3.03C2.45 13.18 10.82 21.55 21 20.97v-5.51z',
                scale: 1.5,
                fillColor: '#facc15',
                fillOpacity: 1,
                strokeColor: 'black',
                strokeWeight: 1,
                anchor: new window.google.maps.Point(12, 12),
            }
        });

    }, [isLoaded, selectedDrone]);


    const StatItem = ({ label, value, color = 'text-blue-300' }) => (
        <div className="p-3 bg-slate-700 rounded-lg text-center">
            <p className="text-xs text-slate-400 uppercase">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
    );

    return (
        <div className="flex h-full">
            <div className="w-1/3 bg-slate-800 p-4 overflow-y-auto border-r border-slate-700">
                <h2 className="text-xl font-bold mb-4">Fleet Status</h2>
                <div className="space-y-2">
                    {MOCK_DRONES.map(d => (
                        <div key={d.id} onClick={() => setSelectedDrone(d)} className={`p-3 rounded-lg cursor-pointer border-l-4 ${selectedDrone.id === d.id ? 'bg-blue-600/80 border-blue-400' : 'bg-slate-700 border-transparent hover:bg-slate-600'}`}>
                            <p className="font-bold">{d.id}</p>
                            <p className="text-sm">{d.type}</p>
                            <p className={`text-xs ${d.status === 'ERROR' ? 'text-red-400' : 'text-slate-400'}`}>{d.status}</p>
                        </div>
                    ))}
                </div>
            </div>
            {selectedDrone && (
                <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{selectedDrone.id}</h1>
                        <p className="text-lg text-blue-300 mb-6">{selectedDrone.type}</p>

                        {selectedDrone.issue && (
                            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                                <h3 className="text-lg font-bold text-red-400">CRITICAL ISSUE</h3>
                                <p>{selectedDrone.issue}</p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <StatItem label="Battery" value={`${selectedDrone.battery}%`} />
                            <StatItem label="Battery Health" value={selectedDrone.batteryHealth} color={selectedDrone.batteryHealth !== 'Good' ? 'text-yellow-400' : 'text-green-400'} />
                            <StatItem label="Range" value={selectedDrone.range} />
                            <StatItem label="Connectivity" value={selectedDrone.connectivity} color={selectedDrone.connectivity !== 'Strong' && selectedDrone.connectivity !== 'Excellent' ? 'text-yellow-400' : 'text-green-400'} />
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-bold text-blue-300 mb-4">Manual Controls</h3>
                            <div className="flex gap-4">
                                <button className="flex-1 p-3 bg-green-600 rounded-md font-semibold hover:bg-green-700">Takeoff</button>
                                <button className="flex-1 p-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700">Return to Base</button>
                                <button className="flex-1 p-3 bg-red-600 rounded-md font-semibold hover:bg-red-700">EMERGENCY STOP</button>
                            </div>
                        </div>
                    </div>
                     <div className="flex flex-col">
                         <h3 className="text-xl font-bold text-blue-300 mb-4">Live Aerial View</h3>
                         <div className="flex-grow bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600 relative">
                             {loadError && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80"><p className="text-red-400">Map Failed to Load</p></div>}
                             {!isLoaded && !loadError && <div className="flex items-center justify-center h-full">Loading Aerial Map...</div>}
                             <div ref={mapRef} className="w-full h-full" />
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MissionTrackingScreen = () => ( <div className="p-8"><h1 className="text-3xl font-bold">Mission Tracking</h1><p>UI for this screen is under construction.</p></div>);

const TeamCoordinationScreen = () => {
    const [chatMessages, setChatMessages] = useState(MOCK_CHAT);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const newMsg = {
            sender: 'You',
            message: newMessage,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages([...chatMessages, newMsg]);
        setNewMessage('');
    };

    return (
    <div className="flex h-full">
        <div className="w-1/4 bg-slate-800 p-4 border-r border-slate-700">
            <h2 className="text-xl font-bold mb-4">Team</h2>
            {MOCK_TEAM.map(member => (
                <div key={member.name} className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                    <div><p className="font-semibold">{member.name}</p><p className="text-xs text-slate-400">{member.role}</p></div>
                </div>
            ))}
        </div>
        <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {chatMessages.map((chat, i) => (
                    <div key={i} className={`flex ${chat.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${chat.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>
                           <p className="font-bold text-sm">{chat.sender}</p>
                           <p>{chat.message}</p>
                           <p className="text-xs text-slate-400 text-right mt-1">{chat.time}</p>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-4 items-center">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 text-gray-200 bg-slate-600 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button type="submit" className="p-3 bg-blue-600 rounded-md hover:bg-blue-700"><Icon path={ICONS.send} className="w-6 h-6"/></button>
            </form>
        </div>
    </div>
    );
};

const EmergencySOSScreen = () => {
    const [deploymentStatus, setDeploymentStatus] = useState(null);

    const handleSosClick = (type) => {
        setDeploymentStatus({
            type: type,
            message: `Emergency protocol for ${type} activated. Deploying nearest Scout and Responder drones...`,
            drone: 'SCT-SW-02',
            eta: '4 minutes'
        });
    };

    if (deploymentStatus) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <Icon path={ICONS.sos} className="w-24 h-24 text-red-500 animate-pulse" />
                <h1 className="text-4xl font-bold text-red-400 mt-4">DEPLOYMENT IN PROGRESS</h1>
                <p className="text-yellow-300 text-lg mt-2">{deploymentStatus.message}</p>
                <div className="mt-8 p-6 bg-slate-800 rounded-lg border border-blue-500/30">
                    <p><strong>Drone Assigned:</strong> {deploymentStatus.drone}</p>
                    <p><strong>Estimated Time of Arrival:</strong> {deploymentStatus.eta}</p>
                </div>
                <button onClick={() => setDeploymentStatus(null)} className="mt-8 p-3 bg-slate-600 rounded-md font-semibold hover:bg-slate-700">Return to SOS Panel</button>
            </div>
        );
    }
    
    return (
        <div className="p-8 text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-2">EMERGENCY SOS</h1>
            <p className="text-yellow-300 mb-8">Select Emergency Type to Auto-Deploy Assets</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <button onClick={() => handleSosClick('Fire')} className={`flex flex-col items-center justify-center p-6 rounded-lg transition-transform hover:scale-105 shadow-lg border border-red-500 bg-red-900/50 text-red-300`}><Icon path={ICONS.fire} className="w-12 h-12 mb-2" /><span className="text-lg font-semibold">Fire</span></button>
                <button onClick={() => handleSosClick('Flood')} className={`flex flex-col items-center justify-center p-6 rounded-lg transition-transform hover:scale-105 shadow-lg border border-blue-500 bg-blue-900/50 text-blue-300`}><Icon path={ICONS.flood} className="w-12 h-12 mb-2" /><span className="text-lg font-semibold">Flood</span></button>
                <button onClick={() => handleSosClick('Structure Collapse')} className={`flex flex-col items-center justify-center p-6 rounded-lg transition-transform hover:scale-105 shadow-lg border border-yellow-500 bg-yellow-900/50 text-yellow-300`}><Icon path={ICONS.collapse} className="w-12 h-12 mb-2" /><span className="text-lg font-semibold">Structure Collapse</span></button>
            </div>
        </div>
    );
};

const ResourcesInventoryScreen = () => {
    const InventoryItem = ({ name, stock, capacity, unit }) => {
        const percentage = (stock / capacity) * 100;
        let barColor = 'bg-green-500';
        if (percentage < 50) barColor = 'bg-yellow-500';
        if (percentage < 25) barColor = 'bg-red-500';

        return (
            <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex justify-between items-baseline mb-1">
                    <p className="font-bold">{name}</p>
                    <p className="text-sm text-slate-300">{stock} / {capacity} {unit}</p>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2.5">
                    <div className={`${barColor} h-2.5 rounded-full`} style={{width: `${percentage}%`}}></div>
                </div>
            </div>
        );
    };

    return (
         <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Resources & Inventory</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-blue-300 mb-4">Supplies Inventory</h2>
                    <div className="space-y-4">
                        {MOCK_INVENTORY.map(item => <InventoryItem key={item.name} {...item} />)}
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-blue-300 mb-4">Personnel & Fleet</h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div>
                             <h3 className="text-lg font-semibold text-slate-300 mb-3">Field Teams</h3>
                             <div className="space-y-3">
                                {MOCK_TEAM.map(member => (
                                    <div key={member.name} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-xs text-slate-400">{member.role}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                            <p className="text-sm capitalize">{member.status}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-300 mb-3">Drone Fleet</h3>
                            <div className="space-y-3">
                               {MOCK_DRONES.map(d => (
                                 <div key={d.id} className="p-3 bg-slate-700 rounded-lg">
                                    <div className="flex justify-between items-center">
                                       <p className="font-bold">{d.id}</p>
                                       <p className={`text-xs font-semibold ${d.status === 'ERROR' ? 'text-red-400' : 'text-slate-300'}`}>{d.status}</p>
                                    </div>
                                    <p className="text-xs text-slate-400">{d.type}</p>
                                 </div>
                               ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsScreen = () => ( <div className="p-8"><h1 className="text-3xl font-bold">Settings & Profile</h1><p>UI for this screen is under construction.</p></div>);


// --- MAIN APP COMPONENT (CONTROLS NAVIGATION) ---
export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    
    if (!isAuthenticated) {
        return <LoginScreen onLogin={() => setIsAuthenticated(true)} onBypass={() => setIsAuthenticated(true)} />;
    }

    const MainContent = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardScreen onNavigate={setCurrentPage} />;
            case 'map': return <LiveMapScreen />;
            case 'supply': return <SupplyRequestScreen />;
            case 'control': return <DroneMissionControlScreen />;
            case 'missions': return <MissionTrackingScreen />;
            case 'chat': return <TeamCoordinationScreen />;
            case 'sos': return <EmergencySOSScreen />;
            case 'inventory': return <ResourcesInventoryScreen />;
            case 'settings': return <SettingsScreen />;
            default: return <DashboardScreen onNavigate={setCurrentPage} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-slate-900 text-gray-200 font-sans">
             <nav className="w-20 bg-slate-800 flex flex-col items-center justify-between p-2 shadow-2xl flex-shrink-0">
                <div>
                  <button onClick={() => setCurrentPage('dashboard')} className="p-3 mb-6 rounded-lg bg-blue-600"><Icon path={ICONS.logo} className="w-8 h-8 text-white" /></button>
                  <ul className="space-y-4">
                    {[
                      {page: 'dashboard', icon: ICONS.dashboard},
                      {page: 'map', icon: ICONS.map},
                      {page: 'supply', icon: ICONS.supply},
                      {page: 'control', icon: ICONS.droneControl},
                      {page: 'missions', icon: ICONS.missionStatus},
                      {page: 'chat', icon: ICONS.teamChat},
                      {page: 'inventory', icon: ICONS.inventory},
                      {page: 'sos', icon: ICONS.sos}
                    ].map(({page, icon}) => (
                      <li key={page}>
                        <button onClick={() => setCurrentPage(page)} className={`p-3 rounded-lg ${currentPage === page ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
                          <Icon path={icon} className={`w-6 h-6 ${currentPage === page ? 'text-white' : 'text-slate-400'}`} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                 <div>
                    <button onClick={() => setCurrentPage('settings')} className={`p-3 rounded-lg mb-4 ${currentPage === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
                      <Icon path={ICONS.settings} className={`w-6 h-6 ${currentPage === 'settings' ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                    <button onClick={() => setIsAuthenticated(false)} className="p-3 rounded-lg hover:bg-slate-700">
                      <Icon path={ICONS.logout} className="w-6 h-6 text-slate-400" />
                    </button>
                 </div>
            </nav>
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <MainContent />
                </div>
            </main>
        </div>
    );
}

