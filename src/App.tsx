import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const ALL_COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AG", name: "Antigua & Barbuda" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" }, { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia & Herzegovina" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "CV", name: "Cabo Verde" }, { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "CF", name: "Central African Rep." },
  { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DR)" }, { code: "CR", name: "Costa Rica" }, { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" }, { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" }, { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" }, { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" }, { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" }, { code: "GD", name: "Grenada" }, { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" }, { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" }, { code: "IN", name: "India" }, { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" }, { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" }, { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" }, { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" }, { code: "MG", name: "Madagascar" }, { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" }, { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" }, { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" }, { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" },
  { code: "KP", name: "North Korea" }, { code: "MK", name: "North Macedonia" }, { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" }, { code: "KN", name: "Saint Kitts & Nevis" },
  { code: "LC", name: "Saint Lucia" }, { code: "VC", name: "Saint Vincent & Grenadines" }, { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" }, { code: "ST", name: "São Tomé & Príncipe" }, { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" }, { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" }, { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" }, { code: "SS", name: "South Sudan" }, { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad & Tobago" },
  { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" }, { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" }, { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" }, { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" },
];

type DeviceInfo = { deviceId: string; label: string };
type Msg = { text: string; mine: boolean };

/* ─── Audio helper ─────────────────────────────────────────── */
function beep(freq: number, duration = 0.25, vol = 0.15) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (_) { /* silence */ }
}

/* ─── Style constants ──────────────────────────────────────── */
const topBtn: React.CSSProperties = {
  padding: "5px 10px", border: "1px solid #555", borderRadius: 5,
  background: "transparent", color: "white", cursor: "pointer", fontSize: 12,
};
const secBtn: React.CSSProperties = {
  padding: "8px 18px", border: "1px solid #3e558c", borderRadius: 5,
  background: "transparent", color: "#aaa", cursor: "pointer", fontSize: 13,
};
const actionBtn: React.CSSProperties = {
  padding: "9px 16px", border: "none", borderRadius: 6,
  color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 13,
};
const genderBtn: React.CSSProperties = {
  padding: "5px 12px", border: "1px solid #3e558c", borderRadius: 20,
  background: "transparent", color: "#aaa", cursor: "pointer", fontSize: 12,
};
const genderActive: React.CSSProperties = { background: "#e83333", borderColor: "#e83333", color: "white" };
const popupBtn: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px", margin: "6px 0",
  border: "1px solid #ddd", borderRadius: 5, background: "white",
  cursor: "pointer", fontWeight: "bold", textAlign: "left",
};
const iconBtn: React.CSSProperties = {
  padding: "6px 10px", border: "1px solid #444", borderRadius: 6,
  background: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer", fontSize: 13,
};

function Popup({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", color: "#111", borderRadius: 10, padding: 24, minWidth: 280, maxWidth: 380, maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#555" }}>✕</button>
        <h3 style={{ margin: "0 0 14px", color: "#e83333" }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* ─── Typing dots component ────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ color: "#888", fontSize: 12, padding: "4px 10px", fontStyle: "italic" }}>
      Stranger is typing
      <span style={{ display: "inline-block", animation: "dots 1.2s infinite" }}>...</span>
    </div>
  );
}

/* ─── Main App ─────────────────────────────────────────────── */
export default function App() {
  /* — Auth / profile — */
  const [page, setPage] = useState<"login" | "app">("login");
  const [name, setName] = useState(() => localStorage.getItem("zuno_name") ?? "");
  const [age, setAge] = useState("");
  const [myGender, setMyGender] = useState<"boy" | "girl" | "unspecified">(
    () => (localStorage.getItem("zuno_gender") as "boy" | "girl" | "unspecified") ?? "unspecified"
  );

  /* — Economy — */
  const [coins, setCoins] = useState<number>(() => {
    const s = localStorage.getItem("zuno_coins");
    return s ? parseInt(s) : 200;
  });
  const [premium, setPremium] = useState<boolean>(() => {
    const exp = localStorage.getItem("zuno_premium_exp");
    return exp ? Date.now() < parseInt(exp) : false;
  });
  const [adUsed, setAdUsed] = useState(false);

  /* — Matching — */
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [status, setStatus] = useState<"idle" | "waiting" | "connected">("idle");
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [strangerProfile, setStrangerProfile] = useState<{ name: string; gender: string; country?: string } | null>(null);
  const [autoNext, setAutoNext] = useState(false);
  const autoNextRef = useRef(false);

  /* — Chat — */
  const [messages, setMessages] = useState<Msg[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [strangerTyping, setStrangerTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* — Media controls — */
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const soundsRef = useRef(true);

  /* — Devices — */
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [mics, setMics] = useState<DeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [cameraFacingIdx, setCameraFacingIdx] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  /* — UI — */
  const [modal, setModal] = useState<null | "rules" | "history" | "report" | "premium" | "terms" | "policy" | "privacy">(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const [banned, setBanned] = useState(false);

  /* — Refs — */
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const meRef = useRef<HTMLVideoElement>(null);
  const strangerRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(status);

  /* ── Keep refs in sync ──────────────────────────────────── */
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { autoNextRef.current = autoNext; }, [autoNext]);
  useEffect(() => { soundsRef.current = soundsEnabled; }, [soundsEnabled]);

  /* ── Persist state ──────────────────────────────────────── */
  useEffect(() => { localStorage.setItem("zuno_coins", String(coins)); }, [coins]);
  useEffect(() => { if (name) localStorage.setItem("zuno_name", name); }, [name]);
  useEffect(() => { localStorage.setItem("zuno_gender", myGender); }, [myGender]);

  /* ── Sync local video ───────────────────────────────────── */
  useEffect(() => {
    if (meRef.current) meRef.current.srcObject = localStream;
  }, [localStream]);

  /* ── Chat scroll ────────────────────────────────────────── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, strangerTyping]);

  /* ── Mobile detect ──────────────────────────────────────── */
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);


  /* ── Device enumeration ─────────────────────────────────── */
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const cams = devices.filter(d => d.kind === "videoinput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || "Camera " + d.deviceId.slice(0, 4) }));
      const micsArr = devices.filter(d => d.kind === "audioinput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || "Mic " + d.deviceId.slice(0, 4) }));
      setCameras(cams);
      setMics(micsArr);
      if (cams.length > 0) setSelectedCamera(cams[0].deviceId);
      if (micsArr.length > 0) setSelectedMic(micsArr[0].deviceId);
    });
  }, []);

  /* ── Sound helper ───────────────────────────────────────── */
  const playSound = useCallback((type: "connect" | "message" | "disconnect") => {
    if (!soundsRef.current) return;
    if (type === "connect") beep(880, 0.2, 0.2);
    else if (type === "message") beep(660, 0.15, 0.08);
    else beep(220, 0.3, 0.15);
  }, []);


  /* ── Login ──────────────────────────────────────────────── */
  function login() {
    const n = name.trim();
    const a = parseInt(age);
    if (!n || isNaN(a)) { alert("Fill all fields"); return; }
    if (a < 18) { alert("18+ only"); return; }

    const socket = io("https://zuno-i4ej.onrender.com");
    socketRef.current = socket;

    socket.on("users_count", (count: number) => setOnlineUsers(count));

    socket.on("matched", (data: unknown) => {
      const d = data as { profile?: { name?: string; gender?: string; country?: string } } | null;
      setStrangerProfile({
        name: d?.profile?.name ?? "Stranger",
        gender: d?.profile?.myGender ?? "unspecified",
        country: d?.profile?.country,
      });
      setMessages([]);
      setStrangerTyping(false);
      setStatus("connected");
      playSound("connect");
      createPeer(true);
    });

    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      try {
        createPeer(false);
        const pc = peerRef.current!;
        if (pc.signalingState !== "stable") return;
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", answer);
      } catch (e) { console.warn("offer error", e); }
    });

    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      try {
        const pc = peerRef.current;
        if (!pc || pc.signalingState !== "have-local-offer") return;
        await pc.setRemoteDescription(answer);
      } catch (e) { console.warn("answer error", e); }
    });

    socket.on("candidate", async (c: RTCIceCandidateInit) => {
      try {
        const pc = peerRef.current;
        if (!pc || pc.connectionState === "closed") return;
        await pc.addIceCandidate(c);
      } catch (e) { console.warn("candidate error", e); }
    });

    socket.on("typing", (isTyping: boolean) => {
      setStrangerTyping(isTyping);
      if (isTyping) {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setStrangerTyping(false), 3000);
      }
    });

    socket.on("end", () => {
      if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
      if (strangerRef.current) strangerRef.current.srcObject = null;
      setStrangerProfile(null);
      setStrangerTyping(false);
      playSound("disconnect");

      if (autoNextRef.current) {
        setStatus("waiting");
        setStrangerProfile(null);
        socket.emit("next", {
          gender: selectedGender,
          name: name.trim(),
          myGender,
          country: selectedCountry !== "all" ? selectedCountry : undefined,
        });
      } else {
        setStatus("idle");
      }
    });

    socket.on("message", (m: string) => {
      setMessages(prev => [...prev, { text: m, mine: false }]);
      setStrangerProfile(prev => {
        setHistory(h => [...h, `${prev?.name ?? "Stranger"}: ${m}`]);
        return prev;
      });
      playSound("message");
    });

    socket.on("banned", () => {
      setBanned(true);
      setStatus("idle");
    });

    setPage("app");
  }

  /* ── WebRTC ─────────────────────────────────────────────── */
  function createPeer(isInitiator: boolean) {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
      ],
    });
    peerRef.current = peer;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current!);
      });
    }

    peer.ontrack = (e) => {
      if (strangerRef.current) strangerRef.current.srcObject = e.streams[0];
    };
    peer.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) socketRef.current.emit("candidate", e.candidate);
    };

    if (isInitiator) {
      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer);
        socketRef.current?.emit("offer", offer);
      });
    }
  }

  /* ── Stream helpers ─────────────────────────────────────── */
  async function getStream(cameraId?: string, micId?: string) {
    const camId = cameraId ?? selectedCamera;
    const micId2 = micId ?? selectedMic;
    return navigator.mediaDevices.getUserMedia({
      video: camId ? { deviceId: { exact: camId } } : true,
      audio: micId2 ? { deviceId: { exact: micId2 } } : true,
    });
  }

  function refreshDeviceLabels() {
    setTimeout(() => {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const cams = devices.filter(d => d.kind === "videoinput")
          .map(d => ({ deviceId: d.deviceId, label: d.label || "Camera " + d.deviceId.slice(0, 4) }));
        const micsArr = devices.filter(d => d.kind === "audioinput")
          .map(d => ({ deviceId: d.deviceId, label: d.label || "Mic " + d.deviceId.slice(0, 4) }));
        setCameras(cams);
        setMics(micsArr);
      });
    }, 800);
  }

  function applyStream(stream: MediaStream) {
    localStreamRef.current = stream;
    setLocalStream(stream);
  }

  /* ── Media controls ─────────────────────────────────────── */
  function toggleMic() {
    if (!localStreamRef.current) return;
    const newMuted = !micMuted;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setMicMuted(newMuted);
  }

  function toggleCam() {
    if (!localStreamRef.current) return;
    const newOff = !camOff;
    localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !newOff; });
    setCamOff(newOff);
  }

  /* ── Match actions ──────────────────────────────────────── */
  async function start() {
    if (!localStreamRef.current) {
      const stream = await getStream();
      applyStream(stream);
      refreshDeviceLabels();
    }
    setMessages([]);
    setStrangerProfile(null);
    setStatus("waiting");
    socketRef.current?.emit("start", {
      gender: selectedGender,
      name: name.trim(),
      myGender,
      country: selectedCountry !== "all" ? selectedCountry : undefined,
    });
  }

  async function flipCamera() {
    if (cameras.length <= 1) return;
    const nextIdx = (cameraFacingIdx + 1) % cameras.length;
    setCameraFacingIdx(nextIdx);
    const nextCamId = cameras[nextIdx].deviceId;
    setSelectedCamera(nextCamId);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      const stream = await getStream(nextCamId);
      applyStream(stream);
    }
  }

  async function changeCamera(deviceId: string) {
    setSelectedCamera(deviceId);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      applyStream(await getStream(deviceId));
    }
  }

  async function changeMic(deviceId: string) {
    setSelectedMic(deviceId);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      applyStream(await getStream(selectedCamera, deviceId));
    }
  }

  function next() {
    const cost = premium ? 0 : 2;
    if (!premium && coins < cost) { alert("Need at least 2 coins"); return; }
    if (cost > 0) setCoins(c => c - cost);
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
    if (strangerRef.current) strangerRef.current.srcObject = null;
    setStatus("waiting");
    setStrangerProfile(null);
    setStrangerTyping(false);
    socketRef.current?.emit("next", {
      gender: selectedGender,
      name: name.trim(),
      myGender,
      country: selectedCountry !== "all" ? selectedCountry : undefined,
    });
  }

  function end() {
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
    if (strangerRef.current) strangerRef.current.srcObject = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    setStatus("idle");
    setStrangerProfile(null);
    setStrangerTyping(false);
    socketRef.current?.emit("end");
  }

  function blockStranger() {
    socketRef.current?.emit("block");
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
    if (strangerRef.current) strangerRef.current.srcObject = null;
    setStatus("waiting");
    setStrangerProfile(null);
    setStrangerTyping(false);
    socketRef.current?.emit("start", {
      gender: selectedGender, name: name.trim(), myGender,
      country: selectedCountry !== "all" ? selectedCountry : undefined,
    });
  }

  /* ── Chat ───────────────────────────────────────────────── */
  function sendMessage() {
    if (!msgInput.trim() || status !== "connected") return;
    socketRef.current?.emit("message", msgInput);
    socketRef.current?.emit("typing", false);
    setMessages(prev => [...prev, { text: msgInput, mine: true }]);
    setHistory(prev => [...prev, `${name.trim() || "You"}: ${msgInput}`]);
    setMsgInput("");
    if (myTypingTimerRef.current) clearTimeout(myTypingTimerRef.current);
  }

  function handleMsgChange(v: string) {
    setMsgInput(v);
    if (status !== "connected") return;
    socketRef.current?.emit("typing", true);
    if (myTypingTimerRef.current) clearTimeout(myTypingTimerRef.current);
    myTypingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", false);
    }, 2000);
  }

  /* ── Gender & country filter ────────────────────────────── */
  function setGender(g: string) {
    if ((g === "boy" || g === "girl") && !premium) {
      alert("Buy premium to filter by gender");
      return;
    }
    setSelectedGender(g);
  }

  function setCountry(c: string) {
    if (c !== "all" && !premium) {
      alert("Buy premium to filter by country");
      return;
    }
    setSelectedCountry(c);
  }

  /* ── Economy ────────────────────────────────────────────── */
  function watchAd() {
    if (adUsed) return;
    setAdUsed(true);
    window.open("https://www.profitableratecpm.com/");
    const reward = premium ? 40 : 20;
    setTimeout(() => setCoins(c => c + reward), 3000);
  }

  function buy(cost: number, hours: number) {
    if (coins < cost) { alert("Not enough coins"); return; }
    setCoins(c => c - cost);
    const expiry = Date.now() + hours * 3600000;
    localStorage.setItem("zuno_premium_exp", String(expiry));
    setPremium(true);
    setModal(null);
    alert(`Premium unlocked for ${hours} hours! Perks: free NEXT, 2× ad coins, gender & country filter.`);
  }

  function report(reason: string) {
    socketRef.current?.emit("report", reason);
    alert(`Reported for: ${reason}. Thank you.`);
    setModal(null);
  }

  /* ── Status badge ───────────────────────────────────────── */
  const statusColor = status === "connected" ? "#2ecc71" : status === "waiting" ? "#f39c12" : "#888";
  const statusText = status === "connected" ? "● Connected" : status === "waiting" ? "⟳ Searching..." : "○ Idle";

  /* ── Computed layout ────────────────────────────────────── */
  const mainDir: React.CSSProperties["flexDirection"] = isMobile ? "column" : "row";
  const videoW = isMobile ? "100%" : "55%";
  const chatW = isMobile ? "100%" : "45%";
  const chatH = isMobile ? 220 : undefined;
  const videoH = isMobile ? 160 : 200;

  /* ════════════════════════════════════════════════════════ */
  /*  LOGIN PAGE                                              */
  /* ════════════════════════════════════════════════════════ */
  if (page === "login") {
    return (
      <div style={{ margin: 0, fontFamily: "Arial", background: "#0d2b45", color: "white", minHeight: "100vh", textAlign: "center", paddingTop: 60 }}>
        <h1 style={{ color: "#e83333", fontSize: 52, margin: "0 0 4px" }}>ZUNO</h1>
        <p style={{ color: "#aaa", marginBottom: 10, fontSize: 14 }}>Random video chat with strangers</p>

        {onlineUsers > 0 && (
          <div style={{ color: "#2ecc71", fontSize: 13, marginBottom: 14 }}>● {onlineUsers.toLocaleString()} online</div>
        )}

        <div>
          <input value={name}
            onChange={e => setName(e.target.value.replace(/[^a-zA-Z ]/g, ""))}
            placeholder="YOUR NAME"
            style={{ padding: 12, width: 260, margin: "8px 0", borderRadius: 5, border: "none", background: "#1e3d5c", color: "white", display: "block", marginLeft: "auto", marginRight: "auto", fontSize: 14 }}
          />
          <input value={age}
            onChange={e => setAge(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={e => e.key === "Enter" && login()}
            placeholder="YOUR AGE (18+)"
            style={{ padding: 12, width: 260, margin: "8px 0", borderRadius: 5, border: "none", background: "#1e3d5c", color: "white", display: "block", marginLeft: "auto", marginRight: "auto", fontSize: 14 }}
          />

          <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "12px 0 6px" }}>
            <span style={{ color: "#aaa", fontSize: 13, alignSelf: "center" }}>I am:</span>
            {(["boy", "girl", "unspecified"] as const).map(g => (
              <button key={g} onClick={() => setMyGender(g)}
                style={{ padding: "7px 14px", border: "2px solid", borderColor: myGender === g ? "#e83333" : "#3e558c", borderRadius: 5, background: myGender === g ? "#e83333" : "#1e3d5c", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 12 }}>
                {g === "unspecified" ? "OTHER" : g.toUpperCase()}
              </button>
            ))}
          </div>

          <button onClick={login}
            style={{ padding: "13px 36px", border: "none", borderRadius: 6, background: "#e83333", color: "white", cursor: "pointer", fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
            ENTER
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          <button onClick={() => setModal("rules")} style={secBtn}>RULES</button>
        </div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 10 }}>
          <button onClick={() => setModal("terms")} style={secBtn}>TERMS</button>
          <button onClick={() => setModal("policy")} style={secBtn}>POLICY</button>
          <button onClick={() => setModal("privacy")} style={secBtn}>PRIVACY</button>
        </div>

        {modal === "rules" && <Popup title="RULES" onClose={() => setModal(null)}><p>18+ only<br />No nudity<br />No abuse<br />Be respectful</p></Popup>}
        {modal === "terms" && <Popup title="TERMS" onClose={() => setModal(null)}><p>By using ZUNO you agree to be 18+, not engage in illegal activity, and follow community guidelines.</p></Popup>}
        {modal === "policy" && <Popup title="POLICY" onClose={() => setModal(null)}><p>We do not store your video. Chats are ephemeral. Reports are reviewed by our team.</p></Popup>}
        {modal === "privacy" && <Popup title="PRIVACY" onClose={() => setModal(null)}><p>We collect minimal data. Your IP is used only for matching. We do not sell data.</p></Popup>}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════ */
  /*  MAIN APP                                               */
  /* ════════════════════════════════════════════════════════ */
  return (
    <div style={{ margin: 0, fontFamily: "Arial", background: "#0d2b45", color: "white", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── TOP BAR ───────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", background: "#0a1f33", borderBottom: "1px solid #1a3a5c", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ color: "#e83333", fontWeight: "bold", fontSize: 15, marginRight: 4 }}>ZUNO</span>
          <button onClick={watchAd} disabled={adUsed}
            style={{ ...topBtn, fontSize: 11, opacity: adUsed ? 0.4 : 1, cursor: adUsed ? "default" : "pointer" }}>
            {adUsed ? "ADS ✓" : `ADS +${premium ? 40 : 20}`}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: statusColor, fontSize: 12, fontWeight: "bold" }}>{statusText}</span>
          {onlineUsers > 0 && <span style={{ color: "#aaa", fontSize: 11 }}>{onlineUsers.toLocaleString()} online</span>}
          <div style={{ background: "#f1c40f", color: "#000", padding: "3px 10px", borderRadius: 20, fontWeight: "bold", fontSize: 12 }}>
            {coins} 🪙
          </div>
        </div>

        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => { setSoundsEnabled(p => !p); }} style={{ ...topBtn, fontSize: 11, color: soundsEnabled ? "white" : "#666" }}>
            {soundsEnabled ? "🔔" : "🔕"}
          </button>
          <button onClick={() => setModal("premium")} style={{ ...topBtn, fontSize: 11, color: premium ? "#f1c40f" : "white" }}>
            {premium ? "★ PRO" : "PREMIUM"}
          </button>
          <button onClick={() => setModal("history")} style={{ ...topBtn, fontSize: 11 }}>HISTORY</button>
        </div>
      </div>

      {/* ── BANNED NOTICE ─────────────────────────────────── */}
      {banned && (
        <div style={{ background: "#c0392b", padding: "10px", textAlign: "center", fontSize: 14, fontWeight: "bold" }}>
          ⚠️ You have been banned due to multiple reports.
        </div>
      )}

      {/* ── MAIN AREA ─────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: mainDir }}>

        {/* ── VIDEO SIDE ──────────────────────────────────── */}
        <div style={{ width: videoW, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: isMobile ? "6px 0" : "10px 0", flexShrink: 0 }}>

          {/* My video */}
          <div style={{ width: isMobile ? "95%" : 280, background: "#000", borderRadius: 10, overflow: "hidden", position: "relative", border: "2px solid #3e558c" }}>
            <div style={{ position: "absolute", top: 6, left: 7, zIndex: 10, display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#e83333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 11, color: "white" }}>
                {(name.trim()[0] ?? "?").toUpperCase()}
              </div>
              <div style={{ background: "rgba(0,0,0,0.65)", padding: "2px 7px", borderRadius: 10, fontSize: 11, color: "white", fontWeight: "bold" }}>
                {name.trim() || "You"} {myGender !== "unspecified" ? `· ${myGender}` : ""}
              </div>
            </div>
            {micMuted && <div style={{ position: "absolute", top: 6, right: 7, zIndex: 10, background: "rgba(220,50,50,0.85)", borderRadius: 10, padding: "2px 7px", fontSize: 11, color: "white" }}>🔇 Muted</div>}
            {camOff && <div style={{ position: "absolute", inset: 0, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, fontSize: 13, color: "#aaa" }}>📷 Camera off</div>}
            <video ref={meRef} autoPlay muted style={{ width: "100%", height: videoH, objectFit: "cover", display: "block" }} />
            {status === "idle" && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(0,0,0,0.6)", padding: "10px 12px", borderRadius: 10, textAlign: "center", minWidth: 190, backdropFilter: "blur(2px)", zIndex: 8 }}>
                <button onClick={flipCamera} style={{ padding: "5px 14px", border: "none", borderRadius: 5, background: "rgba(255,255,255,0.9)", color: "#000", cursor: "pointer", fontWeight: "bold", fontSize: 13, marginBottom: 6, width: "100%" }}>Flip Camera</button>
                <select value={selectedCamera} onChange={e => changeCamera(e.target.value)}
                  style={{ width: "100%", padding: "4px 5px", borderRadius: 5, border: "none", marginBottom: 5, background: "rgba(255,255,255,0.9)", color: "#000", fontSize: 11 }}>
                  {cameras.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label}</option>)}
                  {cameras.length === 0 && <option>No cameras</option>}
                </select>
                <select value={selectedMic} onChange={e => changeMic(e.target.value)}
                  style={{ width: "100%", padding: "4px 5px", borderRadius: 5, border: "none", background: "rgba(255,255,255,0.9)", color: "#000", fontSize: 11 }}>
                  {mics.map(m => <option key={m.deviceId} value={m.deviceId}>{m.label}</option>)}
                  {mics.length === 0 && <option>No mics</option>}
                </select>
              </div>
            )}
          </div>

          {/* Stranger video */}
          <div style={{ width: isMobile ? "95%" : 280, background: "#111", borderRadius: 10, overflow: "hidden", position: "relative", border: `2px solid ${status === "connected" ? "#2ecc71" : "#3e558c"}` }}>
            {strangerProfile && (
              <div style={{ position: "absolute", top: 6, left: 7, zIndex: 10, display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#1a6e3c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 11, color: "white" }}>
                  {(strangerProfile.name[0] ?? "?").toUpperCase()}
                </div>
                <div style={{ background: "rgba(0,0,0,0.65)", padding: "2px 7px", borderRadius: 10, fontSize: 11, color: "white", fontWeight: "bold" }}>
                  {strangerProfile.name}
                  {strangerProfile.gender && strangerProfile.gender !== "unspecified" ? ` · ${strangerProfile.gender}` : ""}
                  {strangerProfile.country ? ` · ${strangerProfile.country}` : ""}
                </div>
              </div>
            )}
            <video ref={strangerRef} autoPlay
              style={{ width: "100%", height: videoH, objectFit: "cover", display: "block", filter: status !== "connected" ? "blur(12px)" : "none", transition: "filter 0.4s" }} />
            {status !== "connected" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13, flexDirection: "column", gap: 6 }}>
                {status === "waiting"
                  ? <><div style={{ fontSize: 22 }}>⟳</div><div>Finding stranger...</div></>
                  : <><div style={{ fontSize: 22 }}>👤</div><div>Stranger</div></>
                }
              </div>
            )}
          </div>

          {/* Controls row 1 */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={start} style={{ ...actionBtn, background: "#27ae60" }}>▶ START</button>
            <button onClick={next} style={{ ...actionBtn, background: "#f39c12", color: "#000" }}>
              ⏭ NEXT {premium ? "(free)" : "(-2)"}
            </button>
            <button onClick={end} style={{ ...actionBtn, background: "#e74c3c" }}>■ END</button>
            {status === "connected" && (
              <button onClick={blockStranger} style={{ ...actionBtn, background: "#8e44ad" }}>🚫 BLOCK</button>
            )}
            <button onClick={() => setModal("report")} style={{ ...actionBtn, background: "#555" }}>⚑ REPORT</button>
          </div>

          {/* Controls row 2 — mic/cam/auto-next */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={toggleMic} style={{ ...iconBtn, borderColor: micMuted ? "#e74c3c" : "#444", background: micMuted ? "rgba(231,76,60,0.2)" : "rgba(255,255,255,0.08)" }}>
              {micMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>
            <button onClick={toggleCam} style={{ ...iconBtn, borderColor: camOff ? "#e74c3c" : "#444", background: camOff ? "rgba(231,76,60,0.2)" : "rgba(255,255,255,0.08)" }}>
              {camOff ? "📷 Cam On" : "📷 Cam Off"}
            </button>
            <button onClick={() => setAutoNext(p => !p)} style={{ ...iconBtn, borderColor: autoNext ? "#27ae60" : "#444", background: autoNext ? "rgba(39,174,96,0.2)" : "rgba(255,255,255,0.08)" }}>
              ⚡ Auto {autoNext ? "ON" : "OFF"}
            </button>
          </div>

          {/* Gender + country filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {["all", "boy", "girl"].map(g => (
              <button key={g} onClick={() => setGender(g)}
                style={{ ...genderBtn, ...(selectedGender === g ? genderActive : {}) }}>
                {g.toUpperCase()} {(g !== "all" && !premium) ? "🔒" : ""}
              </button>
            ))}
            <select value={selectedCountry} onChange={e => setCountry(e.target.value)}
              style={{ padding: "5px 8px", borderRadius: 20, border: "1px solid #3e558c", background: selectedCountry !== "all" ? "#e83333" : "transparent", color: "white", fontSize: 12, cursor: "pointer" }}>
              <option value="all">🌍 All {!premium ? "🔒" : ""}</option>
              {["US", "UK", "IN", "DE", "FR", "BR", "PH", "NG", "PK", "TR"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── CHAT SIDE ───────────────────────────────────── */}
        <div style={{ width: chatW, height: chatH, background: "#f7f8fa", color: "#111", display: "flex", flexDirection: "column", borderLeft: isMobile ? "none" : "1px solid #1a3a5c", borderTop: isMobile ? "1px solid #1a3a5c" : "none" }}>
          {/* Chat header */}
          <div style={{ padding: "7px 12px", background: "#eef0f5", borderBottom: "1px solid #dde", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontWeight: "bold", fontSize: 13 }}>
              {strangerProfile ? `Chat with ${strangerProfile.name}` : "Chat"}
            </span>
            <span style={{ fontSize: 11, color: statusColor, fontWeight: "bold" }}>{statusText}</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "10px 12px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {messages.length === 0 && (
              <div style={{ color: "#bbb", fontSize: 13, marginTop: 20, textAlign: "center" }}>
                {status === "connected" ? `You're chatting with ${strangerProfile?.name ?? "Stranger"}` : "Connect to start chatting"}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                marginBottom: 6, padding: "7px 11px", borderRadius: 12,
                background: m.mine ? "#dbeafe" : "#fff",
                border: "1px solid", borderColor: m.mine ? "#bcd4f5" : "#e5e7eb",
                alignSelf: m.mine ? "flex-end" : "flex-start",
                maxWidth: "80%", fontSize: 13, boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize: 10, color: "#999", marginBottom: 2 }}>
                  {m.mine ? (name.trim() || "You") : (strangerProfile?.name ?? "Stranger")}
                </div>
                {m.text}
              </div>
            ))}
            {strangerTyping && <TypingDots />}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ display: "flex", borderTop: "1px solid #ddd", flexShrink: 0 }}>
            <input value={msgInput}
              onChange={e => handleMsgChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={status === "connected" ? "Type a message..." : "Connect first..."}
              disabled={status !== "connected"}
              style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 13, background: status !== "connected" ? "#f0f0f0" : "white" }}
            />
            <button onClick={sendMessage} disabled={status !== "connected"}
              style={{ padding: "10px 16px", background: status === "connected" ? "#e83333" : "#ccc", color: "white", border: "none", cursor: status === "connected" ? "pointer" : "default", fontWeight: "bold", fontSize: 13 }}>
              SEND
            </button>
          </div>
        </div>
      </div>

      {/* ════ MODALS ════════════════════════════════════════ */}

      {/* History */}
      {modal === "history" && (
        <Popup title="CHAT HISTORY" onClose={() => setModal(null)}>
          {history.length === 0
            ? <p style={{ color: "#999" }}>No history yet</p>
            : history.map((h, i) => <div key={i} style={{ fontSize: 13, borderBottom: "1px solid #eee", padding: "4px 0" }}>{h}</div>)
          }
        </Popup>
      )}

      {/* Report */}
      {modal === "report" && (
        <Popup title="REPORT" onClose={() => setModal(null)}>
          <p style={{ fontSize: 12, color: "#888" }}>After 3 reports a user is auto-banned.</p>
          <button onClick={() => report("Abuse")} style={popupBtn}>ABUSE</button>
          <button onClick={() => report("Nudity")} style={popupBtn}>NUDITY</button>
          <button onClick={() => report("Violence")} style={popupBtn}>VIOLENCE</button>
          <button onClick={() => report("Spam")} style={popupBtn}>SPAM</button>
        </Popup>
      )}

      {/* Premium */}
      {modal === "premium" && (
        <Popup title="★ PREMIUM" onClose={() => setModal(null)}>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>
            Unlock: free NEXT (no coin cost), 2× ad coins, gender filter, country filter
          </p>
          {premium && <p style={{ color: "#27ae60", fontWeight: "bold" }}>✔ You are currently Premium!</p>}
          <button onClick={() => buy(200, 2)} style={popupBtn}>PLATINUM — 200 coins (2h)</button>
          <button onClick={() => buy(500, 10)} style={popupBtn}>GOLD — 500 coins (10h)</button>
          <button onClick={() => buy(1000, 24)} style={popupBtn}>DIAMOND — 1000 coins (24h)</button>
        </Popup>
      )}
    </div>
  );
}
