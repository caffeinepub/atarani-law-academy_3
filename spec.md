# AtArani Law Academy

## Current State
A frontend-only React app (localStorage persistence) with teacher/student login, 11 semesters, class routine, recorded classes, study materials, student management, and teacher panel tabs.

## Requested Changes (Diff)

### Add
- New `LiveSession` interface: id, semester, title, isActive, startedAt, participants, mutedStudents, chat messages
- New `liveClasses` field in DbState: active sessions per semester
- New "Live Class" tab visible to both teacher and students
- Live Class lobby view: teacher sees "Start Class" button, students see "Join Class" button (only their semester)
- Live Class room view: camera feed, mic toggle, screen share (teacher only), chat panel, participants list
- Teacher controls: mute/unmute students, remove student, end class
- Recording: MediaRecorder-based; on end auto-saves recording entry to `recordings[semester]`
- Privacy warning banner inside live class room

### Modify
- DbState: add `liveClasses: Record<number, LiveSession | null>`
- Tab bar: add "Live Class" tab
- Main App state: track current live session view

### Remove
- Nothing removed

## Implementation Plan
1. Extend interfaces: `ChatMessage`, `Participant`, `LiveSession`, update `DbState`
2. Add live class lobby panel (pre-join): teacher starts/ends, students see join button
3. Add live class room panel (in-session): video grid placeholder, camera/mic/screenshare/chat controls
4. Implement browser WebRTC (`getUserMedia`, `getDisplayMedia`) for camera/mic/screen
5. Implement MediaRecorder for class recording; on stop, generate blob URL and auto-add to recordings
6. Teacher controls: mute toggle per student, kick student
7. Chat: local state messages with role labels
8. Persist live session state to localStorage
9. Restrict: students can only join their own semester's class
