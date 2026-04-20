"use client";
import { useState } from "react";
import { X, Download, Terminal, Package, Copy, Check, ChevronRight } from "lucide-react";
import type { Device } from "@/lib/api";
import clsx from "clsx";

interface Props {
  devices: Device[];
  onClose: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button onClick={copy}
      className="shrink-0 p-1.5 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-200">
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="px-4 py-3 text-sm font-mono text-gray-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

export default function SetupModal({ devices, onClose }: Props) {
  const [tab, setTab]           = useState<"script" | "manual">("script");
  const [selectedId, setSelected] = useState(devices[0]?.id ?? "");

  const device = devices.find(d => d.id === selectedId);
  const SERVER = "wss://signage.xshield.com.tr";

  const scriptCmd = device
    ? `sudo bash install.sh \\\n  --device-id ${device.id} \\\n  --api-key   ${device.api_key} \\\n  --server    ${SERVER}`
    : "— Önce bir cihaz seçin —";

  const manualEnvCmd = device
    ? `export SIGNAGE_SERVER="${SERVER}"\nexport SIGNAGE_DEVICE_ID="${device.id}"\nexport SIGNAGE_API_KEY="${device.api_key}"`
    : "";

  const manualRunCmd = `python3 agent.py`;

  const serviceCmd = device
    ? `SIGNAGE_SERVER=${SERVER} \\\nSIGNAGE_DEVICE_ID=${device.id} \\\nSIGNAGE_API_KEY=${device.api_key} \\\npython3 /opt/xsignage/agent.py`
    : "";

  const AGENT_BASE = "/agent";  // proxied through nginx → signage_api:8000/agent

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Agent Kurulum Kılavuzu</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Raspberry Pi veya Linux bilgisayara xSignage agent kurun
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Device selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hangi cihaza kuracaksınız?
            </label>
            <select value={selectedId} onChange={e => setSelected(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
              {devices.length === 0 && <option value="">— Önce cihaz ekleyin —</option>}
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}{d.location ? ` — ${d.location}` : ""}
                </option>
              ))}
            </select>
            {device && (
              <p className="text-xs text-gray-400 mt-1.5 font-mono">
                ID: {device.id}
              </p>
            )}
          </div>

          {/* Downloads */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Agent dosyaları</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { file: "agent.py",       label: "agent.py",       desc: "Ana script" },
                { file: "requirements.txt", label: "requirements.txt", desc: "Python bağımlılıkları" },
                { file: "install.sh",     label: "install.sh",     desc: "Otomatik yükleyici" },
              ].map(({ file, label, desc }) => (
                <a key={file} href={`${AGENT_BASE}/${file}`} download={file}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 hover:bg-gray-50 hover:border-brand/40 transition-colors group">
                  <Download size={15} className="text-brand group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-400">{desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Method tabs */}
          <div>
            <div className="flex border-b border-gray-100 mb-4">
              {([
                { key: "script", label: "Otomatik Kurulum", icon: Package },
                { key: "manual", label: "Manuel Kurulum",   icon: Terminal },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                    tab === key
                      ? "border-brand text-brand"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* ── Otomatik kurulum ── */}
            {tab === "script" && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
                  <strong>Gereksinimler:</strong> Raspberry Pi OS (Bullseye+) veya Debian/Ubuntu tabanlı Linux.
                  Chromium ve Python 3 otomatik kurulur.
                </div>

                <div className="space-y-3">
                  <Step n={1} title="install.sh'ı Raspberry Pi'ye aktarın">
                    <p className="text-sm text-gray-600 mb-2">
                      USB, SCP veya doğrudan indirin:
                    </p>
                    <CodeBlock code={`scp install.sh pi@<raspberry-pi-ip>:~/`} />
                  </Step>

                  <Step n={2} title="Script'i çalıştırın">
                    <CodeBlock code={scriptCmd} />
                  </Step>

                  <Step n={3} title="Bitti!">
                    <p className="text-sm text-gray-600">
                      Agent otomatik olarak <code className="bg-gray-100 px-1 rounded">xsignage</code> servis adıyla
                      başlatılır ve sistem açılışında otomatik çalışır.
                    </p>
                    <CodeBlock code={`# Durumu kontrol et\nsystemctl status xsignage\n\n# Logları izle\njournalctl -u xsignage -f`} />
                  </Step>
                </div>
              </div>
            )}

            {/* ── Manuel kurulum ── */}
            {tab === "manual" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Step n={1} title="Python bağımlılıklarını kurun">
                    <CodeBlock code={`pip3 install websockets httpx aiohttp aiofiles`} />
                  </Step>

                  <Step n={2} title="agent.py'yi indirin veya kopyalayın">
                    <CodeBlock code={`# İndirin\nwget https://signage.xshield.com.tr/agent/agent.py\n\n# veya SCP ile aktarın\nscp agent.py pi@<raspberry-pi-ip>:/opt/xsignage/`} />
                  </Step>

                  <Step n={3} title="Ortam değişkenlerini ayarlayın">
                    <CodeBlock code={manualEnvCmd || "— Önce cihaz seçin —"} />
                  </Step>

                  <Step n={4} title="Agent'ı başlatın">
                    <CodeBlock code={manualRunCmd} />
                  </Step>

                  <Step n={5} title="Opsiyonel: systemd servisi olarak kaydedin">
                    <p className="text-sm text-gray-600 mb-2">
                      Sistem açılışında otomatik başlaması için:
                    </p>
                    <CodeBlock code={`sudo nano /etc/systemd/system/xsignage.service`} />
                    <div className="mt-2">
                      <CodeBlock lang="ini" code={`[Unit]
Description=xSignage Display Agent
After=network-online.target graphical.target

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/python3 /opt/xsignage/agent.py
Environment="SIGNAGE_SERVER=${SERVER}"${device ? `\nEnvironment="SIGNAGE_DEVICE_ID=${device.id}"\nEnvironment="SIGNAGE_API_KEY=${device.api_key}"` : ""}
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target`} />
                    </div>
                    <div className="mt-2">
                      <CodeBlock code={`sudo systemctl daemon-reload\nsudo systemctl enable xsignage\nsudo systemctl start  xsignage`} />
                    </div>
                  </Step>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 mb-1.5">{title}</p>
        {children}
      </div>
    </div>
  );
}
