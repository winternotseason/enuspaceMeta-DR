import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Login({ onLogin }: { onLogin?: (user: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;


 useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
  setLoading(true);
  setErrorMsg("");

  // URL에서 code 제거
  window.history.replaceState({}, document.title, window.location.pathname);

  try {
    const response = await fetch(`/api/github?code=${code}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "로그인 실패");
    }

    localStorage.setItem("github_token", data.token);
    localStorage.setItem("github_user", JSON.stringify(data.user));
    onLogin?.(data.user);

  } catch (err: any) {
    console.error(err);
    setErrorMsg(err.message || "로그인 처리 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};

const handleLoginClick = () => {
  if (!clientId) {
    setErrorMsg("CLIENT_ID 없음");
    return;
  }

  window.location.href =
    `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo read:org`;
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white w-full">
      <div 
        className={`flex flex-col items-center group transition-opacity ${loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onClick={!loading ? handleLoginClick : undefined}
      >
        {/* Tooltip Bubble */}
        <div className="relative bg-black text-white px-8 py-3 rounded-xl flex items-center mb-7 shadow-sm transition-transform duration-200 group-hover:-translate-y-1">
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">인증 처리 중...</span>
            </div>
          ) : (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">Github 계정으로 로그인</span>
          )}
          
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-t-10 border-t-black"></div>
        </div>

        {/* Github Logo Container */}
        <div className="transition-transform duration-200 group-hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 640 640">
            <path d="M319.988 7.973C143.293 7.973 0 151.242 0 327.96c0 141.392 91.678 261.298 218.826 303.63 16.004 2.964 21.886-6.957 21.886-15.414 0-7.63-.319-32.835-.449-59.552-89.032 19.359-107.8-37.772-107.8-37.772-14.552-36.993-35.529-46.831-35.529-46.831-29.032-19.879 2.209-19.442 2.209-19.442 32.126 2.245 49.04 32.954 49.04 32.954 28.56 48.922 74.883 34.76 93.131 26.598 2.882-20.681 11.15-34.807 20.315-42.803-71.08-8.067-145.797-35.516-145.797-158.14 0-34.926 12.52-63.485 32.965-85.88-3.33-8.078-14.291-40.606 3.083-84.674 0 0 26.87-8.61 88.029 32.8 25.512-7.075 52.878-10.642 80.056-10.76 27.2.118 54.614 3.673 80.162 10.76 61.076-41.386 87.922-32.8 87.922-32.8 17.398 44.08 6.485 76.631 3.154 84.675 20.516 22.394 32.93 50.953 32.93 85.879 0 122.907-74.883 149.93-146.117 157.856 11.481 9.921 21.733 29.398 21.733 59.233 0 42.792-.366 77.28-.366 87.804 0 8.516 5.764 18.473 21.992 15.354 127.076-42.354 218.637-162.274 218.637-303.582 0-176.695-143.269-319.988-320-319.988l-.023.107z"/>
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-5 text-red-500">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
