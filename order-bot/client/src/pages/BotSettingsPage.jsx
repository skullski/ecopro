import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BotSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState({ whatsapp: '', sms: '' });
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchSettings(token);
  }, [navigate]);

  const fetchSettings = async (token) => {
    try {
      const response = await fetch('/api/bot-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setSettings(data.settings);
      setLanguage(data.settings.language || 'en');
      generatePreviews(data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreviews = async (currentSettings) => {
    const token = localStorage.getItem('token');

    try {
      const [whatsappRes, smsRes] = await Promise.all([
        fetch('/api/bot-settings/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            template: currentSettings.whatsapp_template,
            type: 'whatsapp',
          }),
        }),
        fetch('/api/bot-settings/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            template: currentSettings.sms_template,
            type: 'sms',
          }),
        }),
      ]);

      const [whatsappData, smsData] = await Promise.all([
        whatsappRes.json(),
        smsRes.json(),
      ]);

      setPreview({
        whatsapp: whatsappData.preview,
        sms: smsData.preview,
      });
    } catch (error) {
      console.error('Failed to generate previews:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bot-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Settings saved successfully!');
        setSettings(data.settings);
        generatePreviews(data.settings);
      } else {
        setMessage('❌ ' + (data.error || 'Failed to save settings'));
      }
    } catch (error) {
      setMessage('❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    generatePreviews(newSettings);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🤖 Bot Settings</h1>
          <p style={styles.subtitle}>Customize how your bot communicates with buyers</p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {message && (
        <div style={styles.message}>
          {message}
        </div>
      )}

      {/* Branding Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏪 Branding</h2>
        
        <div style={styles.field}>
          <label style={styles.label}>Language</label>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              updateField('language', e.target.value);
            }}
            style={styles.input}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
          <p style={styles.hint}>
            Default language for bot messages (if no custom template set)
          </p>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Company Name</label>
          <input
            type="text"
            value={settings.company_name || ''}
            onChange={(e) => updateField('company_name', e.target.value)}
            style={styles.input}
            placeholder="e.g., Tech Store DZ"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Support Phone</label>
          <input
            type="text"
            value={settings.support_phone || ''}
            onChange={(e) => updateField('support_phone', e.target.value)}
            style={styles.input}
            placeholder="e.g., +213555123456"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Store URL</label>
          <input
            type="text"
            value={settings.store_url || ''}
            onChange={(e) => updateField('store_url', e.target.value)}
            style={styles.input}
            placeholder="e.g., https://facebook.com/yourstore"
          />
        </div>
      </div>

      {/* Timing Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⏰ Message Timing</h2>
        
        <div style={styles.field}>
          <label style={styles.label}>WhatsApp Delay (minutes)</label>
          <input
            type="number"
            value={settings.whatsapp_delay}
            onChange={(e) => updateField('whatsapp_delay', parseInt(e.target.value))}
            style={styles.input}
            min="1"
          />
          <p style={styles.hint}>
            Currently: {Math.floor(settings.whatsapp_delay / 60)}h {settings.whatsapp_delay % 60}m
          </p>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>SMS Delay (minutes)</label>
          <input
            type="number"
            value={settings.sms_delay}
            onChange={(e) => updateField('sms_delay', parseInt(e.target.value))}
            style={styles.input}
            min="1"
          />
          <p style={styles.hint}>
            Currently: {Math.floor(settings.sms_delay / 60)}h {settings.sms_delay % 60}m
          </p>
        </div>

        <div style={styles.checkboxField}>
          <input
            type="checkbox"
            checked={settings.sms_enabled}
            onChange={(e) => updateField('sms_enabled', e.target.checked)}
            style={styles.checkbox}
          />
          <label style={styles.checkboxLabel}>Enable SMS Messages</label>
        </div>
      </div>

      {/* WhatsApp Template */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📱 WhatsApp Message Template</h2>
        
        <div style={styles.variablesInfo}>
          <strong>Available variables:</strong> {'{buyer_name}'}, {'{order_number}'}, {'{product_name}'}, {'{quantity}'}, {'{total_price}'}, {'{confirmation_link}'}, {'{company_name}'}, {'{support_phone}'}, {'{store_url}'}
        </div>

        <textarea
          value={settings.whatsapp_template}
          onChange={(e) => updateField('whatsapp_template', e.target.value)}
          style={styles.textarea}
          rows="10"
        />

        <div style={styles.preview}>
          <h3 style={styles.previewTitle}>Preview:</h3>
          <div style={styles.previewBox}>
            {preview.whatsapp.split('\n').map((line, i) => (
              <div key={i}>{line || <br />}</div>
            ))}
          </div>
        </div>
      </div>

      {/* SMS Template */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📨 SMS Message Template</h2>
        
        <div style={styles.variablesInfo}>
          <strong>Tip:</strong> Keep SMS messages short (under 160 characters for best delivery)
        </div>

        <textarea
          value={settings.sms_template}
          onChange={(e) => updateField('sms_template', e.target.value)}
          style={styles.textarea}
          rows="4"
        />

        <div style={styles.preview}>
          <h3 style={styles.previewTitle}>Preview:</h3>
          <div style={styles.previewBox}>
            {preview.sms}
          </div>
          <p style={styles.charCount}>
            Character count: {preview.sms.length} / 160
          </p>
        </div>
      </div>

      <button onClick={handleSave} style={styles.saveButton} disabled={saving}>
        {saving ? 'Saving...' : '💾 Save Settings'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  message: {
    padding: '15px',
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  section: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
  },
  checkboxField: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#333',
  },
  variablesInfo: {
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '15px',
    lineHeight: '1.6',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  preview: {
    marginTop: '20px',
  },
  previewTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    marginBottom: '10px',
  },
  previewBox: {
    padding: '15px',
    backgroundColor: '#25D366',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  charCount: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
  },
  saveButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px',
  },
};
