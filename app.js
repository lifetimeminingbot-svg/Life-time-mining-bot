(function() {
  "use strict";

  /* ============================================================
     TRANSLATIONS (I18N)
     ============================================================ */
  const i18n = {
    en: {
      app_title: "LIFE TIME MINING", app_sub: "QUANTUM PLATFORM",
      sign_in: "Sign In", sign_up: "Sign Up", email: "Email", password: "Password", full_name: "Full Name", create_account: "Create Account",
      forgot_pass: "Forgot Password?", main_balance: "Main Balance", hash_power: "Hash Power", unclaimed: "Unclaimed Mining", claim_now: "CLAIM NOW",
      daily_bonus: "🎁 4-Day Bonus — $0.10 / day", claim_daily: "Claim Daily $0.10", leaderboard: "🏆 Top Miners",
      available_balance: "Available Balance", deposit: "📥 Deposit", withdraw: "📤 Withdraw", my_requests: "📋 Recent Requests",
      total_bal: "Total Balance", total_hp: "Total HP", ref_prog: "🎁 Referral Program", ref_desc: "0.05 HP bonus per referral!",
      copy_ref: "📋 Copy Referral Link", refs: "Referrals", hp_earned: "HP Earned", history: "📜 Transaction History",
      nav_home: "Mining", nav_wallet: "Wallet", nav_profile: "Account", nav_history: "History",
      deposit_usdt: "Deposit USDT", select_network: "Select Network", address: "Address", copy: "Copy",
      amount_min_1: "Amount (Min $1.00)", txid: "Transaction Hash (TxID)", submit: "Submit", cancel: "Cancel",
      withdraw_uid: "Withdraw via Binance UID", binance_uid: "Your Binance UID", amount_min_010: "Amount (Min $0.10)", confirm: "Confirm Withdrawal",
      settings: "⚙️ Settings & Support", language: "🌐 Language", support: "📞 Support", logout: "🚪 Log Out", close: "Close"
    },
    bn: {
      app_title: "লাইফ টাইম মাইনিং", app_sub: "কোয়ান্টাম প্ল্যাটফর্ম",
      sign_in: "সাইন ইন", sign_up: "সাইন আপ", email: "ইমেইল", password: "পাসওয়ার্ড", full_name: "পুরো নাম", create_account: "অ্যাকাউন্ট তৈরি করুন",
      forgot_pass: "পাসওয়ার্ড ভুলে গেছেন?", main_balance: "মূল ব্যালেন্স", hash_power: "হ্যাশ পাওয়ার", unclaimed: "আনক্লেইমড মাইনিং", claim_now: "ক্লেইম করুন",
      daily_bonus: "🎁 ৪ দিনের বোনাস — $০.১০ / দিন", claim_daily: "দৈনিক $০.১০ ক্লেইম করুন", leaderboard: "🏆 টপ মাইনার",
      available_balance: "উপলব্ধ ব্যালেন্স", deposit: "📥 ডিপোজিট", withdraw: "📤 উইথড্র", my_requests: "📋 সাম্প্রতিক রিকোয়েস্ট",
      total_bal: "মোট ব্যালেন্স", total_hp: "মোট HP", ref_prog: "🎁 রেফারেল প্রোগ্রাম", ref_desc: "প্রতি রেফারেলে ০.০৫ HP বোনাস!",
      copy_ref: "📋 রেফারেল লিংক কপি করুন", refs: "রেফারেল", hp_earned: "অর্জিত HP", history: "📜 লেনদেনের ইতিহাস",
      nav_home: "মাইনিং", nav_wallet: "ওয়ালেট", nav_profile: "অ্যাকাউন্ট", nav_history: "হিস্ট্রি",
      deposit_usdt: "USDT ডিপোজিট", select_network: "নেটওয়ার্ক নির্বাচন করুন", address: "অ্যাড্রেস", copy: "কপি",
      amount_min_1: "পরিমাণ (সর্বনিম্ন $১.০০)", txid: "ট্রানজেকশন হ্যাশ (TxID)", submit: "সাবমিট", cancel: "বাতিল",
      withdraw_uid: "বাইন্যান্স UID দিয়ে উইথড্র", binance_uid: "আপনার বাইন্যান্স UID", amount_min_010: "পরিমাণ (সর্বনিম্ন $০.১০)", confirm: "উইথড্র নিশ্চিত করুন",
      settings: "⚙️ সেটিংস এবং সাপোর্ট", language: "🌐 ভাষা", support: "📞 সাপোর্ট", logout: "🚪 লগ আউট", close: "বন্ধ করুন"
    }
  };

  let currentLang = localStorage.getItem('ltm_lang') || 'en';

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ltm_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[lang] && i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.getElementById('langSelect').value = lang;
    renderLeaderboard();
  }

  /* ============================================================
     SECURITY & CRYPTO FIXES (XSS & HASHING)
     ============================================================ */
  const APP_SALT = 'LTM_2024_SECURE_9X2_PV';
  const REF_BONUS = 0.05;
  const BONUS_SCHEDULE = [0.10, 0.10, 0.10, 0.10];
  const RATE_PER_HP_DAY = 1/54;

  // XSS Protection: Escape HTML characters
  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Password Hashing (SHA-256) using Web Crypto API
  async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password + APP_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function simpleHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
  function deviceFP(){try{const p=[navigator.userAgent||'',navigator.language||'',screen.width,screen.height,screen.colorDepth,new Date().getTimezoneOffset()];return simpleHash(p.join('|'));}catch(e){return 'fp_unknown';}}
  const DEV_FP=deviceFP();
  function emailHash(email){return simpleHash(((email||'guest').toLowerCase())+'::'+DEV_FP);}
  function encKeyFor(email){return 'K'+simpleHash(emailHash(email)+APP_SALT+'::ek');}
  function xorStr(str,key){let out='';for(let i=0;i<str.length;i++)out+=String.fromCharCode(str.charCodeAt(i)^key.charCodeAt(i%key.length));return out;}
  function encryptObj(obj,email){try{const json=JSON.stringify(obj);const bytes=new TextEncoder().encode(json);let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(xorStr(s,encKeyFor(email)));}catch(e){return null;}}
  function decryptObj(b64,email){try{const xored=atob(b64);const un=xorStr(xored,encKeyFor(email));const bytes=new Uint8Array(un.length);for(let i=0;i<un.length;i++)bytes[i]=un.charCodeAt(i);return JSON.parse(new TextDecoder().decode(bytes));}catch(e){return null;}}
  function integrityOf(data,email){const sec=APP_SALT+'::'+emailHash(email);const raw=[data.balance||0,data.hp||0,data.unclaimed||0,data.bonusStreak||0,data.bonusTime||0].join('|');return simpleHash(raw+sec);}
  function userStorageKey(email){return '__ltm_'+emailHash(email);}

  /* ============================================================
     STATE
     ============================================================ */
  let userProfile = null;
  let balance = 0, hp = 0, unclaimed = 0, bonusStreak = 0, lastBonusTime = 0;
  let historyLogs = [];
  let currentDepositNetwork = 'BEP20';

  function saveState(){
    if(!userProfile || !userProfile.email) return;
    const payload = {balance, hp, unclaimed, bonusStreak, bonusTime: lastBonusTime, historyLogs, savedAt: Date.now(), integrity: ''};
    payload.integrity = integrityOf(payload, userProfile.email);
    const enc = encryptObj(payload, userProfile.email);
    if(enc) localStorage.setItem(userStorageKey(userProfile.email), enc);
  }

  function loadState(){
    if(!userProfile || !userProfile.email){balance=0;hp=0;unclaimed=0;bonusStreak=0;lastBonusTime=0;historyLogs=[];return;}
    const enc = localStorage.getItem(userStorageKey(userProfile.email));
    if(!enc){balance=0;hp=0;unclaimed=0;bonusStreak=0;lastBonusTime=0;historyLogs=[];return;}
    const p = decryptObj(enc, userProfile.email);
    if(!p || p.integrity !== integrityOf(p, userProfile.email)){balance=0;hp=0;unclaimed=0;bonusStreak=0;lastBonusTime=0;historyLogs=[];return;}
    balance = p.balance || 0;
    hp = p.hp || 0;
    unclaimed = p.unclaimed || 0;
    bonusStreak = p.bonusStreak || 0;
    lastBonusTime = p.bonusTime || 0;
    historyLogs = Array.isArray(p.historyLogs) ? p.historyLogs : [];
  }

  function getAccounts(){try{return JSON.parse(localStorage.getItem('__ltm_accounts')||'[]');}catch(e){return [];}}
  function saveAccounts(list){localStorage.setItem('__ltm_accounts',JSON.stringify(list));}

  /* ============================================================
     AUTH & LOGIN (UPDATED FOR ASYNC HASHING)
     ============================================================ */
  function switchAuthTab(tab){
    document.getElementById('tabSignIn').classList.toggle('active', tab==='signin');
    document.getElementById('tabSignUp').classList.toggle('active', tab==='signup');
    document.getElementById('signinForm').style.display = tab==='signin'?'block':'none';
    
    const signupForm = document.getElementById('signupForm');
    if (tab === 'signup') {
      signupForm.classList.remove('hidden');
      signupForm.style.display = 'block';
    } else {
      signupForm.classList.add('hidden');
      signupForm.style.display = 'none';
    }
  }

  async function doSignUp(){
    const name = document.getElementById('suName').value.trim();
    const email = document.getElementById('suEmail').value.trim().toLowerCase();
    const pass = document.getElementById('suPass').value;

    if(!name || !email || !pass) return toast('Fill all fields');
    if(pass.length < 6) return toast('Password must be 6+ chars');

    const accounts = getAccounts();
    if(accounts.find(a => a.email === email)) return toast('Email already registered');

    const avatarSeed = Math.random().toString(36).substring(7);
    const hashedPass = await hashPassword(pass); // HASHING PASSWORD
    
    accounts.push({email, name, passHash: hashedPass, avatarSeed, joinedAt: new Date().toISOString()});
    saveAccounts(accounts);

    loginUser(email, name, avatarSeed);
    popupNotify('Welcome!', 'Your account has been created successfully.');
  }

  async function doSignIn(){
    const email = document.getElementById('siEmail').value.trim().toLowerCase();
    const pass = document.getElementById('siPass').value;
    if(!email || !pass) return toast('Fill email & password');

    const accounts = getAccounts();
    const acc = accounts.find(a => a.email === email);
    if(!acc) return toast('Account not found');
    
    // Check hashed password
    const hashedPass = await hashPassword(pass);
    if(acc.passHash !== hashedPass) return toast('Incorrect password');

    loginUser(acc.email, acc.name, acc.avatarSeed);
  }

  function googleLogin() {
    const email = prompt("Enter your registered Gmail address to login:");
    if(!email) return;
    const accounts = getAccounts();
    const acc = accounts.find(a => a.email === email.trim().toLowerCase());
    if(!acc) return toast('Email not found. Please Sign Up.');
    
    loginUser(acc.email, acc.name, acc.avatarSeed);
    toast('Logged in via Gmail');
  }

  async function forgotPassword() {
    const email = prompt("Enter your email to reset password:");
    if(!email) return;
    const accounts = getAccounts();
    const acc = accounts.find(a => a.email === email.trim().toLowerCase());
    if(!acc) return toast('Email not found');
    
    const newPass = prompt("Enter new password:");
    if(!newPass || newPass.length < 6) return toast('Password too short');
    
    acc.passHash = await hashPassword(newPass);
    saveAccounts(accounts);
    toast('Password reset successfully. Please login.');
  }

  function loginUser(email, name, avatarSeed) {
    userProfile = {email, name, avatarSeed};
    localStorage.setItem('ltm_profile', JSON.stringify(userProfile));
    loadState();
    showApp();
  }

  function doLogout(){
    saveState();
    localStorage.removeItem('ltm_profile');
    userProfile = null;
    balance = 0; hp = 0; unclaimed = 0; historyLogs = [];
    
    document.getElementById('settingsModal').classList.remove('active');
    switchAuthTab('signin');
    showAuth();
    
    // Force scroll to top
    document.getElementById('pagesWrapper').scrollTop = 0;
    toast('Logged out successfully');
  }

  function showApp(){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-home').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.getElementById('nav-home').classList.add('active');
    updateUI();
  }

  function showAuth(){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-auth').classList.add('active');
  }

  function changeAvatar(){
    if(!userProfile) return;
    const accounts = getAccounts();
    const acc = accounts.find(a => a.email === userProfile.email);
    if(acc){
      acc.avatarSeed = Math.random().toString(36).substring(7);
      userProfile.avatarSeed = acc.avatarSeed;
      saveAccounts(accounts);
      localStorage.setItem('ltm_profile', JSON.stringify(userProfile));
      updateProfileUI();
      toast('Avatar updated!');
    }
  }

  /* ============================================================
     UI & NAVIGATION
     ============================================================ */
  function navigate(p){
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.getElementById('page-'+p).classList.add('active');
    document.getElementById('nav-'+p).classList.add('active');
    if(p==='wallet') renderRequests();
    document.getElementById('pagesWrapper').scrollTop = 0;
  }

  function updateProfileUI(){
    if(!userProfile) return;
    document.getElementById('dispName').textContent = userProfile.name;
    document.getElementById('dispEmail').textContent = userProfile.email;
    document.getElementById('userAvatar').src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${userProfile.avatarSeed}`;
    document.getElementById('profTotalBalance').textContent = '$' + (balance + unclaimed).toFixed(4);
    document.getElementById('profTotalHP').textContent = hp.toFixed(2);
    
    let lvl = "VIP 1";
    if(hp >= 10) lvl = "VIP 2";
    if(hp >= 50) lvl = "VIP 3";
    if(hp >= 100) lvl = "VIP 4";
    if(hp >= 500) lvl = "PLATINUM";
    document.getElementById('userLevel').textContent = lvl;

    const eh = emailHash(userProfile.email);
    let cnt = parseInt(localStorage.getItem('__ltm_pc_'+eh) || '0');
    document.getElementById('refCountDisplay').textContent = cnt;
    document.getElementById('refHPDisplay').textContent = (cnt*REF_BONUS).toFixed(2);
    document.getElementById('myRefCode').textContent = getMyCode();
  }

  function updateUI(){
    document.getElementById('userBalance').textContent = balance.toFixed(6);
    document.getElementById('walletBalance').textContent = balance.toFixed(4);
    document.getElementById('unclaimedBal').textContent = unclaimed.toFixed(6);
    document.getElementById('userHP').textContent = hp.toFixed(2);
    updateProfileUI();
    renderHistory();
    renderLeaderboard();
  }

  /* ============================================================
     LEADERBOARD (UPDATED FOR XSS PROTECTION)
     ============================================================ */
  function renderLeaderboard() {
    const el = document.getElementById('leaderboard');
    
    let fakeUsers = JSON.parse(localStorage.getItem('__ltm_fake_lb') || '[]');
    if (fakeUsers.length === 0) {
      const names = ['CryptoKing', 'Alpha01', 'MinerX', 'Satoshi_Jr', 'MoonBoy', 'EthWhale', 'Bob_Marley', 'Quantum1', 'Neo_Miner', 'Trinity'];
      for (let i = 0; i < 5; i++) {
        fakeUsers.push({ name: names[Math.floor(Math.random()*names.length)] + Math.floor(Math.random()*99), balance: (Math.random() * 50 + 1).toFixed(2) });
      }
      localStorage.setItem('__ltm_fake_lb', JSON.stringify(fakeUsers));
    }

    const accounts = getAccounts();
    let allUsers = [...fakeUsers];
    
    accounts.forEach(a => {
      const enc = localStorage.getItem(userStorageKey(a.email));
      if(enc) {
        const d = decryptObj(enc, a.email);
        if(d && d.integrity === integrityOf(d, a.email)) {
          allUsers.push({ name: a.name, balance: (d.balance + d.unclaimed).toFixed(2) });
        }
      }
    });

    allUsers.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    const top3 = allUsers.slice(0, 3);

    el.innerHTML = top3.map((u, i) => {
      const medals = ['🥇', '🥈', '🥉'];
      // XSS FIX: Used escapeHTML
      return `
        <div class="lb-item">
          <div class="lb-left">
            <div class="lb-rank-icon">${medals[i]}</div>
            <div class="lb-user">${escapeHTML(u.name)}</div>
          </div>
          <div class="lb-amount">$${u.balance}</div>
        </div>
      `;
    }).join('');
  }

  /* ============================================================
     MINING & LOGIC
     ============================================================ */
  function claimEarnings(){
    if(unclaimed <= 0) return toast('Nothing to claim');
    const amt = unclaimed;
    balance += amt;
    unclaimed = 0;
    saveState();
    addHistory('Mining Claimed', amt);
    updateUI();
    popupNotify('Mining Claimed!', `Added $${amt.toFixed(4)} to your main balance.`);
  }

  function renderBonusGrid(){
    const g = document.getElementById('bonusGrid');
    g.innerHTML = '';
    BONUS_SCHEDULE.forEach((v,i)=>{
      const active = (i === bonusStreak % BONUS_SCHEDULE.length && bonusStreak < BONUS_SCHEDULE.length);
      g.innerHTML += `<div class="bonus-day-box ${active ? 'active' : ''}">
        Day ${i+1}<br>$${v.toFixed(2)}
      </div>`;
    });
  }

  function claimBonus(){
    const now = Date.now();
    if(now - lastBonusTime < 86400000) return toast('Next bonus in 24h');
    if(bonusStreak >= BONUS_SCHEDULE.length) bonusStreak = 0;
    const r = BONUS_SCHEDULE[bonusStreak];
    balance += r;
    bonusStreak++;
    lastBonusTime = now;
    saveState();
    addHistory('Daily Bonus', r);
    renderBonusGrid();
    updateUI();
    popupNotify('Bonus Claimed', `You received $${r.toFixed(2)} daily bonus.`);
  }

  function getMyCode(){
    if(!userProfile) return '';
    let c = localStorage.getItem('__ltm_code_'+userProfile.email);
    if(!c){
      c = Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('__ltm_code_'+userProfile.email, c);
    }
    return c;
  }

  function copyReferral(){
    const link = location.origin + location.pathname + '?ref=' + getMyCode();
    navigator.clipboard.writeText(link).then(()=>toast('Link copied!'));
  }

  /* ============================================================
     DEPOSIT & WITHDRAW
     ============================================================ */
  const NETWORKS = {
    'BEP20': '0x7795d382b060571c48f7b2691e73a964de76d494',
    'TRC20': 'TNbUoTaarVX9cXEgdxCTh7YqLbPraTRJ6G',
    'ERC20': '0x7795d382b060571c48f7b2691e73a964de76d494',
    'SOL': 'BoKZEJn184gaWg9zdbRhy1ajddsjdtyQRR6L8WhV4cpB',
    'TON': 'UQBdXHBulkp-N5a00Ea_h5VnaclWJrkcFehVKwPEBgM6_ggN',
    'APT': '0x9e2875ee169b6f16777c54d9955607dfcb2e4d7c121ec18cc4b0b5e82d403b40'
  };

  function selectNetwork(net, event){
    document.querySelectorAll('.net-btn').forEach(b=>b.classList.remove('active'));
    event.target.classList.add('active');
    currentDepositNetwork = net;
    document.getElementById('depAddr').value = NETWORKS[net];
    document.getElementById('selectedNetLabel').textContent = `(${net})`;
  }

  function copyDepositAddress(){
    const addr = document.getElementById('depAddr').value;
    navigator.clipboard.writeText(addr).then(()=>toast('Address Copied!'));
  }

  function openDepositModal(){
    currentDepositNetwork = 'BEP20';
    document.getElementById('depAddr').value = NETWORKS['BEP20'];
    document.getElementById('selectedNetLabel').textContent = '(BEP20)';
    document.querySelectorAll('.net-btn').forEach((b,i)=>b.classList.toggle('active', i===0));
    document.getElementById('depModal').classList.add('active');
  }

  function submitDeposit(){
    const amt = parseFloat(document.getElementById('depAmtInput').value);
    const tx = document.getElementById('depTxInput').value.trim();
    if(isNaN(amt) || amt < 1) return toast('Minimum deposit is $1.00');
    if(!tx) return toast('Enter TxID');

    const deps = JSON.parse(localStorage.getItem('admin_deposit_requests')||'[]');
    deps.push({id: Date.now(), amount: amt, txId: tx, network: currentDepositNetwork, userEmail: userProfile.email, userName: userProfile.name, time: new Date().toLocaleString(), status: 'Pending'});
    localStorage.setItem('admin_deposit_requests', JSON.stringify(deps));
    
    document.getElementById('depModal').classList.remove('active');
    popupNotify('Deposit Sent', `$${amt.toFixed(2)} via ${currentDepositNetwork} is pending approval.`);
    renderRequests();
  }

  function openWithdrawModal(){ document.getElementById('wdModal').classList.add('active'); }

  function submitWithdrawal(){
    const uid = document.getElementById('wdUidInput').value.trim();
    const amt = parseFloat(document.getElementById('wdAmountInput').value);
    
    if(!uid) return toast('Enter Binance UID');
    if(isNaN(amt) || amt < 0.10) return toast('Minimum withdrawal is $0.10');
    if(balance < amt) return toast('Insufficient balance');

    balance -= amt;
    saveState();

    const reqs = JSON.parse(localStorage.getItem('admin_withdraw_requests')||'[]');
    reqs.push({id: Date.now(), amount: amt, uid: uid, userEmail: userProfile.email, userName: userProfile.name, time: new Date().toLocaleString(), status: 'Pending'});
    localStorage.setItem('admin_withdraw_requests', JSON.stringify(reqs));
    
    addHistory(`Withdraw $${amt.toFixed(2)} (UID)`, -amt);
    document.getElementById('wdModal').classList.remove('active');
    updateUI();
    popupNotify('Withdraw Requested', `$${amt.toFixed(2)} held for approval to UID: ${uid}`);
    renderRequests();
  }

  function renderRequests(){
    const el = document.getElementById('requestList');
    if(!userProfile) return;

    const deps = JSON.parse(localStorage.getItem('admin_deposit_requests')||'[]').filter(d => d.userEmail === userProfile.email);
    const wds = JSON.parse(localStorage.getItem('admin_withdraw_requests')||'[]').filter(w => w.userEmail === userProfile.email);
    
    let all = [...deps.map(d=>({...d, type:'Deposit', extra: d.network})), ...wds.map(w=>({...w, type:'Withdraw', extra: 'UID: '+w.uid}))];
    all.sort((a,b)=>b.id - a.id);

    if(!all.length){
      el.innerHTML = '<p class="empty-state">No requests yet.</p>';
      return;
    }

    el.innerHTML = all.slice(0, 5).map(req => {
      let statusClass = req.status === 'Approved' ? 'status-approved' : (req.status === 'Rejected' ? 'status-rejected' : 'status-pending');
      let dispStatus = req.status === 'Approved' ? 'Completed' : req.status;
      // XSS FIX: Used escapeHTML
      return `
        <div class="request-item">
          <div>
            <div class="request-title">${escapeHTML(req.type)} - $${req.amount.toFixed(2)}</div>
            <div class="request-meta">${escapeHTML(req.extra)} | ${req.time.split(',')[0]}</div>
          </div>
          <div class="request-status ${statusClass}">${dispStatus}</div>
        </div>
      `;
    }).join('');
  }

  /* ============================================================
     UTILS: HISTORY & NOTIFICATION
     ============================================================ */
  function addHistory(type, amount){
    historyLogs.unshift({type, amount, time: new Date().toLocaleString()});
    if(historyLogs.length > 20) historyLogs.pop();
    saveState();
    renderHistory();
  }

  function renderHistory(){
    const el = document.getElementById('historyList');
    if(!historyLogs.length){
      el.innerHTML='<p class="empty-state-lg">No transactions yet.</p>';
      return;
    }
    el.innerHTML = historyLogs.map(it=>{
      const pos = it.amount > 0;
      let amtClass = pos ? 'amount-pos' : (it.amount < 0 ? 'amount-neg' : 'amount-neutral');
      // XSS FIX: Used escapeHTML
      return `
        <div class="history-item">
          <div>
            <div class="history-title">${escapeHTML(it.type)}</div>
            <div class="history-time">${it.time}</div>
          </div>
          <div class="history-amount ${amtClass}">${pos?'+':''}${it.amount===0?'—':Number(it.amount).toFixed(4)}</div>
        </div>
      `;
    }).join('');
  }

  let toastT;
  function toast(msg){
    const t=document.getElementById('toast');
    t.textContent=msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT=setTimeout(()=>t.classList.remove('show'),2500);
  }

  let notifyT;
  function popupNotify(title, body) {
    document.getElementById('notifyTitle').textContent = title;
    document.getElementById('notifyBody').textContent = body;
    const overlay = document.getElementById('notifyOverlay');
    overlay.classList.add('active');
    clearTimeout(notifyT);
    notifyT = setTimeout(() => { overlay.classList.remove('active'); }, 4000);
  }

  function openSettingsModal(){
    if(!userProfile) return toast('Login first');
    document.getElementById('settingsModal').classList.add('active');
  }

  /* ============================================================
     INIT
     ============================================================ */
  window.Telegram?.WebApp?.ready();
  window.Telegram?.WebApp?.expand();

  function init(){
    setLanguage(currentLang);
    try{ userProfile = JSON.parse(localStorage.getItem('ltm_profile')||'null'); }catch(e){ userProfile = null; }

    if(userProfile && userProfile.email){
      loadState();
      showApp();
    } else {
      showAuth();
    }

    setInterval(()=>{
      if(hp > 0 && userProfile){
        unclaimed += (hp * RATE_PER_HP_DAY) / 86400;
        document.getElementById('unclaimedBal').textContent = unclaimed.toFixed(6);
      }
    }, 1000);

    setInterval(()=>{ if(userProfile) saveState(); }, 5000);

    setInterval(()=>{
      if(!userProfile) return;
      const enc = localStorage.getItem(userStorageKey(userProfile.email));
      if(enc) {
        const d = decryptObj(enc, userProfile.email);
        if(d && d.integrity === integrityOf(d, userProfile.email) && (d.adminUpdatedAt || 0) > (localStorage.getItem('ltm_last_seen') || 0)){
          localStorage.setItem('ltm_last_seen', d.adminUpdatedAt);
          loadState();
          updateUI();
        }
      }
      if(document.getElementById('page-wallet').classList.contains('active')){
        renderRequests();
      }
    }, 5000);
    
    renderBonusGrid();
  }

  window.onload = init;

  // Expose functions to global scope for HTML inline event listeners
  window.setLanguage = setLanguage;
  window.switchAuthTab = switchAuthTab;
  window.doSignUp = doSignUp;
  window.doSignIn = doSignIn;
  window.googleLogin = googleLogin;
  window.forgotPassword = forgotPassword;
  window.doLogout = doLogout;
  window.changeAvatar = changeAvatar;
  window.navigate = navigate;
  window.claimEarnings = claimEarnings;
  window.claimBonus = claimBonus;
  window.copyReferral = copyReferral;
  window.selectNetwork = selectNetwork;
  window.copyDepositAddress = copyDepositAddress;
  window.openDepositModal = openDepositModal;
  window.submitDeposit = submitDeposit;
  window.openWithdrawModal = openWithdrawModal;
  window.submitWithdrawal = submitWithdrawal;
  window.openSettingsModal = openSettingsModal;

})();
