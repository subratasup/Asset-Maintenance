/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Server, Key, Lock, CheckCircle2, FileCode, Terminal, HelpCircle, Copy, AlertTriangle } from 'lucide-react';

export default function SecurityGuide() {
  const [domain, setDomain] = useState('assets.esteeminfra.com');
  const [ipAddress, setIpAddress] = useState('124.53.112.90');
  const [sshPort, setSshPort] = useState('2222');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const nginxConfig = `server {
    listen 80;
    listen [::]:80;
    server_name ${domain};

    # Automatically redirect all traffic to safe HTTPS port
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain};

    # Strict SSL configurations & Modern Ciphers
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions
    ssl_session_tickets off;

    # modern configuration
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Security Headers for browser protection
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none';" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Anti-DDos Rate Limiting (Needs setup in nginx.conf)
    limit_req zone=req_limit_per_ip burst=20 delay=8;

    access_log /var/log/nginx/asset_tracker_access.log;
    error_log /var/log/nginx/asset_tracker_error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Upgrade headers for WebSockets if needed
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Keep client IP forwarding intact
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Prevent buffer overflow risk
        proxy_buffers 16 16k;
        proxy_buffer_size 32k;
    }
}`;

  const ufwCommands = `# 1. Set default policies to deny incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow essential HTTP and HTTPS ports for custom web assets
sudo ufw allow 80/tcp comment 'Nginx HTTP'
sudo ufw allow 443/tcp comment 'Nginx HTTPS SSL'

# 3. Allow hardened custom SSH port
sudo ufw allow ${sshPort}/tcp comment 'Hardened SSH Port'

# 4. Enable firewall safely
sudo ufw enable

# 5. Check firewall configuration list
sudo ufw status verbose`;

  const sshHardening = `# Edit the system SSH daemon file
sudo nano /etc/ssh/sshd_config

# Match the following critical variables inside:
Port ${sshPort}
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
X11Forwarding no
AllowUsers ubuntu admin

# Verify SSH configuration and restart service
sudo ssh-keygen -t
sudo sshd -t && sudo systemctl restart ssh`;

  const systemdService = `[Unit]
Description=Asset Maintenance and Tracking System App Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/asset-tracker
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target`;

  return (
    <div className="bg-slate-50 min-h-screen p-6" id="security-guide-container">
      {/* Top Banner */}
      <div className="max-w-5xl mx-auto mb-8 bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center pr-12">
          <Shield size={240} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Lock size={12} />
            MIL-SPEC CYBERSECURITY HARDENING SYSTEM
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans">
            VPS Security & Hardening Configuration Center
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
            Generate customized, bullet-proof installation blueprints to host this Asset application on your self-managed Ubuntu Linux VPS. Features custom ports, Nginx proxy, Let's Encrypt SSL, and aggressive firewall shields.
          </p>
        </div>
      </div>

      {/* Dynamic Variables Box */}
      <div className="max-w-5xl mx-auto mb-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-base">
          <Server size={18} className="text-indigo-600" />
          Set Your VPS Production Environment Variables
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          The code listings below automatically update based on your domain and security parameters to simplify deployment copy-pasting.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Your Registered Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. assets.esteeminfra.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Your Public VPS IP Address
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 124.53.112.90"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Hardened Custom SSH Port
            </label>
            <input
              type="text"
              value={sshPort}
              onChange={(e) => setSshPort(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 2222"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Changes port from generic 22 to prevent automated brute-force attacks.
            </span>
          </div>
        </div>
      </div>

      {/* Main Roadmap */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-10">
        
        {/* Step 1: Firewall */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-orange-50 text-orange-600 p-3 rounded-lg border border-orange-100 font-bold font-mono">
              01
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                UFW Firewall Shield Configuration (safe from hackers)
                <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  CRITICAL
                </span>
              </h2>
              <p className="text-sm text-slate-600 mt-1 mb-4 leading-relaxed">
                By default, UFW locks down access to every incoming port. You must open only specific channels: Nginx (port 80 & 443) to serve the app publicly, and your randomized SSH port (port {sshPort}) to let you log in.
              </p>

              <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-64 border border-slate-900">
                <button
                  onClick={() => handleCopy(ufwCommands, 'ufw')}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-900/80 p-1.5 rounded transition"
                  title="Copy Code"
                >
                  {copiedText === 'ufw' ? <span className="text-emerald-400 font-sans text-[11px] font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Copied!</span> : <Copy size={14} />}
                </button>
                <pre>{ufwCommands}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: SSH Hardening */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg border border-indigo-100 font-bold font-mono">
              02
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Hardening SSH Keys & Blocking Password Logins
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  RECOMMENDED
                </span>
              </h2>
              <p className="text-sm text-slate-600 mt-1 mb-4 leading-relaxed">
                Most automated bots crack servers via weak passwords. By disabling standard root password login and forcing <strong>ED25519 Pubkey Access Only</strong> on custom port <code>{sshPort}</code>, you block over 99.9% of brute force break-in attempts.
              </p>

              <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-64 border border-slate-900">
                <button
                  onClick={() => handleCopy(sshHardening, 'ssh')}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-900/80 p-1.5 rounded transition"
                  title="Copy Code"
                >
                  {copiedText === 'ssh' ? <span className="text-emerald-400 font-sans text-[11px] font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Copied!</span> : <Copy size={14} />}
                </button>
                <pre>{sshHardening}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Nginx SSL reverse proxy */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg border border-emerald-100 font-bold font-mono">
              03
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Deploying Nginx Secure Reverse Proxy & HSTS Header
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SSL/HTTPS READY
                </span>
              </h2>
              <p className="text-sm text-slate-600 mt-1 mb-4 leading-relaxed">
                Nginx acts as a high-performance shield for Node.js. It terminates SSL, enforces browser-side clickjacking locks (X-Frame-Options/CSP), blocks automated port scans, and enables high-performance HTTP/2 transit with GZIP compression.
              </p>

              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-4 flex items-start gap-2 text-xs text-emerald-800 leading-relaxed">
                <AlertTriangle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-emerald-950 block mb-1">Privacy Breaches Avoided via HSTS:</strong>
                  The configuration below includes strict <code>Strict-Transport-Security</code> headers for 2 years (63072000s) with preloading. This forces major browsers to always encrypt connections to <code>{domain}</code>, preventing man-in-the-middle sniffing of active user sessions.
                </div>
              </div>

              <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-96 border border-slate-900">
                <button
                  onClick={() => handleCopy(nginxConfig, 'nginx')}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-900/80 p-1.5 rounded transition"
                  title="Copy Code"
                >
                  {copiedText === 'nginx' ? <span className="text-emerald-400 font-sans text-[11px] font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Copied!</span> : <Copy size={14} />}
                </button>
                <pre>{nginxConfig}</pre>
              </div>

              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-4">
                <h4 className="font-bold text-slate-800 text-xs mb-2">How to install & register SSL certificates via Let's Encrypt:</h4>
                <div className="bg-slate-950 text-slate-300 font-mono text-xs p-3 rounded border border-slate-900 overflow-x-auto relative">
                  <button
                    onClick={() => handleCopy('sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx && sudo certbot --nginx -d ' + domain, 'certbot')}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    {copiedText === 'certbot' ? 'Copied' : <Copy size={12} />}
                  </button>
                  sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx<br />
                  sudo certbot --nginx -d {domain}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-normal">
                  Certbot automatically performs Domain Verification, edits Nginx configuration correctly, and configures a monthly systemd cron to auto-renew your SSL certificate before expiration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Systemd Node daemon */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-12">
          <div className="flex items-start gap-4">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-lg border border-purple-100 font-bold font-mono">
              04
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">
                Daemonizing the Application as an Ubuntu systemd Service
              </h2>
              <p className="text-sm text-slate-600 mt-1 mb-4 leading-relaxed">
                Ensure this Asset Management application automatically boots whenever your VPS experiences a power cycle or hard restart. Save this configuration file to <code>/etc/systemd/system/asset-tracker.service</code>.
              </p>

              <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-64 border border-slate-900">
                <button
                  onClick={() => handleCopy(systemdService, 'systemd')}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-900/80 p-1.5 rounded transition"
                  title="Copy Code"
                >
                  {copiedText === 'systemd' ? <span className="text-emerald-400 font-sans text-[11px] font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Copied!</span> : <Copy size={14} />}
                </button>
                <pre>{systemdService}</pre>
              </div>

              <div className="mt-4 flex items-center gap-2 bg-indigo-50/50 text-indigo-900 border border-indigo-100/50 p-3 rounded-lg text-xs leading-normal">
                <Terminal size={16} className="text-indigo-600 shrink-0" />
                <div>
                  <strong>Launch Commands:</strong> To enable and monitor the auto-restart daemon: <br />
                  <code className="bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">sudo systemctl daemon-reload && sudo systemctl enable asset-tracker && sudo systemctl start asset-tracker</code>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
