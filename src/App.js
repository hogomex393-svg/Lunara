import React, { useState, useCallback, useEffect } from 'react';
import './styles.css';
import {
  MOODS, SYMPTOMS, ONBOARDING_QUESTIONS, COMMUNITY_POSTS,
  CYCLE_PHASES, AI_RESPONSES, GALLERY_IMAGES, GALLERY_COLORS,
} from './data';
import { saveProfile, saveDailyLog, DEMO_USER_ID } from './api';

// ─── Screens ─────────────────────────────────────────────────────────
import Onboarding from './screens/Onboarding';
import Summary from './screens/Summary';
import Home from './screens/Home';
import Calendar from './screens/Calendar';
import DailyLog from './screens/DailyLog';
import Insights from './screens/Insights';
import Advice from './screens/Advice';
import Community from './screens/Community';
import CreatePost from './screens/CreatePost';
import Profile from './screens/Profile';
import AIChat from './screens/AIChat';
import Admin from './screens/Admin';

export default function App() {
  // Admin route: visit /#/admin to access the internal ops dashboard.
  // Kept deliberately simple — the app uses state-based routing elsewhere,
  // and treating /admin as a parallel surface keeps it out of the tab flow.
  const [adminMode, setAdminMode] = useState(() => window.location.hash === '#/admin');
  useEffect(() => {
    const onHash = () => setAdminMode(window.location.hash === '#/admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  if (adminMode) return <Admin />;

  // ─── Global State ─────────────────────────────
  const [screen, setScreen] = useState('onboarding');
  const [prevScreen, setPrevScreen] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  // Onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState({});

  // Logging
  const [loggedDays, setLoggedDays] = useState({});
  const [currentLog, setCurrentLog] = useState({ moods: [], symptoms: [], notes: '' });
  const [logSaved, setLogSaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Community
  const [communityPosts, setCommunityPosts] = useState(COMMUNITY_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [newPostPhoto, setNewPostPhoto] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [reportPost, setReportPost] = useState(null);

  // AI Chat
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: AI_RESPONSES.default },
  ]);
  const [chatInput, setChatInput] = useState('');

  // ─── Sync to BFF (fire-and-forget) ────────────
  // We don't block the UI on these — they fail silently when the BFF is offline.
  useEffect(() => {
    if (Object.keys(onboardingAnswers).length) {
      saveProfile({ userId: DEMO_USER_ID, profile: onboardingAnswers }).catch(() => {});
    }
  }, [onboardingAnswers]);

  useEffect(() => {
    // Push every logged day to the BFF so the Agent's tools can read it.
    Object.entries(loggedDays).forEach(([key, log]) => {
      const [y, m, d] = key.split('-').map(Number);
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      saveDailyLog({
        userId: DEMO_USER_ID,
        logDate: iso,
        moods: log.moods || [],
        symptoms: log.symptoms || [],
        notes: log.notes || '',
      }).catch(() => {});
    });
  }, [loggedDays]);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Compute cycle day and next period from lastPeriodStart answer
  let cycleDay = 18;
  let nextPeriod = 'Jun 3';
  const lastPeriodStart = onboardingAnswers.lastPeriodStart || null;

  if (lastPeriodStart) {
    const lastStart = new Date(lastPeriodStart + 'T00:00:00');
    const diffDays = Math.floor((today - lastStart) / 86400000);
    cycleDay = Math.max(1, (diffDays % 28) + 1);

    // Walk forward in 28-day steps until we find the next period date after today
    let nextDate = new Date(lastStart);
    nextDate.setDate(nextDate.getDate() + 28);
    while (nextDate <= today) nextDate.setDate(nextDate.getDate() + 28);
    nextPeriod = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  const totalLogs = Object.keys(loggedDays).length;

  // ─── Navigation ───────────────────────────────
  const navigate = useCallback((s) => {
    setPrevScreen(screen);
    setScreen(s);
    setAnimKey((k) => k + 1);
  }, [screen]);

  // ─── Tab Bar ──────────────────────────────────
  const showTabs = !['onboarding', 'log', 'createPost', 'advice'].includes(screen);

  const renderTabBar = () => {
    if (!showTabs || screen === 'onboarding') return null;
    const tabs = [
      { id: 'home', icon: '🏠', label: 'Home' },
      { id: 'calendar', icon: '📅', label: 'Calendar' },
      { id: 'insights', icon: '📊', label: 'Insights' },
      { id: 'community', icon: '💬', label: 'Community' },
      { id: 'aiChat', icon: '🤖', label: 'Luna AI' },
    ];
    return (
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${screen === tab.id ? 'active' : ''}`}
            onClick={() => navigate(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // ─── Report Modal ─────────────────────────────
  const renderReportModal = () => {
    if (!reportPost) return null;
    return (
      <div className="report-modal" onClick={() => setReportPost(null)}>
        <div className="report-sheet" onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>
            Report Content
          </h3>
          {['Harmful or abusive', 'Misinformation', 'Spam', 'Inappropriate content', 'Other'].map((reason) => (
            <button
              key={reason}
              className="report-option"
              onClick={() => setReportPost(null)}
            >
              {reason}
            </button>
          ))}
          <button className="report-cancel" onClick={() => setReportPost(null)}>Cancel</button>
        </div>
      </div>
    );
  };

  // ─── Screen Router ────────────────────────────
  const renderScreen = () => {
    const commonProps = { navigate, animKey };

    switch (screen) {
      case 'onboarding':
        if (onboardingStep >= ONBOARDING_QUESTIONS.length) {
          return (
            <Summary
              {...commonProps}
              answers={onboardingAnswers}
            />
          );
        }
        return (
          <Onboarding
            step={onboardingStep}
            setStep={setOnboardingStep}
            answers={onboardingAnswers}
            setAnswers={setOnboardingAnswers}
          />
        );

      case 'home':
        return (
          <Home
            {...commonProps}
            today={today}
            cycleDay={cycleDay}
            nextPeriod={nextPeriod}
            loggedDays={loggedDays}
            todayKey={todayKey}
            totalLogs={totalLogs}
            setSelectedDate={setSelectedDate}
            setCurrentLog={setCurrentLog}
            setLogSaved={setLogSaved}
          />
        );

      case 'calendar':
        return (
          <Calendar
            {...commonProps}
            today={today}
            loggedDays={loggedDays}
            setSelectedDate={setSelectedDate}
            setCurrentLog={setCurrentLog}
            setLogSaved={setLogSaved}
            lastPeriodStart={lastPeriodStart}
          />
        );

      case 'log':
        return (
          <DailyLog
            {...commonProps}
            selectedDate={selectedDate}
            currentLog={currentLog}
            setCurrentLog={setCurrentLog}
            logSaved={logSaved}
            setLogSaved={setLogSaved}
            setLoggedDays={setLoggedDays}
            prevScreen={prevScreen}
          />
        );

      case 'insights':
        return (
          <Insights
            {...commonProps}
            totalLogs={totalLogs}
          />
        );

      case 'advice':
        return (
          <Advice
            {...commonProps}
            answers={onboardingAnswers}
          />
        );

      case 'community':
        return (
          <Community
            {...commonProps}
            posts={communityPosts}
            likedPosts={likedPosts}
            setLikedPosts={setLikedPosts}
            setReportPost={setReportPost}
            setCommunityPosts={setCommunityPosts}
          />
        );

      case 'createPost':
        return (
          <CreatePost
            {...commonProps}
            text={newPostText}
            setText={setNewPostText}
            photo={newPostPhoto}
            setPhoto={setNewPostPhoto}
            showImagePicker={showImagePicker}
            setShowImagePicker={setShowImagePicker}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            setCommunityPosts={setCommunityPosts}
          />
        );

      case 'profile':
        return (
          <Profile
            {...commonProps}
            answers={onboardingAnswers}
            setAnswers={setOnboardingAnswers}
            totalLogs={totalLogs}
          />
        );

      case 'aiChat':
        return (
          <AIChat
            {...commonProps}
            messages={chatMessages}
            setMessages={setChatMessages}
            input={chatInput}
            setInput={setChatInput}
          />
        );

      default:
        return (
          <Home
            {...commonProps}
            today={today}
            cycleDay={cycleDay}
            nextPeriod={nextPeriod}
            loggedDays={loggedDays}
            todayKey={todayKey}
            totalLogs={totalLogs}
            setSelectedDate={setSelectedDate}
            setCurrentLog={setCurrentLog}
            setLogSaved={setLogSaved}
          />
        );
    }
  };

  return (
    <div className="lunara-app">
      <div className="screen">
        {renderScreen()}
      </div>
      {renderTabBar()}
      {renderReportModal()}
    </div>
  );
}
