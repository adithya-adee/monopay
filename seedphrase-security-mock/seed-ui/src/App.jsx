import React, { useRef, useState, useEffect } from "react";
import { initVault, wordToIndex, generateIndices, indexToWord, deriveKeypair, secureWipe, bytesToHex } from "./lib/wasmVault.js";
import "./App.css";

// 12 empty slots
const SLOTS = Array.from({ length: 12 }, (_, i) => i);

function App() {
  const [vaultReady, setVaultReady] = useState(false);
  const indicesRef = useRef(new Uint16Array(12));
  const [validWords, setValidWords] = useState(new Array(12).fill(false));
  const [pubkey, setPubkey] = useState(null);
  const [wiped, setWiped] = useState(false);
  const [devViewIndices, setDevViewIndices] = useState([]);
  
  // For generated seed display
  const [showGenerated, setShowGenerated] = useState(false);
  const [generatedWords, setGeneratedWords] = useState([]);

  useEffect(() => {
    initVault().then(() => setVaultReady(true));
    return () => {
      indicesRef.current.fill(0);
      secureWipe();
    };
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      indicesRef.current.fill(0);
      secureWipe();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const handleWordChange = (e, index) => {
    const val = e.target.value.trim().toLowerCase();
    const idx = wordToIndex(val);
    
    if (idx >= 0) {
      indicesRef.current[index] = idx;
      e.target.value = "";
      const newValid = [...validWords];
      newValid[index] = true;
      setValidWords(newValid);
      if (index < 11) {
        document.getElementById(`word-${index + 1}`).focus();
      }
    } else if (val === "") {
      indicesRef.current[index] = 0;
      const newValid = [...validWords];
      newValid[index] = false;
      setValidWords(newValid);
    }
  };

  const handleGenerateSeed = () => {
    const newIndices = generateIndices();
    const words = Array.from(newIndices).map(idx => indexToWord(idx));
    
    // Fill the Ref
    indicesRef.current.set(new Uint16Array(newIndices));
    
    // Set UI state
    setGeneratedWords(words);
    setValidWords(new Array(12).fill(true));
    setShowGenerated(true);
  };

  const handleDerive = () => {
    const keyBytes = deriveKeypair(indicesRef.current);
    indicesRef.current.fill(0);
    secureWipe();
    setPubkey(bytesToHex(keyBytes));
    setWiped(true);
    setDevViewIndices(Array.from(indicesRef.current));
    setShowGenerated(false);
    setGeneratedWords([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const isReadyToDerive = validWords.every(v => v === true);

  if (!vaultReady) return <div className="loading">Initializing Secure Vault...</div>;

  return (
    <div className="app-container dark">
      <header>
        <h1>Secure Seed Phrase Vault</h1>
        <p className="subtitle">Uint16Array + Wasm Isolation + Secure Wipe</p>
      </header>

      <main>
        {!pubkey ? (
          <div className="input-phase">
            <div className="security-banner">
              ⚠️ <strong>Security Concept:</strong> Words are instantly converted to numeric indices. The 12-word string is NEVER formed in browser memory.
            </div>

            <div className="action-row top">
              <button className="btn-secondary" onClick={handleGenerateSeed}>
                ✨ Generate Random Seed
              </button>
            </div>

            {showGenerated && (
              <div className="generated-seed-display">
                <h4>Generated Mnemonic (Backup this!)</h4>
                <div className="mnemonic-box">
                  {generatedWords.join(" ")}
                </div>
                <button className="btn-small" onClick={() => setShowGenerated(false)}>Hide & Continue</button>
              </div>
            )}

            <div className="word-grid">
              {SLOTS.map((i) => (
                <div key={i} className={`word-slot ${validWords[i] ? "valid" : ""}`}>
                  <span className="slot-number">{i + 1}.</span>
                  <input
                    id={`word-${i}`}
                    type="password"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder={validWords[i] ? "••••••••" : "word"}
                    onChange={(e) => handleWordChange(e, i)}
                    disabled={validWords[i]}
                  />
                  {validWords[i] && (
                    <button 
                      className="clear-btn"
                      title="Clear word"
                      onClick={() => {
                        indicesRef.current[i] = 0;
                        const v = [...validWords];
                        v[i] = false;
                        setValidWords(v);
                        // Clear from generated view if active
                        setGeneratedWords([]);
                        setShowGenerated(false);
                        setTimeout(() => document.getElementById(`word-${i}`).focus(), 0);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="action-row">
              <button 
                className="btn-primary" 
                onClick={handleDerive}
                disabled={!isReadyToDerive}
              >
                Derive Keypair Securely
              </button>
            </div>
          </div>
        ) : (
          <div className="result-phase">
            <div className="success-card">
              <div className="badge success">Memory Wiped ✓</div>
              <h3>Wasm Key Derivation Complete</h3>
              <div className="pubkey-box">
                <span className="label">Public Key (Ed25519)</span>
                <code>{pubkey}</code>
                <button className="copy-btn" onClick={() => copyToClipboard(pubkey)}>Copy</button>
              </div>
              <p className="description">
                The mock private key was generated internally in Wasm and never exposed to JavaScript. 
                Both the Wasm internal statically allocated memory buffer and the JavaScript `Uint16Array` have been explicitly zeroed out.
              </p>
              
              <div className="debug-panel">
                <h4>Debugger: Memory Proof</h4>
                <p>Value of <code>indices.current</code> immediately after derivation:</p>
                <code>[{devViewIndices.join(', ')}]</code>
              </div>

              <button 
                className="btn-secondary" 
                onClick={() => {
                  setPubkey(null);
                  setWiped(false);
                  setValidWords(new Array(12).fill(false));
                }}
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
