/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bot, Send, RefreshCw, Sparkles, HelpCircle, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { Asset } from '../types';

interface AiAssistantProps {
  assets: Asset[];
  selectedCompanyId: string;
}

export default function AiAssistant({ assets, selectedCompanyId }: AiAssistantProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; date: string }>>([
    {
      sender: 'bot',
      text: 'Good day! I am your ESTEEM Fleet Security & System Assistant. Ask me to lookup asset tags, explain Let\'s Encrypt Nginx setup, or draft auditing checklists for your upcoming fleet inspections.',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMsg,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const normalUserQuery = userMsg.toLowerCase();

      // Simple keywords router providing rich, professional visual outputs
      if (normalUserQuery.includes('tag') || normalUserQuery.includes('eip-') || normalUserQuery.includes('estm-')) {
        const found = assets.find(a => normalUserQuery.includes(a.assetTagNo.toLowerCase()) && a.companyId === selectedCompanyId);
        if (found) {
          botResponse = `🔍 **Tag Match Found in Central Database:**\n\n- **Tag No:** ${found.assetTagNo}\n- **Product:** ${found.itemName}\n- **Current Custody:** ${found.allottedToName}\n- **Landed Acquisition:** ₹${found.rate.toLocaleString('en-IN')}\n- **Warranty Months:** ${found.warrantyMonths} Months\n\nIs there anything else I should trace for this serial node?`;
        } else {
          botResponse = `🔍 **Tag Lookup Result:**\nSpecified asset serial tag not recognized in this corporate subsidiary. Try verifying existing tags: \n\n${assets.map(a => a.assetTagNo).slice(0, 3).join(', ')}`;
        }
      } else if (normalUserQuery.includes('ssl') || normalUserQuery.includes('nginx') || normalUserQuery.includes('domain')) {
        botResponse = `🔒 **High-Security Nginx & SSL Guidelines:**\n\n1. Ensure you have registered your custom domain pointing to your VPS public IPv4 Address.\n2. Open UFW ports 80, 443 and your hardened custom SSH port.\n3. Spin Let's Encrypt Certbot via command: \n   \`\`\`bash\n   sudo apt-get update && sudo apt-get install python3-certbot-nginx -y && sudo certbot --nginx\n   \`\`\`\n4. Force HSTS headers in Nginx to mitigate eavesdropping and session poisoning threats. See the detailed blueprinted code in the **Security Hardening Wizard** tab of this dashboard!`;
      } else if (normalUserQuery.includes('ufw') || normalUserQuery.includes('firewall') || normalUserQuery.includes('hacker')) {
        botResponse = `🛡️ **Firewall Hardening Rules:**\n\nTo lock out automated hacking tools and brute-force scanners, enforce a whitelist-only policy on UFW:\n\n\`\`\`bash\n# Deny all incoming except declared ones\nsudo ufw default deny incoming\nsudo ufw allow 443/tcp comment 'SSL HTTPS'\nsudo ufw allow 80/tcp comment 'HTTP Redirect'\nsudo ufw allow 2222/tcp comment 'Hardened SSH Port'\nsudo ufw enable\n\`\`\``;
      } else if (normalUserQuery.includes('audit') || normalUserQuery.includes('reconcil')) {
        botResponse = `📋 **Field Safety Audit Checklist Draft:**\n\n- **Visual Shell Verification:** Inspect structural housings, cords, and terminal connectors.\n- **QR Code Integrity:** Ensure labels are physically legible and unscrubbed.\n- **Serials Match:** Verify underlying manufacturer serial markings against scanned ledger records.\n\nYou can submit verified field audit logs in the **Transfers & Audits** tab!`;
      } else {
        botResponse = `I have logged your query about: "${userMsg}". \n\nYou can explore active sections of target masters, operations (generating GRNs/PO contracts), and scanning tags. Try asking me direct lookups like:\n- *"Tag lookup EIP-12345"* \n- *"How to configure Nginx SSL"* \n- *"Generate audit guidelines"*`;
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botResponse,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[520px]" id="copilot-tab">
      
      {/* Bot Header */}
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl border border-indigo-500 shadow-md">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              ESTEEM Fleet AI Copilot
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">SECURED MULTI-SUBSIDIARY SYSTEM</span>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([{
              sender: 'bot',
              text: 'Good day! Workspace conversation logs reset. How can I assist you with security parameters or tag registry lookups?',
              date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition"
          title="Reset Conversation"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages stage */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed border ${
              m.sender === 'user'
                ? 'bg-slate-900 border-slate-950 text-white ml-auto rounded-tr-none'
                : 'bg-slate-50 border-slate-205 text-slate-800 rounded-tl-none'
            }`}
          >
            {/* Formatted Text renderer */}
            <div className="whitespace-pre-wrap select-text">{m.text}</div>
            
            <span className={`text-[8.5px] mt-2 block font-mono ${m.sender === 'user' ? 'text-slate-500 text-right' : 'text-slate-400'}`}>
              {m.date}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="bg-slate-50 border border-slate-205 text-slate-400 text-xs rounded-2xl rounded-tl-none p-4 max-w-[120px] italic flex items-center gap-2">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce [animation-delay:0.2s]">●</span>
            <span className="animate-bounce [animation-delay:0.4s]">●</span>
          </div>
        )}

      </div>

      {/* Inputs box */}
      <form onSubmit={handleSend} className="border-t border-slate-100 pt-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Lookup tag / Ask how to secure Nginx / Request audit plan"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-2.5 shadow-sm shrink-0 transition"
        >
          <Send size={15} />
        </button>
      </form>

    </div>
  );
}
