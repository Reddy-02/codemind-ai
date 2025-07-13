import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaMicrophone, FaMoon, FaSun, FaCopy, FaDownload, FaRedo } from 'react-icons/fa';

const models = [
  { name: "Salesforce/codegen-350M-mono", label: "CodeGen" },
  { name: "bigcode/starcoder", label: "StarCoder" },
];

const fallbackResponse = (lang) => {
  if (lang === "Python") {
    return `def factorial(n):\n    return 1 if n==0 else n*factorial(n-1)`;
  } else if (lang === "JavaScript") {
    return `function factorial(n) {\n  return n === 0 ? 1 : n * factorial(n - 1);\n}`;
  }
  return "// Code not available offline.";
};

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('Python');
  const [model, setModel] = useState(models[0].name);
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);

  // 🔁 Dark mode persist
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle("dark");
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // 🎤 Voice input
  const handleVoiceInput = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setOutput("❗ Please describe the code you want.");
      return;
    }

    setOutput("⏳ Generating code using AI...");

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: `${input} in ${language}` }),
        }
      );

      const data = await response.json();

      const generated = data[0]?.generated_text || fallbackResponse(language);
      setOutput(generated);
      setHistory(prev => [{ input, output: generated }, ...prev.slice(0, 4)]); // Save last 5
    } catch (err) {
      console.error(err);
      const fallback = fallbackResponse(language);
      setOutput(`⚠️ API failed. Showing fallback:\n\n${fallback}`);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `${language}_codemind_code.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    alert("✅ Code copied!");
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleRegenerate = (oldInput) => {
    setInput(oldInput);
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6 transition-all">
      {/* 🔁 Theme Toggle */}
      <button onClick={toggleTheme} className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300">
        <FaMoon className="inline mr-1" /> Toggle
      </button>

      <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-500 mb-6">🧠 Codemind AI Assistant</h1>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 rounded bg-gray-100 text-black">
          <option>Python</option>
          <option>JavaScript</option>
          <option>Java</option>
          <option>C++</option>
          <option>HTML</option>
        </select>

        <select value={model} onChange={(e) => setModel(e.target.value)} className="p-2 rounded bg-gray-100 text-black">
          {models.map((m) => (
            <option key={m.name} value={m.name}>{m.label}</option>
          ))}
        </select>

        <button onClick={handleVoiceInput} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500">
          <FaMicrophone className="inline" /> {isListening ? "Listening..." : "Speak Prompt"}
        </button>
      </div>

      {/* Input */}
      <textarea
        className="w-full max-w-2xl h-36 p-4 mb-4 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white resize-none"
        placeholder="💬 Describe the code you need..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mb-4">
        <button onClick={handleGenerate} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500">⚡ Generate</button>
        <button onClick={handleClear} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">❌ Clear</button>
        <button onClick={handleCopy} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"><FaCopy className="inline" /> Copy</button>
        <button onClick={handleDownload} className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400"><FaDownload className="inline" /> Download</button>
      </div>

      {/* Output with Syntax Highlighting */}
      <div className="w-full max-w-2xl bg-black text-white p-4 rounded overflow-auto whitespace-pre-wrap">
        <SyntaxHighlighter language={language.toLowerCase()} style={oneDark}>
          {output}
        </SyntaxHighlighter>
      </div>

      {/* History */}
      <div className="mt-8 max-w-2xl w-full">
        <h2 className="text-xl mb-2 font-bold text-blue-400">🕘 History</h2>
        {history.map((item, index) => (
          <div key={index} className="mb-2 p-2 rounded border border-gray-600 bg-gray-800 text-white">
            <div className="mb-1 font-semibold">🧠 Prompt: {item.input}</div>
            <button onClick={() => handleRegenerate(item.input)} className="bg-blue-500 px-2 py-1 text-sm rounded hover:bg-blue-400">
              <FaRedo className="inline" /> Regenerate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
