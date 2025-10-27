// import React, { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, onValue } from 'firebase/database';
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// // Firebase Configuration
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "v2v-communication-d46c6-default-rtdb.firebaseio.com",
//   databaseURL: "https://v2v-communication-d46c6-default-rtdb.firebaseio.com",
//   projectId: "v2v-communication-d46c6",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);

// const VehicleDashboard = () => {
//   const [vehicleData, setVehicleData] = useState({
//     Accelerator: '0',
//     Break: '0',
//     Clutch: '0',
//     Oil: 0,
//     Sound: '0',
//     Humidity: 0,
//     Temperature: 0,
//     Vibration: 0
//   });

//   const [historyData, setHistoryData] = useState([]);
//   const [controlHistory, setControlHistory] = useState([]);
  
//   // Track activation times and counts
//   const [activationLogs, setActivationLogs] = useState([]);
//   const [activationCounts, setActivationCounts] = useState({
//     Accelerator: 0,
//     Break: 0,
//     Clutch: 0,
//     Sound: 0
//   });

//   // Track previous state to detect 0 to 1 transition
//   const [previousState, setPreviousState] = useState({
//     Accelerator: '0',
//     Break: '0',
//     Clutch: '0',
//     Sound: '0'
//   });

//   // Performance metrics
//   const [performanceMetrics, setPerformanceMetrics] = useState({
//     avgTemperature: 0,
//     avgHumidity: 0,
//     avgVibration: 0,
//     maxTemperature: 0,
//     minTemperature: 0,
//     oilConsumption: 0
//   });

//   useEffect(() => {
//     const vehicleRef = ref(database, 'Vehicle_predictive');
    
//     const unsubscribe = onValue(vehicleRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         const newData = {
//           Accelerator: data.Accelerator || '0',
//           Break: data.Break || '0',
//           Clutch: data.Clutch || '0',
//           Oil: data.Oil || 0,
//           Sound: data.Sound || '0',
//           Humidity: data.Humidity || 0,
//           Temperature: data.Temperature || 0,
//           Vibration: data.Vibration || 0
//         };
        
//         setVehicleData(newData);

//         // Detect 0 to 1 transitions and log timestamps
//         const currentTime = new Date();
//         const formattedTime = currentTime.toLocaleString('en-IN', { 
//           hour: '2-digit', 
//           minute: '2-digit', 
//           second: '2-digit',
//           hour12: true 
//         });
//         const fullTimestamp = currentTime.toLocaleString('en-IN');

//         let newLogs = [];
//         let updatedCounts = { ...activationCounts };

//         // Check each control for 0 to 1 transition
//         ['Accelerator', 'Break', 'Clutch', 'Sound'].forEach(control => {
//           if (previousState[control] === '0' && newData[control] === '1') {
//             newLogs.push({
//               control: control,
//               timestamp: fullTimestamp,
//               time: formattedTime
//             });
//             updatedCounts[control] += 1;
//           }
//         });

//         if (newLogs.length > 0) {
//           setActivationLogs(prev => [...newLogs, ...prev].slice(0, 50)); // Keep last 50 logs
//           setActivationCounts(updatedCounts);
//         }

//         // Update previous state
//         setPreviousState({
//           Accelerator: newData.Accelerator,
//           Break: newData.Break,
//           Clutch: newData.Clutch,
//           Sound: newData.Sound
//         });

//         // Update history for graphs
//         const timestamp = currentTime.toLocaleTimeString();
        
//         setHistoryData(prev => {
//           const updated = [...prev, {
//             time: timestamp,
//             Humidity: parseFloat(newData.Humidity),
//             Temperature: parseFloat(newData.Temperature),
//             Vibration: parseFloat(newData.Vibration) * 100,
//             Oil: parseFloat(newData.Oil)
//           }];
//           const slicedData = updated.slice(-20);

//           // Calculate performance metrics
//           if (slicedData.length > 0) {
//             const temps = slicedData.map(d => d.Temperature);
//             const humidities = slicedData.map(d => d.Humidity);
//             const vibrations = slicedData.map(d => d.Vibration);
//             const oils = slicedData.map(d => d.Oil);

//             setPerformanceMetrics({
//               avgTemperature: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2),
//               avgHumidity: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2),
//               avgVibration: (vibrations.reduce((a, b) => a + b, 0) / vibrations.length).toFixed(4),
//               maxTemperature: Math.max(...temps).toFixed(2),
//               minTemperature: Math.min(...temps).toFixed(2),
//               oilConsumption: oils.length > 1 ? (oils[0] - oils[oils.length - 1]).toFixed(2) : 0
//             });
//           }

//           return slicedData;
//         });

//         setControlHistory(prev => {
//           const updated = [...prev, {
//             time: timestamp,
//             Accelerator: newData.Accelerator === '1' ? 1 : 0,
//             Break: newData.Break === '1' ? 1 : 0,
//             Clutch: newData.Clutch === '1' ? 1 : 0,
//             Sound: newData.Sound === '1' ? 1 : 0
//           }];
//           return updated.slice(-20);
//         });
//       }
//     });

//     return () => unsubscribe();
//   }, [previousState, activationCounts]);

//   const getStatusColor = (value) => {
//     return value === '1' ? '#4CAF50' : '#e0e0e0';
//   };

//   const getAlertStatus = (value) => {
//     return value === '1';
//   };

//   // Prepare data for pie chart
//   const activationPieData = [
//     { name: 'Accelerator', value: activationCounts.Accelerator, color: '#4CAF50' },
//     { name: 'Break', value: activationCounts.Break, color: '#F44336' },
//     { name: 'Clutch', value: activationCounts.Clutch, color: '#FF9800' },
//     { name: 'Sound', value: activationCounts.Sound, color: '#E91E63' }
//   ];

//   return (
//     <>
//       <style>{`
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }

//         body {
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           min-height: 100vh;
//         }

//         .dashboard-container {
//           max-width: 1600px;
//           margin: 0 auto;
//           padding: 20px;
//         }

//         .dashboard-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 30px;
//           background: white;
//           padding: 20px 30px;
//           border-radius: 15px;
//           box-shadow: 0 5px 15px rgba(0,0,0,0.1);
//         }

//         .dashboard-header h1 {
//           color: #333;
//           font-size: 28px;
//           font-weight: 600;
//         }

//         .live-indicator {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           color: #4CAF50;
//           font-weight: 600;
//         }

//         .live-dot {
//           width: 12px;
//           height: 12px;
//           background: #4CAF50;
//           border-radius: 50%;
//           animation: pulse 2s infinite;
//         }

//         @keyframes pulse {
//           0%, 100% {
//             opacity: 1;
//             transform: scale(1);
//           }
//           50% {
//             opacity: 0.5;
//             transform: scale(1.1);
//           }
//         }

//         .dashboard-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
//           gap: 20px;
//           margin-bottom: 30px;
//         }

//         .card {
//           background: white;
//           border-radius: 15px;
//           padding: 20px;
//           box-shadow: 0 5px 15px rgba(0,0,0,0.1);
//           transition: transform 0.3s ease, box-shadow 0.3s ease;
//         }

//         .card:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 8px 25px rgba(0,0,0,0.15);
//         }

//         .wide-card {
//           grid-column: span 2;
//         }

//         .full-width-card {
//           grid-column: 1 / -1;
//         }

//         .card-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 20px;
//           padding-bottom: 10px;
//           border-bottom: 2px solid #f0f0f0;
//         }

//         .card-header h3 {
//           color: #333;
//           font-size: 18px;
//           font-weight: 600;
//         }

//         .subtitle {
//           font-size: 12px;
//           color: #888;
//           font-weight: normal;
//         }

//         .card-body {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 20px 0;
//         }

//         .status-circle {
//           width: 120px;
//           height: 120px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin-bottom: 15px;
//           box-shadow: 0 4px 15px rgba(0,0,0,0.1);
//           transition: all 0.3s ease;
//         }

//         .status-value {
//           font-size: 48px;
//           font-weight: bold;
//           color: white;
//         }

//         .status-label {
//           font-size: 16px;
//           color: #666;
//           font-weight: 500;
//         }

//         .alert-card {
//           border: 2px solid #ff5252;
//           animation: alertPulse 1.5s infinite;
//         }

//         @keyframes alertPulse {
//           0%, 100% {
//             box-shadow: 0 5px 15px rgba(255, 82, 82, 0.2);
//           }
//           50% {
//             box-shadow: 0 5px 25px rgba(255, 82, 82, 0.5);
//           }
//         }

//         .alert-badge {
//           background: #ff5252;
//           color: white;
//           padding: 4px 12px;
//           border-radius: 20px;
//           font-size: 12px;
//           font-weight: bold;
//           animation: blink 1s infinite;
//         }

//         @keyframes blink {
//           0%, 100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.5;
//           }
//         }

//         .alert-active {
//           animation: shake 0.5s infinite;
//         }

//         @keyframes shake {
//           0%, 100% {
//             transform: translateX(0);
//           }
//           25% {
//             transform: translateX(-5px);
//           }
//           75% {
//             transform: translateX(5px);
//           }
//         }

//         .value-display {
//           display: flex;
//           align-items: baseline;
//           gap: 5px;
//           margin-bottom: 20px;
//         }

//         .large-value {
//           font-size: 56px;
//           font-weight: bold;
//           color: #667eea;
//         }

//         .unit {
//           font-size: 24px;
//           color: #888;
//         }

//         .progress-bar {
//           width: 100%;
//           height: 10px;
//           background: #e0e0e0;
//           border-radius: 5px;
//           overflow: hidden;
//         }

//         .progress-fill {
//           height: 100%;
//           background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
//           transition: width 0.5s ease;
//         }

//         .sensor-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 30px;
//           width: 100%;
//         }

//         .sensor-item {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           padding: 20px;
//           background: #f8f9fa;
//           border-radius: 10px;
//         }

//         .sensor-label {
//           font-size: 14px;
//           color: #666;
//           margin-bottom: 10px;
//           font-weight: 500;
//         }

//         .sensor-value {
//           font-size: 28px;
//           font-weight: bold;
//           color: #333;
//         }

//         .chart-section {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
//           gap: 20px;
//           margin-top: 20px;
//         }

//         .chart-card {
//           background: white;
//           border-radius: 15px;
//           padding: 25px;
//           box-shadow: 0 5px 15px rgba(0,0,0,0.1);
//         }

//         .chart-title {
//           color: #333;
//           font-size: 20px;
//           font-weight: 600;
//           margin-bottom: 20px;
//           text-align: center;
//         }

//         .metrics-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 20px;
//           width: 100%;
//         }

//         .metric-card {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           padding: 20px;
//           border-radius: 10px;
//           color: white;
//           text-align: center;
//         }

//         .metric-label {
//           font-size: 14px;
//           opacity: 0.9;
//           margin-bottom: 10px;
//         }

//         .metric-value {
//           font-size: 32px;
//           font-weight: bold;
//         }

//         .metric-unit {
//           font-size: 16px;
//           opacity: 0.8;
//         }

//         .logs-container {
//           max-height: 400px;
//           overflow-y: auto;
//         }

//         .log-item {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 12px 15px;
//           margin-bottom: 10px;
//           background: #f8f9fa;
//           border-radius: 8px;
//           border-left: 4px solid;
//           transition: all 0.3s ease;
//         }

//         .log-item:hover {
//           transform: translateX(5px);
//           box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//         }

//         .log-item.accelerator {
//           border-left-color: #4CAF50;
//         }

//         .log-item.break {
//           border-left-color: #F44336;
//         }

//         .log-item.clutch {
//           border-left-color: #FF9800;
//         }

//         .log-item.sound {
//           border-left-color: #E91E63;
//         }

//         .log-control {
//           font-weight: 600;
//           color: #333;
//         }

//         .log-timestamp {
//           color: #666;
//           font-size: 14px;
//         }

//         .count-badge {
//           background: #667eea;
//           color: white;
//           padding: 8px 16px;
//           border-radius: 20px;
//           font-weight: bold;
//           font-size: 18px;
//         }

//         @media (max-width: 768px) {
//           .dashboard-grid {
//             grid-template-columns: 1fr;
//           }
          
//           .wide-card {
//             grid-column: span 1;
//           }
          
//           .sensor-grid, .metrics-grid {
//             grid-template-columns: 1fr;
//             gap: 15px;
//           }
          
//           .dashboard-header {
//             flex-direction: column;
//             gap: 15px;
//           }

//           .chart-section {
//             grid-template-columns: 1fr;
//           }
//         }
//       `}</style>

//       <div className="dashboard-container">
//         <div className="dashboard-header">
//           <h1>Vehicle Predictive Dashboard</h1>
//           <div className="live-indicator">
//             <span className="live-dot"></span>
//             <span>Live</span>
//           </div>
//         </div>

//         {/* Performance Metrics Section */}
//         <div className="card full-width-card">
//           <div className="card-header">
//             <h3>Performance Metrics</h3>
//           </div>
//           <div className="metrics-grid">
//             <div className="metric-card">
//               <div className="metric-label">Avg Temperature</div>
//               <div className="metric-value">{performanceMetrics.avgTemperature}<span className="metric-unit">°C</span></div>
//             </div>
//             <div className="metric-card">
//               <div className="metric-label">Avg Humidity</div>
//               <div className="metric-value">{performanceMetrics.avgHumidity}<span className="metric-unit">%</span></div>
//             </div>
//             <div className="metric-card">
//               <div className="metric-label">Avg Vibration</div>
//               <div className="metric-value">{performanceMetrics.avgVibration}</div>
//             </div>
//             <div className="metric-card">
//               <div className="metric-label">Max Temperature</div>
//               <div className="metric-value">{performanceMetrics.maxTemperature}<span className="metric-unit">°C</span></div>
//             </div>
//             <div className="metric-card">
//               <div className="metric-label">Min Temperature</div>
//               <div className="metric-value">{performanceMetrics.minTemperature}<span className="metric-unit">°C</span></div>
//             </div>
//             <div className="metric-card">
//               <div className="metric-label">Oil Consumption</div>
//               <div className="metric-value">{performanceMetrics.oilConsumption}<span className="metric-unit">L</span></div>
//             </div>
//           </div>
//         </div>

//         <div className="dashboard-grid">
//           {/* Accelerator */}
//           <div className="card">
//             <div className="card-header">
//               <h3>Accelerator</h3>
//               <span className="count-badge">{activationCounts.Accelerator}</span>
//             </div>
//             <div className="card-body">
//               <div 
//                 className="status-circle" 
//                 style={{ backgroundColor: getStatusColor(vehicleData.Accelerator) }}
//               >
//                 <span className="status-value">{vehicleData.Accelerator}</span>
//               </div>
//               <p className="status-label">
//                 {vehicleData.Accelerator === '1' ? 'Active' : 'Inactive'}
//               </p>
//             </div>
//           </div>

//           {/* Break */}
//           <div className="card">
//             <div className="card-header">
//               <h3>Break</h3>
//               <span className="count-badge">{activationCounts.Break}</span>
//             </div>
//             <div className="card-body">
//               <div 
//                 className="status-circle" 
//                 style={{ backgroundColor: getStatusColor(vehicleData.Break) }}
//               >
//                 <span className="status-value">{vehicleData.Break}</span>
//               </div>
//               <p className="status-label">
//                 {vehicleData.Break === '1' ? 'Active' : 'Inactive'}
//               </p>
//             </div>
//           </div>

//           {/* Clutch */}
//           <div className="card">
//             <div className="card-header">
//               <h3>Clutch</h3>
//               <span className="count-badge">{activationCounts.Clutch}</span>
//             </div>
//             <div className="card-body">
//               <div 
//                 className="status-circle" 
//                 style={{ backgroundColor: getStatusColor(vehicleData.Clutch) }}
//               >
//                 <span className="status-value">{vehicleData.Clutch}</span>
//               </div>
//               <p className="status-label">
//                 {vehicleData.Clutch === '1' ? 'Active' : 'Inactive'}
//               </p>
//             </div>
//           </div>

//           {/* Oil Level */}
//           <div className="card">
//             <div className="card-header">
//               <h3>Oil Level</h3>
//               <span className="subtitle">(Water Level)</span>
//             </div>
//             <div className="card-body">
//               <div className="value-display">
//                 <span className="large-value">{vehicleData.Oil}</span>
//                 <span className="unit">L</span>
//               </div>
//               <div className="progress-bar">
//                 <div 
//                   className="progress-fill" 
//                   style={{ width: `${Math.min(vehicleData.Oil * 10, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//           </div>

//           {/* Sound Alert */}
//           <div className={`card ${getAlertStatus(vehicleData.Sound) ? 'alert-card' : ''}`}>
//             <div className="card-header">
//               <h3>Sound</h3>
//               <span className="count-badge">{activationCounts.Sound}</span>
//               {getAlertStatus(vehicleData.Sound) && (
//                 <span className="alert-badge">ALERT</span>
//               )}
//             </div>
//             <div className="card-body">
//               <div 
//                 className={`status-circle ${getAlertStatus(vehicleData.Sound) ? 'alert-active' : ''}`}
//                 style={{ backgroundColor: getStatusColor(vehicleData.Sound) }}
//               >
//                 <span className="status-value">{vehicleData.Sound}</span>
//               </div>
//               <p className="status-label">
//                 {vehicleData.Sound === '1' ? 'Alert Active' : 'Normal'}
//               </p>
//             </div>
//           </div>

//           {/* Environmental Sensors */}
//           <div className="card wide-card">
//             <div className="card-header">
//               <h3>Environmental Sensors</h3>
//             </div>
//             <div className="card-body sensor-grid">
//               <div className="sensor-item">
//                 <span className="sensor-label">Humidity</span>
//                 <span className="sensor-value">{vehicleData.Humidity.toFixed(2)}%</span>
//               </div>
//               <div className="sensor-item">
//                 <span className="sensor-label">Temperature</span>
//                 <span className="sensor-value">{vehicleData.Temperature.toFixed(2)}°C</span>
//               </div>
//               <div className="sensor-item">
//                 <span className="sensor-label">Vibration</span>
//                 <span className="sensor-value">{vehicleData.Vibration.toFixed(5)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Activation Logs */}
//         <div className="card full-width-card">
//           <div className="card-header">
//             <h3>Activation Logs (0 → 1 Transitions with Timestamp)</h3>
//           </div>
//           <div className="logs-container">
//             {activationLogs.length === 0 ? (
//               <p style={{textAlign: 'center', color: '#888', padding: '20px'}}>No activations recorded yet</p>
//             ) : (
//               activationLogs.map((log, index) => (
//                 <div key={index} className={`log-item ${log.control.toLowerCase()}`}>
//                   <span className="log-control">{log.control} Activated</span>
//                   <span className="log-timestamp">{log.timestamp}</span>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Charts Section */}
//         <div className="chart-section">
//           {/* Environmental Sensors Line Chart */}
//           <div className="chart-card">
//             <h3 className="chart-title">Environmental Sensors Over Time</h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={historyData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="time" tick={{fontSize: 12}} />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="Humidity" stroke="#2196F3" strokeWidth={2} dot={false} />
//                 <Line type="monotone" dataKey="Temperature" stroke="#FF5722" strokeWidth={2} dot={false} />
//                 <Line type="monotone" dataKey="Vibration" stroke="#9C27B0" strokeWidth={2} dot={false} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Oil Level Line Chart */}
//           <div className="chart-card">
//             <h3 className="chart-title">Oil Level Over Time</h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={historyData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="time" tick={{fontSize: 12}} />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="Oil" stroke="#667eea" strokeWidth={3} dot={false} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Activation Count Pie Chart */}
//           <div className="chart-card">
//             <h3 className="chart-title">Control Activation Distribution</h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={activationPieData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, value }) => `${name}: ${value}`}
//                   outerRadius={100}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {activationPieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Control Status Bar Chart */}
//           <div className="chart-card">
//             <h3 className="chart-title">Control Status History</h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={controlHistory}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="time" tick={{fontSize: 12}} />
//                 <YAxis domain={[0, 1]} ticks={[0, 1]} />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="Accelerator" fill="#4CAF50" />
//                 <Bar dataKey="Break" fill="#F44336" />
//                 <Bar dataKey="Clutch" fill="#FF9800" />
//                 <Bar dataKey="Sound" fill="#E91E63" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default VehicleDashboard;




import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "v2v-communication-d46c6-default-rtdb.firebaseio.com",
  databaseURL: "https://v2v-communication-d46c6-default-rtdb.firebaseio.com",
  projectId: "v2v-communication-d46c6",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const VehicleDashboard = () => {
  const [vehicleData, setVehicleData] = useState({
    Accelerator: '0',
    Break: '0',
    Clutch: '0',
    Oil: 0,
    Sound: '0',
    Humidity: 0,
    Temperature: 0,
    Vibration: 0
  });

  const [historyData, setHistoryData] = useState([]);
  const [controlHistory, setControlHistory] = useState([]);
  
  const [activationLogs, setActivationLogs] = useState([]);
  const [activationCounts, setActivationCounts] = useState({
    Accelerator: 0,
    Break: 0,
    Clutch: 0,
    Sound: 0
  });

  const [previousState, setPreviousState] = useState({
    Accelerator: '0',
    Break: '0',
    Clutch: '0',
    Sound: '0'
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    avgTemperature: 0,
    avgHumidity: 0,
    avgVibration: 0,
    maxTemperature: 0,
    minTemperature: 0,
    oilConsumption: 0
  });

  useEffect(() => {
    const vehicleRef = ref(database, 'Vehicle_predictive');
    
    const unsubscribe = onValue(vehicleRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newData = {
          Accelerator: data.Accelerator || '0',
          Break: data.Break || '0',
          Clutch: data.Clutch || '0',
          Oil: data.Oil || 0,
          Sound: data.Sound || '0',
          Humidity: data.Humidity || 0,
          Temperature: data.Temperature || 0,
          Vibration: data.Vibration || 0
        };
        
        setVehicleData(newData);

        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: true 
        });
        const fullTimestamp = currentTime.toLocaleString('en-IN');

        let newLogs = [];
        let updatedCounts = { ...activationCounts };

        ['Accelerator', 'Break', 'Clutch', 'Sound'].forEach(control => {
          if (previousState[control] === '0' && newData[control] === '1') {
            newLogs.push({
              control: control,
              timestamp: fullTimestamp,
              time: formattedTime
            });
            updatedCounts[control] += 1;
          }
        });

        if (newLogs.length > 0) {
          setActivationLogs(prev => [...newLogs, ...prev].slice(0, 50));
          setActivationCounts(updatedCounts);
        }

        setPreviousState({
          Accelerator: newData.Accelerator,
          Break: newData.Break,
          Clutch: newData.Clutch,
          Sound: newData.Sound
        });

        const timestamp = currentTime.toLocaleTimeString();
        
        setHistoryData(prev => {
          const updated = [...prev, {
            time: timestamp,
            Humidity: parseFloat(newData.Humidity),
            Temperature: parseFloat(newData.Temperature),
            Vibration: parseFloat(newData.Vibration) * 100,
            Oil: parseFloat(newData.Oil)
          }];
          const slicedData = updated.slice(-20);

          if (slicedData.length > 0) {
            const temps = slicedData.map(d => d.Temperature);
            const humidities = slicedData.map(d => d.Humidity);
            const vibrations = slicedData.map(d => d.Vibration);
            const oils = slicedData.map(d => d.Oil);

            setPerformanceMetrics({
              avgTemperature: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2),
              avgHumidity: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2),
              avgVibration: (vibrations.reduce((a, b) => a + b, 0) / vibrations.length).toFixed(4),
              maxTemperature: Math.max(...temps).toFixed(2),
              minTemperature: Math.min(...temps).toFixed(2),
              oilConsumption: oils.length > 1 ? (oils[0] - oils[oils.length - 1]).toFixed(2) : 0
            });
          }

          return slicedData;
        });

        setControlHistory(prev => {
          const updated = [...prev, {
            time: timestamp,
            Accelerator: newData.Accelerator === '1' ? 1 : 0,
            Break: newData.Break === '1' ? 1 : 0,
            Clutch: newData.Clutch === '1' ? 1 : 0,
            Sound: newData.Sound === '1' ? 1 : 0
          }];
          return updated.slice(-20);
        });
      }
    });

    return () => unsubscribe();
  }, [previousState, activationCounts]);

  const getStatusColor = (value) => {
    return value === '1' ? '#4CAF50' : '#e0e0e0';
  };

  const getAlertStatus = (value) => {
    return value === '1';
  };

  const activationPieData = [
    { name: 'Accelerator', value: activationCounts.Accelerator, color: '#4CAF50' },
    { name: 'Break', value: activationCounts.Break, color: '#F44336' },
    { name: 'Clutch', value: activationCounts.Clutch, color: '#FF9800' },
    { name: 'Sound', value: activationCounts.Sound, color: '#E91E63' }
  ];

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .dashboard-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: white;
          padding: 20px 30px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .dashboard-header h1 {
          color: #333;
          font-size: 28px;
          font-weight: 600;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4CAF50;
          font-weight: 600;
        }

        .live-dot {
          width: 12px;
          height: 12px;
          background: #4CAF50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .wide-card {
          grid-column: span 2;
        }

        .full-width-card {
          grid-column: 1 / -1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }

        .card-header h3 {
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }

        .subtitle {
          font-size: 12px;
          color: #888;
          font-weight: normal;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 0;
        }

        .status-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .status-value {
          font-size: 48px;
          font-weight: bold;
          color: white;
        }

        .status-label {
          font-size: 16px;
          color: #666;
          font-weight: 500;
        }

        .alert-card {
          border: 2px solid #ff5252;
          animation: alertPulse 1.5s infinite;
        }

        @keyframes alertPulse {
          0%, 100% {
            box-shadow: 0 5px 15px rgba(255, 82, 82, 0.2);
          }
          50% {
            box-shadow: 0 5px 25px rgba(255, 82, 82, 0.5);
          }
        }

        .alert-badge {
          background: #ff5252;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .alert-active {
          animation: shake 0.5s infinite;
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .value-display {
          display: flex;
          align-items: baseline;
          gap: 5px;
          margin-bottom: 20px;
        }

        .large-value {
          font-size: 56px;
          font-weight: bold;
          color: #667eea;
        }

        .unit {
          font-size: 24px;
          color: #888;
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          background: #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
        }

        .sensor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          width: 100%;
        }

        .sensor-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .sensor-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .sensor-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
        }

        .chart-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .chart-title {
          color: #333;
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
          border-bottom: 3px solid #667eea;
          padding-bottom: 10px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
        }

        .metric-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          border-radius: 10px;
          color: white;
          text-align: center;
        }

        .metric-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 10px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: bold;
        }

        .metric-unit {
          font-size: 16px;
          opacity: 0.8;
        }

        .logs-container {
          max-height: 400px;
          overflow-y: auto;
        }

        .log-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          margin-bottom: 10px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid;
          transition: all 0.3s ease;
        }

        .log-item:hover {
          transform: translateX(5px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .log-item.accelerator {
          border-left-color: #4CAF50;
        }

        .log-item.break {
          border-left-color: #F44336;
        }

        .log-item.clutch {
          border-left-color: #FF9800;
        }

        .log-item.sound {
          border-left-color: #E91E63;
        }

        .log-control {
          font-weight: 600;
          color: #333;
        }

        .log-timestamp {
          color: #666;
          font-size: 14px;
        }

        .count-badge {
          background: #667eea;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .wide-card {
            grid-column: span 1;
          }
          
          .sensor-grid, .metrics-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Vehicle Predictive Dashboard</h1>
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Live</span>
          </div>
        </div>

        {/* Performance Metrics Section */}
        <div className="card full-width-card">
          <div className="card-header">
            <h3>Performance Metrics</h3>
          </div>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Avg Temperature</div>
              <div className="metric-value">{performanceMetrics.avgTemperature}<span className="metric-unit">°C</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Humidity</div>
              <div className="metric-value">{performanceMetrics.avgHumidity}<span className="metric-unit">%</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Vibration</div>
              <div className="metric-value">{performanceMetrics.avgVibration}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Max Temperature</div>
              <div className="metric-value">{performanceMetrics.maxTemperature}<span className="metric-unit">°C</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Min Temperature</div>
              <div className="metric-value">{performanceMetrics.minTemperature}<span className="metric-unit">°C</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Oil Consumption</div>
              <div className="metric-value">{performanceMetrics.oilConsumption}<span className="metric-unit">L</span></div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Accelerator */}
          <div className="card">
            <div className="card-header">
              <h3>Accelerator</h3>
              <span className="count-badge">{activationCounts.Accelerator}</span>
            </div>
            <div className="card-body">
              <div 
                className="status-circle" 
                style={{ backgroundColor: getStatusColor(vehicleData.Accelerator) }}
              >
                <span className="status-value">{vehicleData.Accelerator}</span>
              </div>
              <p className="status-label">
                {vehicleData.Accelerator === '1' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Break */}
          <div className="card">
            <div className="card-header">
              <h3>Break</h3>
              <span className="count-badge">{activationCounts.Break}</span>
            </div>
            <div className="card-body">
              <div 
                className="status-circle" 
                style={{ backgroundColor: getStatusColor(vehicleData.Break) }}
              >
                <span className="status-value">{vehicleData.Break}</span>
              </div>
              <p className="status-label">
                {vehicleData.Break === '1' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Clutch */}
          <div className="card">
            <div className="card-header">
              <h3>Clutch</h3>
              <span className="count-badge">{activationCounts.Clutch}</span>
            </div>
            <div className="card-body">
              <div 
                className="status-circle" 
                style={{ backgroundColor: getStatusColor(vehicleData.Clutch) }}
              >
                <span className="status-value">{vehicleData.Clutch}</span>
              </div>
              <p className="status-label">
                {vehicleData.Clutch === '1' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Oil Level */}
          <div className="card">
            <div className="card-header">
              <h3>Oil Level</h3>
              <span className="subtitle">(Water Level)</span>
            </div>
            <div className="card-body">
              <div className="value-display">
                <span className="large-value">{vehicleData.Oil}</span>
                <span className="unit">L</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(vehicleData.Oil * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sound Alert */}
          <div className={`card ${getAlertStatus(vehicleData.Sound) ? 'alert-card' : ''}`}>
            <div className="card-header">
              <h3>Sound</h3>
              <span className="count-badge">{activationCounts.Sound}</span>
              {getAlertStatus(vehicleData.Sound) && (
                <span className="alert-badge">ALERT</span>
              )}
            </div>
            <div className="card-body">
              <div 
                className={`status-circle ${getAlertStatus(vehicleData.Sound) ? 'alert-active' : ''}`}
                style={{ backgroundColor: getStatusColor(vehicleData.Sound) }}
              >
                <span className="status-value">{vehicleData.Sound}</span>
              </div>
              <p className="status-label">
                {vehicleData.Sound === '1' ? 'Alert Active' : 'Normal'}
              </p>
            </div>
          </div>

          {/* Environmental Sensors */}
          <div className="card wide-card">
            <div className="card-header">
              <h3>Environmental Sensors</h3>
            </div>
            <div className="card-body sensor-grid">
              <div className="sensor-item">
                <span className="sensor-label">Humidity</span>
                <span className="sensor-value">{vehicleData.Humidity.toFixed(2)}%</span>
              </div>
              <div className="sensor-item">
                <span className="sensor-label">Temperature</span>
                <span className="sensor-value">{vehicleData.Temperature.toFixed(2)}°C</span>
              </div>
              <div className="sensor-item">
                <span className="sensor-label">Vibration</span>
                <span className="sensor-value">{vehicleData.Vibration.toFixed(5)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activation Logs */}
        <div className="card full-width-card">
          <div className="card-header">
            <h3>Activation Logs (0 → 1 Transitions with Timestamp)</h3>
          </div>
          <div className="logs-container">
            {activationLogs.length === 0 ? (
              <p style={{textAlign: 'center', color: '#888', padding: '20px'}}>No activations recorded yet</p>
            ) : (
              activationLogs.map((log, index) => (
                <div key={index} className={`log-item ${log.control.toLowerCase()}`}>
                  <span className="log-control">{log.control} Activated</span>
                  <span className="log-timestamp">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Graph 1: Humidity Line Chart */}
        <div className="chart-card">
          <h3 className="chart-title">📊 Humidity Over Time</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Humidity" stroke="#2196F3" fillOpacity={1} fill="url(#colorHumidity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 2: Temperature Line Chart */}
        <div className="chart-card">
          <h3 className="chart-title">🌡️ Temperature Over Time</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Temperature" stroke="#FF5722" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 3: Vibration Line Chart */}
        <div className="chart-card">
          <h3 className="chart-title">📳 Vibration Over Time</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis label={{ value: 'Vibration', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Vibration" stroke="#9C27B0" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 4: Oil Level Line Chart */}
        <div className="chart-card">
          <h3 className="chart-title">🛢️ Oil Level Over Time</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#764ba2" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis label={{ value: 'Oil Level (L)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Oil" stroke="#667eea" strokeWidth={2} fillOpacity={1} fill="url(#colorOil)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 5: Environmental Sensors Combined */}
        <div className="chart-card">
          <h3 className="chart-title">🌍 All Environmental Sensors Combined</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Humidity" stroke="#2196F3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Temperature" stroke="#FF5722" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Vibration" stroke="#9C27B0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 6: Accelerator Status Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">🚗 Accelerator Status History</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={controlHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis domain={[0, 1]} ticks={[0, 1]} label={{ value: 'Status (0/1)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Accelerator" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 7: Break Status Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">🛑 Break Status History</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={controlHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis domain={[0, 1]} ticks={[0, 1]} label={{ value: 'Status (0/1)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Break" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 8: Clutch Status Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">⚙️ Clutch Status History</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={controlHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis domain={[0, 1]} ticks={[0, 1]} label={{ value: 'Status (0/1)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Clutch" fill="#FF9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 9: Sound Alert Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">🔊 Sound Alert History</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={controlHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis domain={[0, 1]} ticks={[0, 1]} label={{ value: 'Status (0/1)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sound" fill="#E91E63" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 10: All Controls Combined Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">🎛️ All Control Status History (Combined)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={controlHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis domain={[0, 1]} ticks={[0, 1]} label={{ value: 'Status (0/1)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Accelerator" fill="#4CAF50" />
              <Bar dataKey="Break" fill="#F44336" />
              <Bar dataKey="Clutch" fill="#FF9800" />
              <Bar dataKey="Sound" fill="#E91E63" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 11: Control Activation Distribution Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title">📈 Control Activation Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={activationPieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {activationPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default VehicleDashboard;
