import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import universityLogo from './assets/177195_177064_384f574c-30b2-4810-b8be-2307b35273c6-keystone_profile_school_logo-logo_wsb_university.avif';
import './App.css';

const MedCoreApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('AIzaSyDM-88ZGX2ykBV6n_A5uzMuk94RDvC-114');
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Sarah Mitchell', specialty: 'General Medicine', date: '2026-02-20', time: '10:00 AM' },
    { id: 2, doctor: 'Dr. James Wilson', specialty: 'Cardiology', date: '2026-02-22', time: '02:30 PM' }
  ]);
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Maamar Haddouche', role: 'Team Lead / Full-Stack Developer', id: '58127' },
    { name: 'Alaeddine Benzaid', role: 'AI Integration Specialist', id: '59534' },
    { name: 'Abdennour Zakaria Cherifi', role: 'Data Systems Engineer', id: '59582' },
    { name: 'Noufel Benameur', role: 'Frontend & UX Engineer', id: '59501' },
    { name: 'Housseyn Azieze', role: 'Systems Analyst', id: '59533' }
  ]);

  const healthData = [
    { time: '08:00', bpm: 68, systolic: 118, diastolic: 78, spo2: 98, glucose: 94, sleep: 80 },
    { time: '10:00', bpm: 75, systolic: 122, diastolic: 82, spo2: 97, glucose: 105, sleep: 75 },
    { time: '12:00', bpm: 72, systolic: 120, diastolic: 80, spo2: 98, glucose: 98, sleep: 84 },
    { time: '14:00', bpm: 80, systolic: 125, diastolic: 85, spo2: 99, glucose: 110, sleep: 82 },
    { time: '16:00', bpm: 74, systolic: 121, diastolic: 81, spo2: 98, glucose: 95, sleep: 85 },
    { time: '18:00', bpm: 70, systolic: 119, diastolic: 79, spo2: 98, glucose: 92, sleep: 88 },
  ];

  const handleCheckSymptoms = async () => {
    if (!symptoms.trim()) return;

    if (!apiKey) {
      setDiagnosis({
        condition: 'API Key Required',
        advice: 'Please provide a Gemini API Key in the settings toggle above to enable Real AI diagnostics.',
        confidence: 'N/A'
      });
      return;
    }

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Gather Contextual Data
      const currentVitals = "Heart Rate: 72 BPM, Blood Pressure: 120/80, Oxygen Level: 98%, Blood Glucose: 95 mg/dL, Sleep Quality: 84%";
      const heartRateTrend = healthData.map(d => `${d.time}: ${d.bpm} BPM`).join(", ");
      const bpTrend = healthData.map(d => `${d.time}: ${d.systolic}/${d.diastolic} mmHg`).join(", ");
      const spo2Trend = healthData.map(d => `${d.time}: ${d.spo2}%`).join(", ");
      const appointmentHistory = appointments.map(a => `${a.date}: Consultation with ${a.doctor} (${a.specialty})`).join("; ");

      const prompt = `You are a medical AI assistant. You have access to the patient's current records:
      - CURRENT VITALS: ${currentVitals}
      - TREND DATA (Last 10 hours):
        * Heart Rate: ${heartRateTrend}
        * Blood Pressure: ${bpTrend}
        * Oxygen (SpO2): ${spo2Trend}
      - APPOINTMENT HISTORY: ${appointmentHistory}

      The patient now reports a new symptom: "${symptoms}". 

      INSTRUCTIONS:
      1. Analyze the new symptom in the context of their historical vitals and appointments.
      2. Provide a highly concise preliminary analysis in JSON format.
      3. CRITICAL: In the "advice" field, explicitly mention that you have reviewed their specific dashboard data (e.g., "After reviewing your heart rate trends and recent specialist visits...").
      
      JSON FORMAT:
      {
        "condition": "Likely Condition Name",
        "advice": "Informed medical advice mentioning reviewed data.",
        "confidence": "High/Moderate/Low"
      }
      If the symptoms are critical, start the advice with "EMERGENCY:".
      Only return the JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{.*\}/s);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        condition: 'Analysis Complete',
        advice: text,
        confidence: 'Variable'
      };

      setDiagnosis(parsed);
      setConsultationHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...parsed
      }, ...prev]);
    } catch (error) {
      console.error(error);
      setDiagnosis({
        condition: 'AI Connection Error',
        advice: `Error: ${error.message || 'Unknown error occurred'}. Please ensure your API key is valid and you have an active internet connection.`,
        confidence: 'N/A'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src={universityLogo} alt="WSB University" style={{ height: '60px', borderRadius: '8px' }} />
          <div>
            <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.05em' }}>MedCore <span style={{ color: 'var(--accent)' }}>AI</span></h1>
            <p style={{ color: 'var(--text-muted)' }}>Advanced Interdisciplinary Health Intelligence</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'btn-primary' : 'btn-ghost'}>Patient Portal</button>
          <button onClick={() => setActiveTab('checker')} className={activeTab === 'checker' ? 'btn-primary' : 'btn-ghost'}>Symptom Checker</button>
          <button onClick={() => setActiveTab('doctor')} className={activeTab === 'doctor' ? 'btn-primary' : 'btn-ghost'}>Doctor Portal</button>
          <button onClick={() => setActiveTab('docs')} className={activeTab === 'docs' ? 'btn-primary' : 'btn-ghost'}>Project Hub</button>
          <button onClick={() => setActiveTab('about')} className={activeTab === 'about' ? 'btn-primary' : 'btn-ghost'}>About Team</button>
        </nav>
      </header>

      <main>
        {activeTab === 'dashboard' ? (
          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', gridColumn: '1 / -1', overflow: 'hidden' }}>
              <h3>Health Summary</h3>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Heart Rate</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--medical-green)' }}>72 BPM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Blood Pressure</span>
                  <span style={{ fontWeight: 'bold' }}>120/80</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Oxygen Level (SpO2)</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>98%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Blood Glucose</span>
                  <span style={{ fontWeight: 'bold' }}>95 mg/dL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sleep Quality</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>84%</span>
                </div>
              </div>
              <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                <div style={{ height: '280px', minWidth: 0 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Heart Rate (BPM)</h4>
                  <ResponsiveContainer width="99%" height="100%">
                    <LineChart data={healthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="time" fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                      <YAxis domain={['60', '90']} fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-premium)', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="bpm" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ height: '280px', minWidth: 0 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Blood Pressure (mmHg)</h4>
                  <ResponsiveContainer width="99%" height="100%">
                    <LineChart data={healthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="time" fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                      <YAxis domain={['70', '130']} fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-premium)', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ height: '280px', minWidth: 0 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Oxygen (SpO2 %)</h4>
                  <ResponsiveContainer width="99%" height="100%">
                    <LineChart data={healthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="time" fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                      <YAxis domain={['95', '100']} fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-premium)', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ height: '280px', minWidth: 0 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Sleep Quality (%)</h4>
                  <ResponsiveContainer width="99%" height="100%">
                    <LineChart data={healthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="time" fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                      <YAxis domain={['70', '100']} fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-premium)', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3>Your Appointments</h3>
              <div style={{ marginTop: '1.5rem' }}>
                {appointments.map(app => (
                  <div key={app.id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                    <strong>{app.doctor}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.specialty} • {app.date} at {app.time}</div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Book New Specialist</button>
            </div>

            <div className="glass-card" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
              <h3>Consultation Archive</h3>
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {consultationHistory.length > 0 ? consultationHistory.map(item => (
                  <div key={item.id} className="history-item" style={{ padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.date} at {item.time}</div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.condition}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>
                      {item.advice}
                    </div>
                  </div>
                )) : (
                  <p style={{ color: 'var(--text-muted)' }}>No previous consultations found.</p>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'docs' ? (
          <div className="glass-card" style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <aside style={{ width: '250px', borderRight: '1px solid #eee', paddingRight: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Lab Deliverables</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li><a href="#final-report" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Final Project Report</a></li>
                  <li><a href="#impl-plan" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Implementation Plan</a></li>
                  <li><a href="#walkthrough" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Project Walkthrough</a></li>
                  <li><a href="#contributions" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Individual Contributions</a></li>
                </ul>
              </aside>

              <div style={{ flex: 1, maxHeight: '700px', overflowY: 'auto', paddingRight: '1rem' }} className="docs-content">
                <section id="final-report" style={{ marginBottom: '4rem' }}>
                  <h2 style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Final Project Report</h2>
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <p><strong>Executive Summary:</strong> MedCore AI is an interdisciplinary solution bridging Medical Science and Advanced Computing. Developed by the WSB University team—Maamar Haddouche, Alaeddine Benzaid, Abdennour Zakaria Cherifi, Noufel Benameur, and Student 59533.</p>
                    <h4 style={{ marginTop: '1.5rem' }}>Requirements Fulfillment:</h4>
                    <ul>
                      <li>Team-Oriented modular architecture.</li>
                      <li>Interdisciplinary Integration (Medicine, Engineering, Data Science).</li>
                      <li>Vite + React + Gemini 2.5 Flash Technology Stack.</li>
                    </ul>
                    <h4 style={{ marginTop: '1.5rem' }}>SDLC Phases:</h4>
                    <p>Requirements → Design → Implementation → Testing → Documentation.</p>
                  </div>
                </section>

                <section id="impl-plan" style={{ marginBottom: '4rem' }}>
                  <h2 style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Implementation Plan</h2>
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <p>Integrates Medicine with Computer Science via a modern AI-assisted interface for symptom checking and patient data management.</p>
                    <h4 style={{ marginTop: '1.5rem' }}>Core Modules:</h4>
                    <ul>
                      <li>Project Foundation (Glassmorphism & Vite).</li>
                      <li>Frontend Dashboards (Patient & Doctor).</li>
                      <li>Medical AI Integration (Symptom Knowledge Extraction).</li>
                      <li>SDLC & Agile Project Management.</li>
                    </ul>
                  </div>
                </section>

                <section id="walkthrough" style={{ marginBottom: '4rem' }}>
                  <h2 style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Project Walkthrough</h2>
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ marginTop: '1rem' }}>1. Holistic Symptom Intelligence</h4>
                    <p>Powered by Gemini 2.5 Flash. Context-aware analysis of HR, BP, SpO2, and history.</p>
                    <h4 style={{ marginTop: '1rem' }}>2. Visual Analytics</h4>
                    <p>Interactive multi-metric charts for real-time vitals tracking.</p>
                    <h4 style={{ marginTop: '1rem' }}>3. Branding & UX</h4>
                    <p>WSB University institutional branding, team portal, and premium glassmorphic design.</p>
                  </div>
                </section>

                <section id="contributions" style={{ marginBottom: '4rem' }}>
                  <h2 style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Individual Contributions</h2>
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ marginTop: '1rem' }}>Maamar Haddouche:</h4>
                    <p>Team Lead, Full-Stack Architecture, SDLC Management.</p>
                    <h4 style={{ marginTop: '1rem' }}>Alaeddine Benzaid:</h4>
                    <p>AI Integration Specialist, Gemini 2.5 Logic, Safety Systems.</p>
                    <h4 style={{ marginTop: '1rem' }}>Abdennour Zakaria Cherifi:</h4>
                    <p>Data Systems Engineer, Recharts Vital Visualization, Archives.</p>
                    <h4 style={{ marginTop: '1rem' }}>Noufel Benameur:</h4>
                    <p>Frontend & UX Engineer, Glassmorpic Design, Institutional Branding.</p>
                    <h4 style={{ marginTop: '1rem' }}>Housseyn Azieze:</h4>
                    <p>Systems Analyst, Quality Assurance, Documentation Support.</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : activeTab === 'checker' ? (
          <div className="glass-card" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Symptom Intelligence</h2>
              <input
                type="password"
                placeholder="Gemini API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee', width: '150px' }}
              />
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your symptoms below for a real generative AI analysis powered by Gemini.</p>

            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have sharp chest pain and difficulty breathing..."
              style={{ width: '100%', minHeight: '150px', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1rem', marginBottom: '1.5rem', fontSize: '1rem', outline: 'none' }}
            />

            <button
              onClick={handleCheckSymptoms}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
              disabled={loading}
            >
              {loading ? <div className="spinner"></div> : 'Run Real AI Diagnostic'}
            </button>

            {diagnosis && (
              <div className="diagnosis-result" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(14, 165, 233, 0.05)', border: '1px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--accent)', margin: 0 }}>Preliminary Finding: {diagnosis.condition}</h4>
                  <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: 'white', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold' }}>HOLISTIC CONTEXT INFORMED</span>
                </div>
                <p>{diagnosis.advice}</p>
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Confidence Score: {diagnosis.confidence}</div>
              </div>
            )}
          </div>
        ) : activeTab === 'about' ? (
          <div className="glass-card" style={{ padding: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <img src={universityLogo} alt="WSB University" style={{ height: '100px', marginBottom: '1.5rem' }} />
              <h2>WSB University - MedCore AI Team</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto' }}>
                This project represents an interdisciplinary collaboration between Software Engineering and Health Sciences, developed as part of our academic portfolio.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              {teamMembers.map(member => (
                <div key={member.id} className="glass-card history-item" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--accent)', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {member.name.charAt(member.name.length - 1)}
                  </div>
                  <h4 style={{ marginBottom: '0.25rem' }}>{member.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '0.25rem' }}>ID: {member.id}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.role}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem' }}>Project Mission</h3>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                "To leverage generative AI for proactive health monitoring and diagnostics, creating a seamless bridge between patients and clinicians through high-fidelity data visualization."
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '3rem' }}>
            <h2>Professional Oversight Portal</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Restricted access for medical personnel. Monitor patient alerts and diagnostic trends.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid #eee' }}>
                <h4>Active Consultations</h4>
                <div style={{ marginTop: '1rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>No active video sessions.</div>
              </div>
              <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid #eee' }}>
                <h4>AI Insights Workflow</h4>
                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                  <li>Auto-flagged anomalies: 3</li>
                  <li>Drafted reports pending review: 5</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .btn-ghost {
          background: transparent;
          color: var(--text-main);
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid transparent;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MedCoreApp;
