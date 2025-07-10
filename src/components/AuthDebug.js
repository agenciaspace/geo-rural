import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthDebug = () => {
  const { user, session, loading, isAuthenticated } = useAuth();
  
  // Log para debug
  console.log('🔥 AuthDebug: user:', user);
  console.log('🔥 AuthDebug: session:', session);
  console.log('🔥 AuthDebug: isAuthenticated:', isAuthenticated);
  
  const savedSession = localStorage.getItem('grace_period_user_session');
  let parsedSession = null;
  try {
    parsedSession = savedSession ? JSON.parse(savedSession) : null;
  } catch (e) {
    parsedSession = null;
  }

  const grace = localStorage.getItem('grace_period_user');
  let graceInfo = null;
  try {
    graceInfo = grace ? JSON.parse(grace) : null;
  } catch (e) {
    graceInfo = null;
  }

  const emailConfirmed = !!user?.email_confirmed_at;
  let daysPassed = null;
  if (user?.created_at && !emailConfirmed) {
    const created = new Date(user.created_at);
    daysPassed = Math.floor((Date.now() - created.getTime()) / (1000*60*60*24));
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid red',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      borderRadius: '5px'
    }}>
      <h4>Auth Debug</h4>
      <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
      <div><strong>IsAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
      <div><strong>User ID:</strong> {user?.id || 'null'}</div>
      <div><strong>User Email:</strong> {user?.email || 'null'}</div>
      <div><strong>Email Confirmed:</strong> {emailConfirmed ? 'yes' : 'no'}</div>
      {!emailConfirmed && (
        <>
          <div><strong>Days Since Signup:</strong> {daysPassed}</div>
          <div><strong>Grace Info:</strong> {graceInfo ? `${graceInfo.startDate} → ${graceInfo.expiresAt}` : 'none'}</div>
        </>
      )}
      <div><strong>Created At:</strong> {user?.created_at}</div>
      <div><strong>Session:</strong> {session ? 'exists' : 'null'}</div>
      <div><strong>Session Token:</strong> {session?.access_token || 'null'}</div>
      <div><strong>Grace Session:</strong> {savedSession ? 'yes' : 'no'}</div>
      {parsedSession && (
        <>
          <div><strong>Grace Expires:</strong> {parsedSession.expiresAt}</div>
        </>
      )}
      <div><strong>Current URL:</strong> {window.location.pathname}</div>
    </div>
  );
};

export default AuthDebug;