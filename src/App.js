import React, { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);

  const API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setOutput("⚠️ API Error: " + data.error);
      } else {
        setOutput(data[0]?.generated_text || "⚠️ No response");
      }
    } catch (error) {
      setOutput("⚠️ Failed to fetch AI response.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    alert("✅ Code copied to clipboard!");
  };

  const handleClear = () => {
    setPrompt("");
    setOutput("");
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated_code.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-8 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="w-full max-w-3xl text-center">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🤖 Codemind AI</h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Toggle {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          className="w-full p-4 border rounded mb-4 h-32 resize-none text-gray-900"
        />

        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            ⚡ Generate
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ❌ Clear
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📋 Copy
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            ⬇️ Download
          </button>
        </div>

        {loading && (
          <div className="text-blue-600 font-semibold mb-2">⏳ Generating...</div>
        )}

        {output && (
          <pre className="w-full p-4 bg-gray-100 rounded text-sm text-left text-gray-800 whitespace-pre-wrap overflow-auto">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}

export default App;
