import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const token = localStorage.getItem('s_token');
        const res = await fetch(`http://localhost:3001/api/missions/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error('Mission not found');
        const data = await res.json();
        setMission(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const downloadAll = () => {
    if (!mission) return;
    const content = `SENTINEL ASSEMBLY — MISSION REPORT
================================================
Title        : ${mission.title}
Personality  : ${mission.personality || 'professional'}
Date         : ${new Date(mission.created_at).toLocaleString()}
Loops        : ${mission.total_attempts}
Confidence   : ${mission.confidence}%

FACT SHEET
----------
${JSON.stringify(mission.fact_sheet, null, 2)}

BLOG POST
---------
${mission.blog_content}

SOCIAL THREAD
-------------
${Array.isArray(mission.social_content) 
  ? mission.social_content.map((p, i) => `POST ${i+1}:\n${p}`).join('\n\n')
  : mission.social_content}

EMAIL TEASER
------------
${mission.email_content}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sentinel-Mission-${mission.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="full-page" style={{ color: '#0f0', textAlign: 'center', paddingTop: '120px' }}>Loading mission intelligence...</div>;
  }

  if (error || !mission) {
    return (
      <div className="full-page" style={{ color: '#f66', textAlign: 'center', paddingTop: '120px' }}>
        {error || 'Mission not found'}
        <br /><br />
        <button className="btn-primary" onClick={() => navigate('/')}>← Return to Sentinel Assembly</button>
      </div>
    );
  }

  return (
    <div className="full-page" style={{ padding: '30px 40px', overflow: 'auto', background: '#050a14' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            background: 'transparent', border: '1px solid #0f0', color: '#0f0', 
            padding: '10px 24px', fontSize: '14px', cursor: 'pointer', borderRadius: '6px'
          }}
        >
          ← Back to Sentinel Assembly
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={downloadAll} className="btn-primary">
            ↓ Download Full Report
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{ 
          fontSize: 'clamp(32px, 5vw, 48px)', 
          fontWeight: 800, 
          letterSpacing: '-0.03em', 
          color: '#fff', 
          marginBottom: '8px' 
        }}>
          {mission.title}
        </h1>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <span className="chip chip-dim">{mission.personality || 'professional'}</span>
          <span className="chip chip-green">{mission.confidence}% Confidence</span>
          <span className="chip chip-dim">{mission.total_attempts} loops</span>
          <span className="chip chip-dim">
            {new Date(mission.created_at).toLocaleDateString('en-GB')}
          </span>
        </div>

        {/* Fact Sheet */}
        <div className="card" style={{ marginBottom: '50px', padding: '28px' }}>
          <div className="output-card-head">
            <span className="font-m" style={{ fontSize: 10, color: '#0f0', letterSpacing: '0.15em' }}>GROUND TRUTH</span>
            <span className="font-d" style={{ fontSize: 18, fontWeight: 700 }}>Fact Sheet</span>
          </div>
          <pre style={{ 
            background: '#0a0a0a', padding: '24px', borderRadius: '12px', 
            fontSize: '13px', lineHeight: '1.6', overflow: 'auto', maxHeight: '340px'
          }}>
            {JSON.stringify(mission.fact_sheet, null, 2)}
          </pre>
        </div>

        {/* Blog */}
        <div style={{ marginBottom: '60px' }}>
          <div className="output-card-head" style={{ marginBottom: '16px' }}>
            <span className="font-m" style={{ fontSize: 10, color: '#0099ff', letterSpacing: '0.15em' }}>OUTPUT-01</span>
            <span className="font-d" style={{ fontSize: 18, fontWeight: 700 }}>Blog Post</span>
          </div>
          <div className="card" style={{ padding: '32px', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>
            {mission.blog_content}
            <button className="btn-ghost" style={{ marginTop: '24px' }} onClick={() => copyToClipboard(mission.blog_content, 'Blog Post')}>
              Copy Blog Post
            </button>
          </div>
        </div>

        {/* Social Thread */}
        <div style={{ marginBottom: '60px' }}>
          <div className="output-card-head" style={{ marginBottom: '16px' }}>
            <span className="font-m" style={{ fontSize: 10, color: '#ffaa00', letterSpacing: '0.15em' }}>OUTPUT-02</span>
            <span className="font-d" style={{ fontSize: 18, fontWeight: 700 }}>Social Media Thread</span>
          </div>
          <div className="card" style={{ padding: '28px' }}>
            {Array.isArray(mission.social_content) ? (
              mission.social_content.map((post, i) => (
                <div key={i} style={{ marginBottom: '24px', padding: '18px', background: '#111', borderRadius: '10px', borderLeft: '4px solid #ffaa00' }}>
                  <strong style={{ color: '#ffaa00' }}>POST {i+1}</strong><br />
                  {post}
                </div>
              ))
            ) : (
              <div className="content-block">{mission.social_content}</div>
            )}
            <button className="btn-ghost" onClick={() => copyToClipboard(JSON.stringify(mission.social_content), 'Social Thread')}>
              Copy Entire Thread
            </button>
          </div>
        </div>

        {/* Email */}
        <div>
          <div className="output-card-head" style={{ marginBottom: '16px' }}>
            <span className="font-m" style={{ fontSize: 10, color: '#b066ff', letterSpacing: '0.15em' }}>OUTPUT-03</span>
            <span className="font-d" style={{ fontSize: 18, fontWeight: 700 }}>Email Teaser</span>
          </div>
          <div className="card" style={{ padding: '32px', whiteSpace: 'pre-wrap', lineHeight: '1.75' }}>
            {mission.email_content}
            <button className="btn-ghost" style={{ marginTop: '24px' }} onClick={() => copyToClipboard(mission.email_content, 'Email Teaser')}>
              Copy Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}