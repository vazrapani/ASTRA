import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../config/firebase';

const NaverCallback: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      fetch('https://naverauthcallback-bvuu6lfroq-du.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
        credentials: 'omit',
        mode: 'cors',
      })
        .then(async res => {
          type NaverCallbackResponse = { customToken?: string; error?: string };
          let data: NaverCallbackResponse = {};
          try {
            data = await res.json();
          } catch (e) {}
          if (res.ok && data.customToken) {
            await signInWithCustomToken(auth, data.customToken);
            history.replace('/tabs');
          } else {
            alert('네이버 로그인 실패: ' + (data.error || res.status));
            history.replace('/auth/login');
          }
        })
        .catch(err => {
          alert('네이버 로그인 네트워크 오류: ' + err.message);
          history.replace('/auth/login');
        });
    }
  }, [history]);

  return <div>네이버 로그인 처리 중...</div>;
};

export default NaverCallback; 