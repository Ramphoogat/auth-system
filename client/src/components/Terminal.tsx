import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWindows } from '../context/WindowContext';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Premium OS Terminal v1.0.4' },
    { type: 'output', content: 'Type "help" to see available commands.' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addWindow } = useWindows();
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = (cmd: string) => {
    const rawInput = cmd.trim();
    const lowerInput = rawInput.toLowerCase();
    const newLines: TerminalLine[] = [...lines, { type: 'input', content: cmd }];

    // Simple alias mapping
    let finalCmd = lowerInput;
    if (lowerInput === 'whomi') finalCmd = 'whoami';
    if (lowerInput === 'cls') finalCmd = 'clear';
    if (lowerInput === 'opn finder' || lowerInput === 'openfinder') finalCmd = 'open finder';
    if (lowerInput === 'exit' || lowerInput === 'quit') finalCmd = 'logout';

    switch (finalCmd) {
      case 'help':
        newLines.push({ type: 'output', content: 'Available commands:' });
        newLines.push({ type: 'output', content: '  help       - Show this list' });
        newLines.push({ type: 'output', content: '  clear      - Clear terminal screen (alias: cls)' });
        newLines.push({ type: 'output', content: '  open finder - Open the Finder window' });
        newLines.push({ type: 'output', content: '  date       - Show current date/time' });
        newLines.push({ type: 'output', content: '  whoami     - Show current user info' });
        newLines.push({ type: 'output', content: '  logout     - System logout (alias: exit, quit)' });
        break;
      case 'clear':
        setLines([]);
        return;
      case 'logout':
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('welcome_prompted');
        navigate('/login');
        return;
      case 'open finder':
        addWindow({
          title: 'Finder',
          path: '/finder',
          component: (
            <div className="flex items-center justify-center h-full">
               <h2 className="text-3xl font-light text-gray-400">Launch Finder...</h2>
            </div>
          )
        });
        newLines.push({ type: 'output', content: 'Opening Finder...' });
        break;
      case 'date':
        newLines.push({ type: 'output', content: new Date().toLocaleString() });
        break;
      case 'whoami': {
        const user = localStorage.getItem('last_user') || 'User';
        newLines.push({ type: 'output', content: `${user}@premium-os` });
        break;
      }
      case '':
        break;
      default:
        newLines.push({ type: 'error', content: `Command not found: ${rawInput}` });
    }

    setLines(newLines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleCommand(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar list-none space-y-1"
      >
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2 text-[13px] leading-relaxed">
            {line.type === 'input' && <span className="text-green-400 font-bold shrink-0">➜</span>}
            <span className={line.type === 'error' ? 'text-red-400' : line.type === 'input' ? 'text-white' : ''}>
              {line.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex gap-2 text-[13px]">
        <span className="text-green-400 font-bold shrink-0">➜</span>
        <input 
          autoFocus
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-transparent border-none outline-none flex-1 text-white"
          spellCheck={false}
        />
      </form>
    </div>
  );
};

export default Terminal;
