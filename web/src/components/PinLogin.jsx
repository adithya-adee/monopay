import { useState, useRef, useEffect } from 'react';

const PIN_LENGTH = 4;
const HARDCODED_PIN = "1234";

export default function PinLogin({ onLogin, isModal = false }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const submit = (newPin) => {
    if (newPin === HARDCODED_PIN) {
      setTimeout(() => onLogin(), 250);
    } else {
      setError(true);
      setTimeout(() => { setPin(""); setError(false); }, 700);
    }
  };

  const handleKeyPress = (num) => {
    if (error) return;
    const newPin = pin + num;
    if (newPin.length <= PIN_LENGTH) {
      setPin(newPin);
      if (newPin.length === PIN_LENGTH) submit(newPin);
    }
  };

  const handleDelete = () => {
    if (!error) setPin(p => p.slice(0, -1));
  };

  const inputRef = useRef(null);

  // Keep input focused when clicking anywhere in the container
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    if (error) return;
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= PIN_LENGTH) {
      setPin(val);
      if (val.length === PIN_LENGTH) submit(val);
    }
  };

  return (
    <div 
      onClick={focusInput}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isModal ? 'auto' : '100vh',
        width: '100%',
        background: isModal ? 'transparent' : 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%)',
        cursor: 'text' // Hint that they can click to type
      }}
    >
      {/* Hidden input to capture physical and virtual keyboard strokes properly */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={handleInputChange}
        autoFocus
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      
      <div className="fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isModal ? '24px' : '36px',
        padding: isModal ? '12px' : '48px 40px',
        background: isModal ? 'transparent' : 'var(--bg-card)',
        borderRadius: isModal ? '0' : '32px',
        border: isModal ? 'none' : '1px solid var(--border-color)',
        boxShadow: isModal ? 'none' : '0 24px 60px rgba(0,0,0,0.5)',
        width: '100%',
        maxWidth: '380px',
      }}>
        {/* Logo / Title */}
        <div style={{ textAlign: 'center' }}>
          {!isModal && (
            <img
              src="/monopay-logo.png"
              alt="MonoPay"
              style={{ height: '48px', marginBottom: '16px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <h1 style={{ fontSize: isModal ? '18px' : '22px', fontWeight: '700', marginBottom: '6px' }}>
            {isModal ? 'Confirm PIN to Send' : 'Enter Passcode'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isModal ? 'Enter your PIN to sign transaction' : 'Type on keyboard or tap the pad'}
          </p>
        </div>

        {/* PIN dots */}
        <div
          className={error ? 'animate-shake' : ''}
          style={{ display: 'flex', gap: '18px' }}
        >
          {[...Array(PIN_LENGTH)].map((_, i) => (
            <div key={i} style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: error
                ? 'var(--accent-error)'
                : i < pin.length ? 'var(--accent-primary)' : 'var(--bg-input)',
              border: error || i < pin.length ? 'none' : '1px solid #2a2a40',
              boxShadow: !error && i < pin.length ? '0 0 10px rgba(124,58,237,0.5)' : 'none',
              transition: 'all 0.15s',
            }} />
          ))}
        </div>

        {/* Numpad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 72px)',
          gridTemplateRows: 'repeat(4, 72px)',
          gap: '12px',
        }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => handleKeyPress(String(n))} style={numKey}>
              {n}
            </button>
          ))}
          <div /> {/* spacer */}
          <button onClick={() => handleKeyPress('0')} style={numKey}>0</button>
          <button onClick={handleDelete} style={{ ...numKey, fontSize: '20px', color: 'var(--text-muted)' }}>⌫</button>
        </div>
      </div>
    </div>
  );
}

const numKey = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  border: 'none',
  background: 'var(--bg-input)',
  color: 'var(--text-main)',
  fontSize: '22px',
  fontWeight: '500',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s, transform 0.1s',
};
