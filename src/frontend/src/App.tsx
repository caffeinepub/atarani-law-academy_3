import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const TEACHER_USERNAME = "AtArani Law Academy";
const TEACHER_PASSWORD = "AtAraniLawAcademy@gmail.com";

const SEMESTERS = Array.from({ length: 11 }, (_: unknown, i: number) => i + 1);
const semesterLabel = (n: number) =>
  `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} Semester`;

const defaultSemesterCodes: Record<number, string> = {
  1: "ALA-SEM-01-2846",
  2: "ALA-SEM-02-5931",
  3: "ALA-SEM-03-7184",
  4: "ALA-SEM-04-4629",
  5: "ALA-SEM-05-9057",
  6: "ALA-SEM-06-1368",
  7: "ALA-SEM-07-7742",
  8: "ALA-SEM-08-2489",
  9: "ALA-SEM-09-6815",
  10: "ALA-SEM-10-3906",
  11: "ALA-SEM-11-8271",
};

interface RoutineItem {
  day: string;
  time: string;
  subject: string;
  topic: string;
}
interface RecordingItem {
  subject: string;
  chapter: string;
  title: string;
  url: string;
}
interface MaterialItem {
  subject: string;
  title: string;
  type: string;
  url: string;
}
interface Student {
  id: string;
  name: string;
  semester: number;
  code: string;
}
interface ChatMessage {
  id: string;
  sender: string;
  role: "teacher" | "student";
  text: string;
  time: string;
}
interface LiveParticipant {
  id: string;
  name: string;
  role: "teacher" | "student";
  isMuted: boolean;
}
interface LiveSession {
  id: string;
  semester: number;
  title: string;
  isActive: boolean;
  startedAt: string;
  participants: LiveParticipant[];
  chat: ChatMessage[];
}
interface DbState {
  semesterCodes: Record<number, string>;
  routines: Record<number, RoutineItem[]>;
  recordings: Record<number, RecordingItem[]>;
  materials: Record<number, MaterialItem[]>;
  students: Student[];
  liveClasses: Record<number, LiveSession | null>;
}

const defaultRoutines: Record<number, RoutineItem[]> = {
  1: [
    {
      day: "Mon",
      time: "10:00 AM",
      subject: "Legal Method",
      topic: "Introduction to Law",
    },
    {
      day: "Wed",
      time: "11:00 AM",
      subject: "English",
      topic: "Grammar & Drafting",
    },
  ],
  2: [
    {
      day: "Tue",
      time: "10:30 AM",
      subject: "Constitutional Law",
      topic: "Fundamental Rights",
    },
  ],
  3: [
    {
      day: "Thu",
      time: "12:00 PM",
      subject: "IPC",
      topic: "General Exceptions",
    },
  ],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
};

const defaultRecordings: Record<number, RecordingItem[]> = {
  1: [
    {
      subject: "Legal Method",
      chapter: "Chapter 1",
      title: "Introduction to Legal Study",
      url: "",
    },
  ],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
};

const defaultMaterials: Record<number, MaterialItem[]> = {
  1: [
    { subject: "Legal Method", title: "Law Notes PDF", type: "PDF", url: "" },
  ],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
};

const defaultLiveClasses: Record<number, LiveSession | null> = {
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
  7: null,
  8: null,
  9: null,
  10: null,
  11: null,
};

const storageKey = "atarani-law-academy-v1";

function initialState(): DbState {
  return {
    semesterCodes: defaultSemesterCodes,
    routines: defaultRoutines,
    recordings: defaultRecordings,
    materials: defaultMaterials,
    students: [],
    liveClasses: defaultLiveClasses,
  };
}

function getOrdinal(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
  if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
  if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
  return `${n}th`;
}

const LOGO_SRC =
  "/assets/uploads/screenshot_2026-03-23_142959-019d1e76-58ac-71ac-aa59-99917cdecdb1-1.png";

function Card({
  title,
  subtitle,
  children,
  className = "",
  accent = "none",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  accent?: "blue" | "amber" | "emerald" | "purple" | "none";
}) {
  const accentBar: Record<string, string> = {
    blue: "border-l-4 border-l-blue-500",
    amber: "border-l-4 border-l-amber-500",
    emerald: "border-l-4 border-l-emerald-500",
    purple: "border-l-4 border-l-purple-500",
    none: "",
  };
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${accentBar[accent]} ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Pill({
  children,
  tone = "blue",
}: { children: React.ReactNode; tone?: "blue" | "gold" | "slate" }) {
  const tones = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    gold: "bg-amber-100 text-amber-800 border-amber-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-amber-600 text-white shadow-md shadow-amber-200"
          : "bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800"
      }`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [db, setDb] = useState<DbState>(initialState());
  const [role, setRole] = useState<"teacher" | "student" | null>(null);
  const [session, setSession] = useState<{
    teacher?: boolean;
    studentId?: string;
    semesterCode?: string;
  } | null>(null);
  const [loginMode, setLoginMode] = useState<"teacher" | "student">("teacher");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSemester, setSelectedSemester] = useState(1);

  const [teacherUsername, setTeacherUsername] = useState(TEACHER_USERNAME);
  const [teacherPassword, setTeacherPassword] = useState(TEACHER_PASSWORD);
  const [studentId, setStudentId] = useState("");
  const [studentCode, setStudentCode] = useState("");

  const [newStudent, setNewStudent] = useState({
    name: "",
    semester: 1,
    code: "",
  });
  const [newRoutine, setNewRoutine] = useState<RoutineItem>({
    day: "Mon",
    time: "10:00 AM",
    subject: "",
    topic: "",
  });
  const [newRecording, setNewRecording] = useState<RecordingItem>({
    subject: "",
    chapter: "",
    title: "",
    url: "",
  });
  const [newMaterial, setNewMaterial] = useState<MaterialItem>({
    subject: "",
    title: "",
    type: "PDF",
    url: "",
  });

  // Live Class State
  const [inLiveRoom, setInLiveRoom] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [newLiveTitle, setNewLiveTitle] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as DbState;
        // Merge liveClasses default in case old save lacks it
        if (!parsed.liveClasses) parsed.liveClasses = defaultLiveClasses;
        setDb(parsed);
      }
    } catch {
      // ignore
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    if (!booting) localStorage.setItem(storageKey, JSON.stringify(db));
  }, [db, booting]);

  // Attach local stream to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach screen stream to screen video element
  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const currentStudent = useMemo(() => {
    if (role !== "student" || !session) return null;
    return db.students.find((s) => s.id === session.studentId) || null;
  }, [db.students, role, session]);

  const mySemester = currentStudent?.semester || selectedSemester;

  const loginTeacher = () => {
    if (
      teacherUsername === TEACHER_USERNAME &&
      teacherPassword === TEACHER_PASSWORD
    ) {
      setRole("teacher");
      setSession({ teacher: true });
      setActiveTab("dashboard");
      setSelectedSemester(1);
      return;
    }
    alert("Teacher login failed.");
  };

  const loginStudent = () => {
    const found = db.students.find(
      (s) =>
        s.id.trim().toUpperCase() === studentId.trim().toUpperCase() &&
        s.code === studentCode.trim(),
    );
    if (!found) {
      alert("Student ID or code is incorrect.");
      return;
    }
    const semesterCode = db.semesterCodes[found.semester];
    setRole("student");
    setSession({ studentId: found.id, semesterCode });
    setSelectedSemester(found.semester);
    setActiveTab("dashboard");
  };

  const addStudent = () => {
    if (!newStudent.name.trim()) {
      alert("Enter student name.");
      return;
    }
    const sem = Number(newStudent.semester);
    const id = `ALA-${getOrdinal(sem)}-${String(db.students.length + 1).padStart(3, "0")}`;
    const code = (
      newStudent.code ||
      `STU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    ).trim();
    setDb((prev) => ({
      ...prev,
      students: [
        ...prev.students,
        { id, name: newStudent.name.trim(), semester: sem, code },
      ],
    }));
    setNewStudent({ name: "", semester: sem, code: "" });
    alert(`Student created. ID: ${id} | Code: ${code}`);
  };

  const addRoutine = () => {
    if (!newRoutine.subject.trim() || !newRoutine.topic.trim()) {
      alert("Enter subject and topic.");
      return;
    }
    setDb((prev) => ({
      ...prev,
      routines: {
        ...prev.routines,
        [selectedSemester]: [
          ...(prev.routines[selectedSemester] || []),
          { ...newRoutine },
        ],
      },
    }));
    setNewRoutine({ day: "Mon", time: "10:00 AM", subject: "", topic: "" });
  };

  const addRecording = () => {
    if (!newRecording.subject.trim() || !newRecording.title.trim()) {
      alert("Enter subject and title.");
      return;
    }
    setDb((prev) => ({
      ...prev,
      recordings: {
        ...prev.recordings,
        [selectedSemester]: [
          ...(prev.recordings[selectedSemester] || []),
          { ...newRecording },
        ],
      },
    }));
    setNewRecording({ subject: "", chapter: "", title: "", url: "" });
  };

  const addMaterial = () => {
    if (!newMaterial.subject.trim() || !newMaterial.title.trim()) {
      alert("Enter subject and title.");
      return;
    }
    setDb((prev) => ({
      ...prev,
      materials: {
        ...prev.materials,
        [selectedSemester]: [
          ...(prev.materials[selectedSemester] || []),
          { ...newMaterial },
        ],
      },
    }));
    setNewMaterial({ subject: "", title: "", type: "PDF", url: "" });
  };

  const updateSemesterCode = (sem: number, value: string) => {
    setDb((prev) => ({
      ...prev,
      semesterCodes: { ...prev.semesterCodes, [sem]: value },
    }));
  };

  const logout = () => {
    stopAllStreams();
    setInLiveRoom(false);
    setRole(null);
    setSession(null);
    setStudentId("");
    setStudentCode("");
    setActiveTab("dashboard");
  };

  // ===================== LIVE CLASS HELPERS =====================

  const stopAllStreams = () => {
    if (localStream) {
      for (const t of localStream.getTracks()) t.stop();
      setLocalStream(null);
    }
    if (screenStream) {
      for (const t of screenStream.getTracks()) t.stop();
      setScreenStream(null);
    }
    setCameraOn(false);
    setMicOn(false);
    setScreenSharing(false);
  };

  const saveRecordingToDb = (sem: number, title: string, blobUrl: string) => {
    setDb((prev) => ({
      ...prev,
      recordings: {
        ...prev.recordings,
        [sem]: [
          ...(prev.recordings[sem] || []),
          {
            subject: "Live Class",
            chapter: "Auto-saved",
            title: title || "Live Class Recording",
            url: blobUrl,
          },
        ],
      },
    }));
  };

  const stopRecording = (sem: number, title: string) => {
    if (!mediaRecorder) return;
    mediaRecorder.addEventListener(
      "stop",
      () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        saveRecordingToDb(sem, title, url);
        recordedChunksRef.current = [];
        alert(`Recording saved to Recorded Classes for ${semesterLabel(sem)}.`);
      },
      { once: true },
    );
    mediaRecorder.stop();
    setIsRecording(false);
    setMediaRecorder(null);
  };

  const startRecording = () => {
    const stream = screenStream || localStream;
    if (!stream) {
      alert("Please turn on your camera or screen share first to record.");
      return;
    }
    try {
      recordedChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      mr.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      });
      mr.start(1000);
      setMediaRecorder(mr);
      setIsRecording(true);
    } catch {
      alert(
        "Recording failed. Make sure your browser supports WebRTC recording.",
      );
    }
  };

  const toggleCamera = async () => {
    if (cameraOn) {
      if (localStream) {
        for (const t of localStream.getVideoTracks()) t.stop();
        const audioTracks = localStream.getAudioTracks();
        if (audioTracks.length > 0) {
          // Keep audio stream
          const audioOnlyStream = new MediaStream(audioTracks);
          setLocalStream(audioOnlyStream);
        } else {
          setLocalStream(null);
        }
      }
      setCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: micOn,
        });
        setLocalStream(stream);
        setCameraOn(true);
        if (micOn || stream.getAudioTracks().length > 0) setMicOn(true);
      } catch {
        alert("Camera access denied or not available.");
      }
    }
  };

  const toggleMic = async () => {
    if (micOn) {
      if (localStream) {
        for (const t of localStream.getAudioTracks()) t.enabled = false;
      }
      setMicOn(false);
    } else {
      if (localStream && localStream.getAudioTracks().length > 0) {
        for (const t of localStream.getAudioTracks()) t.enabled = true;
        setMicOn(true);
      } else {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          if (localStream) {
            for (const t of audioStream.getAudioTracks())
              localStream.addTrack(t);
            setLocalStream(new MediaStream(localStream.getTracks()));
          } else {
            setLocalStream(audioStream);
          }
          setMicOn(true);
        } catch {
          alert("Microphone access denied or not available.");
        }
      }
    }
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      if (screenStream) {
        for (const t of screenStream.getTracks()) t.stop();
        setScreenStream(null);
      }
      setScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        stream.getVideoTracks()[0]?.addEventListener("ended", () => {
          setScreenStream(null);
          setScreenSharing(false);
        });
        setScreenStream(stream);
        setScreenSharing(true);
      } catch {
        alert("Screen share access denied or not available.");
      }
    }
  };

  const startLiveClass = () => {
    if (!newLiveTitle.trim()) {
      alert("Enter a class title.");
      return;
    }
    const sem = selectedSemester;
    const session: LiveSession = {
      id: `live-${Date.now()}`,
      semester: sem,
      title: newLiveTitle.trim(),
      isActive: true,
      startedAt: new Date().toLocaleTimeString(),
      participants: [
        { id: "teacher", name: "Teacher", role: "teacher", isMuted: false },
      ],
      chat: [],
    };
    setDb((prev) => ({
      ...prev,
      liveClasses: { ...prev.liveClasses, [sem]: session },
    }));
    setNewLiveTitle("");
    setInLiveRoom(true);
  };

  const joinLiveClass = () => {
    const sem = mySemester;
    const liveSession = db.liveClasses[sem];
    if (!liveSession) return;
    if (role === "student" && currentStudent) {
      const alreadyIn = liveSession.participants.some(
        (p) => p.id === currentStudent.id,
      );
      if (!alreadyIn) {
        setDb((prev) => {
          const ls = prev.liveClasses[sem];
          if (!ls) return prev;
          return {
            ...prev,
            liveClasses: {
              ...prev.liveClasses,
              [sem]: {
                ...ls,
                participants: [
                  ...ls.participants,
                  {
                    id: currentStudent.id,
                    name: currentStudent.name,
                    role: "student",
                    isMuted: false,
                  },
                ],
              },
            },
          };
        });
      }
    } else if (role === "teacher") {
      const alreadyIn = liveSession.participants.some(
        (p) => p.id === "teacher",
      );
      if (!alreadyIn) {
        setDb((prev) => {
          const ls = prev.liveClasses[sem];
          if (!ls) return prev;
          return {
            ...prev,
            liveClasses: {
              ...prev.liveClasses,
              [sem]: {
                ...ls,
                participants: [
                  ...ls.participants,
                  {
                    id: "teacher",
                    name: "Teacher",
                    role: "teacher",
                    isMuted: false,
                  },
                ],
              },
            },
          };
        });
      }
    }
    setInLiveRoom(true);
  };

  const endLiveClass = () => {
    const sem = role === "teacher" ? selectedSemester : mySemester;
    const liveSession = db.liveClasses[sem];
    if (isRecording && liveSession) {
      stopRecording(sem, liveSession.title);
    }
    stopAllStreams();
    setDb((prev) => ({
      ...prev,
      liveClasses: { ...prev.liveClasses, [sem]: null },
    }));
    setInLiveRoom(false);
    setIsRecording(false);
    setMediaRecorder(null);
  };

  const leaveRoom = () => {
    stopAllStreams();
    if (isRecording) {
      const sem = role === "teacher" ? selectedSemester : mySemester;
      const liveSession = db.liveClasses[sem];
      if (liveSession) stopRecording(sem, liveSession.title);
    }
    setInLiveRoom(false);
    setIsRecording(false);
    setMediaRecorder(null);
  };

  const sendChat = () => {
    const sem = role === "teacher" ? selectedSemester : mySemester;
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender:
        role === "teacher" ? "Teacher" : currentStudent?.name || "Student",
      role: role as "teacher" | "student",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setDb((prev) => {
      const ls = prev.liveClasses[sem];
      if (!ls) return prev;
      return {
        ...prev,
        liveClasses: {
          ...prev.liveClasses,
          [sem]: { ...ls, chat: [...ls.chat, msg] },
        },
      };
    });
    setChatInput("");
  };

  const muteParticipant = (participantId: string) => {
    const sem = selectedSemester;
    setDb((prev) => {
      const ls = prev.liveClasses[sem];
      if (!ls) return prev;
      return {
        ...prev,
        liveClasses: {
          ...prev.liveClasses,
          [sem]: {
            ...ls,
            participants: ls.participants.map((p) =>
              p.id === participantId ? { ...p, isMuted: !p.isMuted } : p,
            ),
          },
        },
      };
    });
  };

  const kickParticipant = (participantId: string) => {
    const sem = selectedSemester;
    setDb((prev) => {
      const ls = prev.liveClasses[sem];
      if (!ls) return prev;
      return {
        ...prev,
        liveClasses: {
          ...prev.liveClasses,
          [sem]: {
            ...ls,
            participants: ls.participants.filter((p) => p.id !== participantId),
          },
        },
      };
    });
  };

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading…
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Hero panel */}
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-blue-900/80 p-8 text-white shadow-2xl backdrop-blur-sm">
            {/* Logo */}
            <div className="mb-6 flex items-center gap-4">
              <img
                src={LOGO_SRC}
                alt="AtArani Law Academy Logo"
                className="h-20 w-20 rounded-full border-2 border-amber-400 object-cover shadow-lg shadow-amber-500/30"
              />
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                  Private Law Education
                </div>
                <div className="text-sm text-blue-200">
                  Secure Academic Platform
                </div>
              </div>
            </div>
            <Pill tone="gold">Private Law Education Platform</Pill>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-5xl">
              AtArani Law Academy
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-200 md:text-base">
              A clean, premium, private study app for law students and teachers.
              Semester-based access, recorded classes, study materials, class
              routine, and teacher control in one simple interface.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
                <div className="text-2xl font-bold text-blue-200">Private</div>
                <div className="text-sm text-blue-300">Login only</div>
              </div>
              <div className="rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-4">
                <div className="text-2xl font-bold text-indigo-200">Mobile</div>
                <div className="text-sm text-blue-300">Fast &amp; simple</div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/15 p-4 text-sm text-amber-200">
              ⚠️ Screen recording, screenshot, or sharing of content is not
              allowed.
            </div>
          </div>

          {/* Login card */}
          <div className="rounded-[2rem] border border-slate-300 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                data-ocid="login.teacher.tab"
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  loginMode === "teacher"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
                onClick={() => setLoginMode("teacher")}
              >
                Teacher Login
              </button>
              <button
                type="button"
                data-ocid="login.student.tab"
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  loginMode === "student"
                    ? "bg-indigo-700 text-white shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
                onClick={() => setLoginMode("student")}
              >
                Student Login
              </button>
            </div>

            {loginMode === "teacher" ? (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  Teacher access
                </h2>
                <input
                  data-ocid="teacher.input"
                  className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  value={teacherUsername}
                  onChange={(e) => setTeacherUsername(e.target.value)}
                  placeholder="Teacher username"
                />
                <input
                  data-ocid="teacher_password.input"
                  className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Teacher password"
                />
                <button
                  type="button"
                  data-ocid="teacher_login.primary_button"
                  onClick={loginTeacher}
                  className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3 font-semibold text-white shadow-md transition hover:from-slate-800 hover:to-slate-600 hover:shadow-lg"
                >
                  Enter as Teacher
                </button>
                <p className="text-xs text-slate-500">
                  Starter credentials are prefilled so you can enter first,
                  adjust settings, and create student access.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  Student access
                </h2>
                <input
                  data-ocid="student_id.input"
                  className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Student ID"
                />
                <input
                  data-ocid="student_code.input"
                  className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="Student code"
                />
                <button
                  type="button"
                  data-ocid="student_login.primary_button"
                  onClick={loginStudent}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-700 px-4 py-3 font-semibold text-white shadow-md transition hover:from-indigo-600 hover:to-blue-600 hover:shadow-lg"
                >
                  Login as Student
                </button>
                <p className="text-xs text-slate-500">
                  Students use the ID and code given by the teacher.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const semesterView = role === "teacher" ? selectedSemester : mySemester;
  const semesterRoutine = db.routines[semesterView] || [];
  const semesterRecordings = db.recordings[semesterView] || [];
  const semesterMaterials = db.materials[semesterView] || [];
  const liveSem = role === "teacher" ? selectedSemester : mySemester;
  const liveSession = db.liveClasses[liveSem] || null;

  // ===================== LIVE ROOM =====================
  if (inLiveRoom && liveSession) {
    return (
      <div className="flex h-screen flex-col bg-slate-900 text-white overflow-hidden">
        {/* Privacy Warning Banner */}
        <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-slate-900">
          ⚠️ Screen recording, screenshot, or sharing is not allowed
        </div>

        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_SRC}
              alt="logo"
              className="h-8 w-8 rounded-full border border-amber-400 object-cover"
            />
            <div>
              <div className="font-semibold text-white text-sm">
                {liveSession.title}
              </div>
              <div className="text-xs text-slate-400">
                {semesterLabel(liveSem)} • Started {liveSession.startedAt}
              </div>
            </div>
            {isRecording && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-900/60 px-3 py-1 text-xs font-semibold text-red-400">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                REC
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {role === "teacher" && (
              <button
                type="button"
                data-ocid="liveclass.end_class.delete_button"
                onClick={endLiveClass}
                className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                End Class
              </button>
            )}
            <button
              type="button"
              data-ocid="liveclass.leave.button"
              onClick={leaveRoom}
              className="rounded-full border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Video + Participants */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Video Area */}
            <div className="flex flex-1 items-center justify-center gap-4 p-4 overflow-auto">
              {/* Camera video */}
              <div className="relative flex-1 max-w-2xl">
                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
                  {cameraOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500">
                      <span className="text-5xl">👤</span>
                      <span className="text-sm">Camera off</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-white">
                  {role === "teacher"
                    ? "Teacher (You)"
                    : currentStudent?.name || "You"}
                </div>
              </div>

              {/* Screen share video */}
              {screenSharing && screenStream && (
                <div className="relative flex-1 max-w-2xl">
                  <div className="aspect-video w-full overflow-hidden rounded-2xl border border-blue-500 bg-slate-800">
                    <video
                      ref={screenRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 rounded-full bg-blue-900/80 px-3 py-1 text-xs text-blue-300">
                    🖥️ Screen Share
                  </div>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="border-t border-slate-700 bg-slate-800/50 px-4 py-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Participants ({liveSession.participants.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {liveSession.participants.map((p) => (
                  <div
                    key={p.id}
                    data-ocid={`liveclass.participants.item.${liveSession.participants.indexOf(p) + 1}`}
                    className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm"
                  >
                    <span>{p.isMuted ? "🔇" : "🎤"}</span>
                    <span className="text-white">{p.name}</span>
                    {p.role === "teacher" && (
                      <span className="rounded-full bg-amber-600/30 px-1.5 py-0.5 text-xs text-amber-400">
                        Teacher
                      </span>
                    )}
                    {role === "teacher" && p.role === "student" && (
                      <>
                        <button
                          type="button"
                          data-ocid={`liveclass.mute.toggle.${liveSession.participants.indexOf(p) + 1}`}
                          onClick={() => muteParticipant(p.id)}
                          className="ml-1 rounded-full bg-slate-600 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-500"
                          title={p.isMuted ? "Unmute" : "Mute"}
                        >
                          {p.isMuted ? "Unmute" : "Mute"}
                        </button>
                        <button
                          type="button"
                          data-ocid={`liveclass.kick.delete_button.${liveSession.participants.indexOf(p) + 1}`}
                          onClick={() => kickParticipant(p.id)}
                          className="rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-400 hover:bg-red-900"
                          title="Remove from class"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-700 bg-slate-800 px-4 py-4">
              {/* Camera */}
              <button
                type="button"
                data-ocid="liveclass.camera.toggle"
                onClick={toggleCamera}
                className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 text-xs font-medium transition ${
                  cameraOn
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <span className="text-xl">{cameraOn ? "📷" : "📵"}</span>
                <span>{cameraOn ? "Camera On" : "Camera Off"}</span>
              </button>

              {/* Mic */}
              <button
                type="button"
                data-ocid="liveclass.mic.toggle"
                onClick={toggleMic}
                className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 text-xs font-medium transition ${
                  micOn
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <span className="text-xl">{micOn ? "🎤" : "🔇"}</span>
                <span>{micOn ? "Mic On" : "Mic Off"}</span>
              </button>

              {/* Screen Share (teacher only) */}
              {role === "teacher" && (
                <button
                  type="button"
                  data-ocid="liveclass.screen_share.toggle"
                  onClick={toggleScreenShare}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 text-xs font-medium transition ${
                    screenSharing
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <span className="text-xl">🖥️</span>
                  <span>{screenSharing ? "Stop Share" : "Share Screen"}</span>
                </button>
              )}

              {/* Record (teacher only) */}
              {role === "teacher" && (
                <button
                  type="button"
                  data-ocid="liveclass.record.toggle"
                  onClick={
                    isRecording
                      ? () => stopRecording(liveSem, liveSession.title)
                      : startRecording
                  }
                  className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 text-xs font-medium transition ${
                    isRecording
                      ? "bg-red-700 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <span className="text-xl">⏺️</span>
                  <span>{isRecording ? "Stop Rec" : "Record"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Chat */}
          <div
            className="flex w-72 flex-col border-l border-slate-700 bg-slate-800 md:w-80"
            data-ocid="liveclass.chat.panel"
          >
            <div className="border-b border-slate-700 px-4 py-3">
              <div className="font-semibold text-sm text-white">
                💬 Class Chat
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {liveSession.chat.length === 0 && (
                <div
                  className="text-center text-xs text-slate-500 pt-4"
                  data-ocid="liveclass.chat.empty_state"
                >
                  No messages yet. Say hello!
                </div>
              )}
              {liveSession.chat.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-3 text-sm ${
                    msg.role === "teacher"
                      ? "bg-amber-600/20 border border-amber-500/30"
                      : "bg-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-xs text-white">
                      {msg.sender}
                    </span>
                    {msg.role === "teacher" && (
                      <span className="text-xs text-amber-400">(Teacher)</span>
                    )}
                    <span className="ml-auto text-xs text-slate-500">
                      {msg.time}
                    </span>
                  </div>
                  <div className="text-slate-200 leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-slate-700 p-3">
              <div className="flex gap-2">
                <input
                  data-ocid="liveclass.chat.input"
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-500"
                  placeholder="Type a message…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendChat();
                  }}
                />
                <button
                  type="button"
                  data-ocid="liveclass.chat.submit_button"
                  onClick={sendChat}
                  className="rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-500"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN APP =====================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-700 bg-slate-900 shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_SRC}
              alt="AtArani Law Academy Logo"
              className="h-10 w-10 rounded-full border-2 border-amber-400 object-cover"
            />
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
                AtArani Law Academy
              </div>
              <div className="text-xs text-slate-400">
                Private study platform
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="gold">
              {role === "teacher"
                ? "Teacher"
                : `Student • ${semesterLabel(mySemester)}`}
            </Pill>
            <button
              type="button"
              onClick={() => setSelectedSemester(semesterView)}
              className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
            >
              {semesterLabel(semesterView)}
            </button>
            <button
              type="button"
              data-ocid="logout.button"
              onClick={logout}
              className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Welcome + Privacy */}
        <section className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card
            title="Welcome"
            subtitle="Simple, elegant, and private learning space."
            accent="blue"
          >
            <div className="flex flex-wrap gap-2">
              <Pill tone="blue">Semester-based access</Pill>
              <Pill tone="gold">Recorded classes</Pill>
              <Pill tone="slate">PDF notes</Pill>
              <Pill tone="slate">Class routine</Pill>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              {role === "teacher"
                ? "As teacher, you can change semester codes, add students, upload videos/notes, and manage content by semester."
                : "You can only view your own semester content. Other semester materials stay hidden from your dashboard."}
            </p>
          </Card>
          <Card
            title="Privacy notice"
            subtitle="For academy students only."
            accent="amber"
          >
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900">
              ⚠️ Screen recording, screenshot, or sharing of content is not
              allowed.
            </div>
          </Card>
        </section>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </TabButton>
          <TabButton
            active={activeTab === "routine"}
            onClick={() => setActiveTab("routine")}
          >
            Class Routine
          </TabButton>
          <TabButton
            active={activeTab === "classes"}
            onClick={() => setActiveTab("classes")}
          >
            Recorded Classes
          </TabButton>
          <TabButton
            active={activeTab === "materials"}
            onClick={() => setActiveTab("materials")}
          >
            Study Materials
          </TabButton>
          <TabButton
            active={activeTab === "students"}
            onClick={() => setActiveTab("students")}
          >
            Students
          </TabButton>
          <TabButton
            active={activeTab === "liveclass"}
            onClick={() => setActiveTab("liveclass")}
          >
            🔴 Live Class
          </TabButton>
          {role === "teacher" ? (
            <TabButton
              active={activeTab === "teacher"}
              onClick={() => setActiveTab("teacher")}
            >
              Teacher Panel
            </TabButton>
          ) : null}
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card
              title="Current semester"
              subtitle="Only this semester is visible to the logged-in user."
              accent="blue"
            >
              <div className="flex items-center gap-3">
                <Pill tone="gold">{semesterLabel(semesterView)}</Pill>
                <Pill tone="blue">Code: {db.semesterCodes[semesterView]}</Pill>
              </div>
            </Card>
            <Card
              title="Quick access"
              subtitle="Simple navigation for study use."
              accent="amber"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  data-ocid="dashboard.classes.button"
                  onClick={() => setActiveTab("classes")}
                  className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-700 px-4 py-3 text-left font-medium text-white shadow transition hover:from-indigo-600 hover:to-blue-600"
                >
                  Open Recorded Classes
                </button>
                <button
                  type="button"
                  data-ocid="dashboard.materials.button"
                  onClick={() => setActiveTab("materials")}
                  className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-left font-medium text-amber-800 transition hover:bg-amber-100"
                >
                  Open Study Materials
                </button>
                <button
                  type="button"
                  data-ocid="dashboard.liveclass.button"
                  onClick={() => setActiveTab("liveclass")}
                  className="rounded-2xl bg-gradient-to-r from-red-700 to-rose-700 px-4 py-3 text-left font-medium text-white shadow transition hover:from-red-600 hover:to-rose-600"
                >
                  🔴 Go to Live Class
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Routine */}
        {activeTab === "routine" && (
          <Card
            title={`${semesterLabel(semesterView)} Routine`}
            subtitle="Class schedule for the selected semester."
            accent="blue"
          >
            {semesterRoutine.length ? (
              <div className="grid gap-3" data-ocid="routine.list">
                {semesterRoutine.map((item, idx) => (
                  <div
                    key={`${item.subject}-${idx}`}
                    data-ocid={`routine.item.${idx + 1}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {item.subject}
                      </div>
                      <div className="text-sm text-slate-500">{item.topic}</div>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Pill tone="slate">{item.day}</Pill>
                      <Pill tone="blue">{item.time}</Pill>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-ocid="routine.empty_state"
                className="text-sm text-slate-500"
              >
                No routine added yet.
              </div>
            )}
          </Card>
        )}

        {/* Recorded Classes */}
        {activeTab === "classes" && (
          <Card
            title={`${semesterLabel(semesterView)} Recorded Classes`}
            subtitle="Subject → Chapter → Video."
            accent="blue"
          >
            {semesterRecordings.length ? (
              <div className="grid gap-3" data-ocid="classes.list">
                {semesterRecordings.map((item, idx) => (
                  <div
                    key={`${item.subject}-${idx}`}
                    data-ocid={`classes.item.${idx + 1}`}
                    className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {item.subject}
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.chapter || "Chapter"} • {item.title}
                        </div>
                      </div>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-emerald-500 hover:to-teal-500"
                        >
                          ▶ Watch
                        </a>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
                          Link not added
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-ocid="classes.empty_state"
                className="text-sm text-slate-500"
              >
                No recorded class added yet.
              </div>
            )}
          </Card>
        )}

        {/* Study Materials */}
        {activeTab === "materials" && (
          <Card
            title={`${semesterLabel(semesterView)} Study Materials`}
            subtitle="PDFs, notes, and downloads."
            accent="purple"
          >
            {semesterMaterials.length ? (
              <div className="grid gap-3" data-ocid="materials.list">
                {semesterMaterials.map((item, idx) => (
                  <div
                    key={`${item.subject}-${idx}`}
                    data-ocid={`materials.item.${idx + 1}`}
                    className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {item.subject}
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.title}
                        </div>
                      </div>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border-2 border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-800 transition hover:bg-purple-100"
                        >
                          {item.type === "PDF" ? "Open / Download" : "Open"}
                        </a>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
                          Link not added
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-ocid="materials.empty_state"
                className="text-sm text-slate-500"
              >
                No study material added yet.
              </div>
            )}
          </Card>
        )}

        {/* Students */}
        {activeTab === "students" && (
          <Card
            title={`${semesterLabel(semesterView)} Students`}
            subtitle="Students only see their own semester content."
            accent="emerald"
          >
            {db.students.filter((s) => s.semester === semesterView).length ? (
              <div className="grid gap-3" data-ocid="students.list">
                {db.students
                  .filter((s) => s.semester === semesterView)
                  .map((s, idx) => (
                    <div
                      key={s.id}
                      data-ocid={`students.item.${idx + 1}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {s.name}
                        </div>
                        <div className="text-sm text-slate-500">ID: {s.id}</div>
                      </div>
                      <Pill tone="blue">Code: {s.code}</Pill>
                    </div>
                  ))}
              </div>
            ) : (
              <div
                data-ocid="students.empty_state"
                className="text-sm text-slate-500"
              >
                No student added for this semester yet.
              </div>
            )}
          </Card>
        )}

        {/* Live Class Tab */}
        {activeTab === "liveclass" && (
          <div className="space-y-4" data-ocid="liveclass.section">
            {/* Privacy warning */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900">
              ⚠️ Screen recording, screenshot, or sharing is not allowed during
              live classes.
            </div>

            {role === "teacher" ? (
              <Card
                title={`Live Class — ${semesterLabel(selectedSemester)}`}
                subtitle="Start and manage live sessions for your students."
                accent="blue"
              >
                {!liveSession ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
                      <div className="mb-3 text-sm font-semibold text-slate-700">
                        No active session for this semester.
                      </div>
                      <div className="flex gap-3">
                        <input
                          data-ocid="liveclass.title.input"
                          className="flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                          placeholder="Class title (e.g. Constitutional Law – Session 1)"
                          value={newLiveTitle}
                          onChange={(e) => setNewLiveTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") startLiveClass();
                          }}
                        />
                        <button
                          type="button"
                          data-ocid="liveclass.start.primary_button"
                          onClick={startLiveClass}
                          className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-semibold text-white shadow transition hover:from-emerald-500 hover:to-teal-500"
                        >
                          🟢 Start Live Class
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-red-500" />
                        <span className="font-semibold text-emerald-900">
                          Live: {liveSession.title}
                        </span>
                        <Pill tone="gold">Started {liveSession.startedAt}</Pill>
                      </div>
                      <div className="mt-2 text-sm text-emerald-700">
                        {liveSession.participants.length} participant(s) in room
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        data-ocid="liveclass.join.primary_button"
                        onClick={joinLiveClass}
                        className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-3 font-semibold text-white shadow transition hover:from-blue-600 hover:to-indigo-600"
                      >
                        Join Room
                      </button>
                      <button
                        type="button"
                        data-ocid="liveclass.end.delete_button"
                        onClick={endLiveClass}
                        className="rounded-2xl bg-red-700 px-5 py-3 font-semibold text-white shadow transition hover:bg-red-600"
                      >
                        End Class
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              /* Student view */
              <Card
                title={`Live Class — ${semesterLabel(mySemester)}`}
                subtitle="Join your semester's live class when available."
                accent="blue"
              >
                {liveSession ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-red-500" />
                        <span className="font-semibold text-emerald-900">
                          Live Now: {liveSession.title}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-emerald-700">
                        {liveSession.participants.length} participant(s) in
                        class
                      </div>
                    </div>
                    <button
                      type="button"
                      data-ocid="liveclass.join.primary_button"
                      onClick={joinLiveClass}
                      className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-semibold text-white shadow transition hover:from-emerald-500 hover:to-teal-500"
                    >
                      Join Class
                    </button>
                  </div>
                ) : (
                  <div
                    data-ocid="liveclass.empty_state"
                    className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-6 text-center"
                  >
                    <div className="text-3xl mb-2">📡</div>
                    <div className="font-medium text-slate-700">
                      No live class currently.
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Check back later — your teacher will start a session soon.
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Teacher Panel */}
        {role === "teacher" && activeTab === "teacher" && (
          <div className="grid gap-4 xl:grid-cols-2">
            <Card
              title="Semester access codes"
              subtitle="Edit the code for each semester."
              accent="amber"
            >
              <div className="max-h-[620px] space-y-3 overflow-auto pr-1">
                {SEMESTERS.map((sem) => (
                  <div
                    key={sem}
                    className="grid gap-2 rounded-2xl border-2 border-slate-100 p-4 md:grid-cols-[160px_1fr] md:items-center"
                  >
                    <div className="font-medium text-slate-800">
                      {semesterLabel(sem)}
                    </div>
                    <input
                      className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                      value={db.semesterCodes[sem] || ""}
                      onChange={(e) => updateSemesterCode(sem, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              <Card
                title="Add student"
                subtitle="Create student ID and code."
                accent="blue"
              >
                <div className="grid gap-3">
                  <input
                    data-ocid="add_student.input"
                    className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Student name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      data-ocid="add_student.select"
                      className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                      value={newStudent.semester}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          semester: Number(e.target.value),
                        })
                      }
                    >
                      {SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>
                          {semesterLabel(sem)}
                        </option>
                      ))}
                    </select>
                    <input
                      data-ocid="add_student_code.input"
                      className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                      placeholder="Student code (optional)"
                      value={newStudent.code}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, code: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    data-ocid="add_student.primary_button"
                    onClick={addStudent}
                    className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3 font-semibold text-white shadow transition hover:from-blue-600 hover:to-indigo-600"
                  >
                    Create Student
                  </button>
                </div>
              </Card>

              <Card
                title="Add content to selected semester"
                subtitle={`Currently editing: ${semesterLabel(selectedSemester)}`}
                accent="purple"
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  {SEMESTERS.map((sem) => (
                    <button
                      type="button"
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        selectedSemester === sem
                          ? "bg-indigo-700 text-white shadow"
                          : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4">
                  {/* Add routine */}
                  <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 font-semibold text-slate-800">
                      Add routine
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                        value={newRoutine.subject}
                        onChange={(e) =>
                          setNewRoutine({
                            ...newRoutine,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Subject"
                      />
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                        value={newRoutine.topic}
                        onChange={(e) =>
                          setNewRoutine({
                            ...newRoutine,
                            topic: e.target.value,
                          })
                        }
                        placeholder="Topic"
                      />
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                        value={newRoutine.day}
                        onChange={(e) =>
                          setNewRoutine({ ...newRoutine, day: e.target.value })
                        }
                        placeholder="Day"
                      />
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                        value={newRoutine.time}
                        onChange={(e) =>
                          setNewRoutine({ ...newRoutine, time: e.target.value })
                        }
                        placeholder="Time"
                      />
                    </div>
                    <button
                      type="button"
                      data-ocid="add_routine.button"
                      onClick={addRoutine}
                      className="mt-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3 font-medium text-amber-800 transition hover:bg-amber-100"
                    >
                      Add Routine
                    </button>
                  </div>

                  {/* Add recorded class */}
                  <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 font-semibold text-slate-800">
                      Add recorded class
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        value={newRecording.subject}
                        onChange={(e) =>
                          setNewRecording({
                            ...newRecording,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Subject"
                      />
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        value={newRecording.chapter}
                        onChange={(e) =>
                          setNewRecording({
                            ...newRecording,
                            chapter: e.target.value,
                          })
                        }
                        placeholder="Chapter"
                      />
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 md:col-span-2"
                        value={newRecording.title}
                        onChange={(e) =>
                          setNewRecording({
                            ...newRecording,
                            title: e.target.value,
                          })
                        }
                        placeholder="Video title"
                      />
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 md:col-span-2"
                        value={newRecording.url}
                        onChange={(e) =>
                          setNewRecording({
                            ...newRecording,
                            url: e.target.value,
                          })
                        }
                        placeholder="YouTube / video link"
                      />
                    </div>
                    <button
                      type="button"
                      data-ocid="add_recording.button"
                      onClick={addRecording}
                      className="mt-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-4 py-3 font-medium text-emerald-800 transition hover:bg-emerald-100"
                    >
                      Add Video
                    </button>
                  </div>

                  {/* Add study material */}
                  <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 font-semibold text-slate-800">
                      Add study material
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500"
                        value={newMaterial.subject}
                        onChange={(e) =>
                          setNewMaterial({
                            ...newMaterial,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Subject"
                      />
                      <select
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500"
                        value={newMaterial.type}
                        onChange={(e) =>
                          setNewMaterial({
                            ...newMaterial,
                            type: e.target.value,
                          })
                        }
                      >
                        <option value="PDF">PDF</option>
                        <option value="Notes">Notes</option>
                      </select>
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500 md:col-span-2"
                        value={newMaterial.title}
                        onChange={(e) =>
                          setNewMaterial({
                            ...newMaterial,
                            title: e.target.value,
                          })
                        }
                        placeholder="Material title"
                      />
                      <input
                        className="rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500 md:col-span-2"
                        value={newMaterial.url}
                        onChange={(e) =>
                          setNewMaterial({
                            ...newMaterial,
                            url: e.target.value,
                          })
                        }
                        placeholder="PDF / file link"
                      />
                    </div>
                    <button
                      type="button"
                      data-ocid="add_material.button"
                      onClick={addMaterial}
                      className="mt-3 rounded-2xl border-2 border-purple-400 bg-purple-50 px-4 py-3 font-medium text-purple-800 transition hover:bg-purple-100"
                    >
                      Add Material
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-slate-900 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()}.
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="text-amber-400 hover:text-amber-300"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
