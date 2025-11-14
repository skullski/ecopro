import { useEffect, useState } from "react";

export default function AdminWasselniSettings() {
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('default');
  const [dialect, setDialect] = useState('algerian');
  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: false,
    viber: false
  });

  useEffect(() => {
    const cfg = JSON.parse(localStorage.getItem('wasselni_cfg') || '{}');
    if (cfg.script) setScript(cfg.script);
    if (cfg.voice) setVoice(cfg.voice);
    if (cfg.dialect) setDialect(cfg.dialect);
    if (cfg.channels) setChannels(cfg.channels);
  }, []);

  function save() {
    const cfg = { script, voice, dialect, channels };
    localStorage.setItem('wasselni_cfg', JSON.stringify(cfg));
    alert('تم حفظ إعدادات وصلني (محلياً)');
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">إعدادات وصلني</h2>
      <div className="grid gap-4 max-w-2xl">
        <div className="rounded-lg border bg-card p-4">
          <label className="block font-bold">نص المكالمة الافتراضي</label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            rows={4}
          />
        </div>

        <div className="rounded-lg border bg-card p-4">
          <label className="block font-bold">الصوت</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="mt-2 rounded-md border bg-background px-3 py-2"
          >
            <option value="default">Default</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <label className="block font-bold">اللهجة</label>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="mt-2 rounded-md border bg-background px-3 py-2"
          >
            <option value="algerian">اللهجة الجزائرية</option>
            <option value="moroccan">اللهجة المغربية</option>
            <option value="tunisian">اللهجة التونسية</option>
          </select>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <label className="block font-bold">قنوات الإشعارات</label>
          <div className="mt-2 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-primary">
              <input
                type="checkbox"
                checked={channels.sms}
                onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                className="rounded border-primary text-primary focus:ring-primary bg-background"
              />
              SMS
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-primary">
              <input
                type="checkbox"
                checked={channels.whatsapp}
                onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                className="rounded border-primary text-primary focus:ring-primary bg-background"
              />
              WhatsApp
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-primary">
              <input
                type="checkbox"
                checked={channels.viber}
                onChange={(e) => setChannels({ ...channels, viber: e.target.checked })}
                className="rounded border-primary text-primary focus:ring-primary bg-background"
              />
              Viber
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={save}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
