import { useState, useRef, useEffect } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("genuine");
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  // 🔥 TYPEWRITER STATE
  const fullText =
    "  Fake reviews look real. We detect the patterns that human misses.   ";
  const [typedText, setTypedText] = useState("");

  // 🔥 TYPEWRITER EFFECT
  useEffect(() => {
  let index = 0;
  setTypedText("");

  const interval = setInterval(() => {
    if (index < fullText.length) {
      setTypedText((prev) => prev + fullText.charAt(index));
      index++;
    } else {
      clearInterval(interval);
    }
  }, 40);

  return () => clearInterval(interval);
}, []);


  const analyze = async () => {
    if (!url) return;

    try {
      setLoading(true);

      const res = await fetch("https://hackthon-kjwe.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      setData(json);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f8ff] flex flex-col items-center px-4 py-20">
      {/* HERO */}
      <h1 className="text-4xl font-bold mb-2 text-center">
        Review Authenticity Checker
      </h1>
      <p className="text-gray-600 mb-10 text-center min-h-[24px]">
        {typedText}
        <span className="animate-pulse">|</span>
      </p>

      {/* SEARCH */}
      <div className="bg-white shadow-2xl rounded-xl p-6 w-full max-w-xl">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && analyze()}
          placeholder="Paste product link"
          className="w-full border rounded-lg px-4 py-3 mb-4"
        />
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Analyzing reviews..." : "Analyze"}
        </button>
      </div>

      {/* RESULTS */}
      {data && (
        <div ref={resultRef} className="w-full max-w-4xl mt-16">
          {/* SCORE */}
          <p className="mb-2 font-medium">
            Authenticity Score: {data.authenticityScore}%
          </p>
          <div className="h-3 bg-gray-200 rounded-full mb-8">
            <div
              className="h-3 bg-red-500 rounded-full transition-all duration-700"
              style={{ width: `${data.authenticityScore}%` }}
            />
          </div>

          {/* RATING DISTRIBUTION */}
          <div className="bg-white p-6 rounded-xl shadow mb-10">
            <h3 className="font-bold mb-4"> Authentic Rating Distribution</h3>

            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3 mb-2">
                <span className="w-10">{star}★</span>
                <div className="flex-1 bg-gray-200 h-3 rounded">
                  <div
                    className="h-3 bg-black rounded"
                    style={{
                      width: `${data.ratingDistribution?.[star] || 0}%`,
                    }}
                  />
                </div>
                <span className="w-10 text-right text-sm">
                  {data.ratingDistribution?.[star] || 0}%
                </span>
              </div>
            ))}
          </div>

          {/* BREAKDOWN CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {["genuine", "suspicious", "lowQuality"].map((type) => (
              <div
                key={type}
                onClick={() => setActiveTab(type)}
                className={`cursor-pointer p-6 rounded-xl border text-center transition ${
                  activeTab === type
                    ? type === "genuine"
                      ? "bg-[#0AB68B] text-white shoadow-2xl"
                      : type === "suspicious"
                      ? "bg-[#F64668] text-white shadow-2xl"
                      : "bg-[#ffe3b3] text-black shadow-2xl"
                    : "bg-white hover:shadow-lg"
                }`}
              >
                <p className="text-3xl font-bold">
                  {data.breakdown[type]}%
                </p>
                <p className="capitalize mt-1">
                  {type === "lowQuality" ? "Low Quality" : type}
                </p>
              </div>
            ))}
          </div>

          {/* DETAILS */}
          <div className="bg-white rounded-xl p-6 ">
            <h3 className="font-bold mb-3  ">
              {activeTab === "genuine" && "Why these reviews look genuine:"}
              {activeTab === "suspicious" && "Why these reviews look suspicious:"}
              {activeTab === "lowQuality" &&
                "Why these reviews are low quality:"}
            </h3>

            <ul className="list-disc ml-5 mb-4">
              {data.reasons[activeTab].map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            <h4 className="font-semibold mb-2">Example reviews</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {data.sampleReviews[activeTab].map((r, i) => (
                <div key={i} className="border p-3 rounded">
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* VERDICT */}
          <p
            className={`font-bold text-center mt-10 ${
              data.authenticityScore < 40
                ? "text-red-600"
                : data.authenticityScore < 70
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {data.authenticityScore < 40
              ? "✖ Likely Manipulated"
              : data.authenticityScore < 70
              ? "⚠ Mixed Reviews"
              : "✔ Mostly Genuine"}
          </p>
        </div>
      )}
    </div>
  );
}
