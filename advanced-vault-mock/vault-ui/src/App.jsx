import React, { useState, useEffect } from 'react';
import { vault } from './lib/vault';
import { Lock, Unlock, Shield, Key, PenTool, RefreshCcw, Trash2, Cpu } from 'lucide-react';

function App() {
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [isLocked, setIsLocked] = useState(vault.isLocked());
  const [isInitialized, setIsInitialized] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Initializing Vault and Wasm
    vault.initialize().then(() => setIsInitialized(true));
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 15));
  };

  // Intercepting console.log to show in UI
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const msg = args.join(' ');
      if (typeof msg === 'string') {
        addLog(msg);
      }
    };
    return () => { console.log = originalLog; };
  }, []);

  const handleSetup = async () => {
    if (!password || !secret) return;
    try {
      await vault.setupVault(password, secret);
      setIsLocked(true);
      setPassword('');
      setSecret('');
    } catch (err) {
      alert(err);
    }
  };

  const handleSign = async () => {
    if (!password) {
      alert("Please enter password to unlock vault for signing.");
      return;
    }
    try {
      const tx = { amount: 100, to: "0xABC...123", nonce: Date.now() };
      await vault.signTransaction(password, tx);
      setPassword(''); // Clear password immediately after use
    } catch (err) {
      alert(err.message || err);
    }
  };

  const handleClear = () => {
    vault.clear();
    setIsLocked(false);
    setLogs([]);
    console.log("🧨 [Vault] Storage cleared. Identity wiped.");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Control Panel */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur shadow-2xl">
        <header className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600/10 rounded-xl">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Advanced Secure Vault</h1>
            <p className="text-sm text-neutral-400">Argon2id + AES-GCM (Wasm Isolated)</p>
          </div>
        </header>

        {!isLocked ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-800 border-neutral-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all border outline-none"
                  placeholder="Strong password required"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-300">Private Secret / Seed Phrase</label>
                <button 
                  onClick={async () => setSecret(await vault.generateMnemonic())}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Generate Seed Phrase
                </button>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <textarea
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-neutral-800 border-neutral-700 rounded-lg py-2.5 pl-10 pr-4 text-sm min-h-24 focus:ring-2 focus:ring-blue-500/50 transition-all border outline-none font-mono"
                  placeholder="Enter seed words or private key to secure"
                />
              </div>
            </div>

            <button
              onClick={handleSetup}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <RefreshCcw className="w-4 h-4" />
              Initialize Secure Vault
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4">
              <Unlock className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-500">Vault Multi-Layer Protected</p>
                <p className="text-xs text-green-500/70">Wasm-level isolation active.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Unlock Password (JIT Required)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-800 border-neutral-700 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 transition-all border outline-none"
                placeholder="Enter password to sign"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSign}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <PenTool className="w-4 h-4" />
                Sign Mock Transaction
              </button>
              <button
                onClick={handleClear}
                className="p-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
                title="Wipe Vault"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        <footer className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
           <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              <span>Status: {isInitialized ? 'Wasm Ready' : 'Loading...'}</span>
           </div>
           <span>Mock V1.0 - Argon2id</span>
        </footer>
      </div>

      {/* Security Logs (The "Console" for the user) */}
      <div className="bg-black border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[500px] shadow-2xl">
        <header className="bg-neutral-900 py-3 px-6 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-sm font-bold text-neutral-400 font-mono tracking-tighter">🔒 Security Lifecycle Logs</span>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
        </header>
        <div className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-2.5 leading-relaxed bg-[#0a0a0a]">
          {logs.length === 0 && (
            <div className="text-neutral-600 italic">No activity recorded... Initializing.</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-neutral-700 select-none">[{new Date().toLocaleTimeString()}]</span>
              <span className={log.includes('🧬') ? 'text-blue-400' : log.includes('🧹') || log.includes('🧨') ? 'text-red-400 font-bold' : log.includes('🔑') || log.includes('🆔') ? 'text-yellow-400' : 'text-neutral-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
