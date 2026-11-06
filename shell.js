/* ==========================================================================
   shell.js — THE FULL MOCK TEST PAGE ("the shell")

   What it does, in order:
     1. the login (copied from Redrock: the same screen, the same SHA-256
        check against config.js);
     2. the home page: the three game cards from content/settings.js, only
        the next one can be started, finished ones are greyed "Completed";
     3. a game: the shell opens the game's own folder in a frame that fills
        the whole box (<folder>/index.html?shell=1). The game says it is
        ready, plays exactly as on its own, and at its last button sends its
        marked result here and shows "Saved". The shell hides the frame
        (kept, full size) and shows the home page again;
     4. after the third game: the combined results, the review of each game
        (that game's own results page, in its own kept frame) and the export.

   NOTHING IS STORED IN THE BROWSER. The results live in this page's memory
   only (plan D3). A refresh, or leaving the page, starts the sitting again,
   exactly as a refresh restarts every practice simulation. The home page
   says so, and offers "Download results so far" after each game.

   The shell works nothing out about marking. Every score, percentile and
   right/wrong comes from the game's own marking, inside its result. The
   shell only arranges them, averages the three percentiles (plan D5) and
   prints them.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.MOCK_SETTINGS;
  var app = document.getElementById('app');
  var framesHost = document.getElementById('frames');
  var REVIEW_BAR = 40;                                   /* px */
  var MIN_FRAME_HEIGHT = { 'rr-m1': 540, 'sw-m1': 562, 'sfl-m1': 540 };

  var state = {
    phase: 'login',              /* login | home | playing | results | review */
    loggedIn: false,
    loginUser: '',
    loginError: '',
    current: null,               /* index of the game being played or reviewed */
    exportShown: false,
    exportSaid: '',
    completedAt: null,           /* when the third game was finished */
    games: S.games.map(function (g) {
      return { id: g.id, folder: g.folder, title: g.title, minutes: g.minutes,
               frame: null, ready: false, error: null, result: null, finishedAt: null,
               reviewAsked: false };
    })
  };

  /* ====================================================================== *
   * SMALL HELPERS
   * ====================================================================== */
  function esc(text) {
    return String(text === null || text === undefined ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function byId(id) { return document.getElementById(id); }
  function isBlank(v) { return v === null || v === undefined || String(v).trim() === ''; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
           ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }
  function showScore(n) {
    if (typeof n !== 'number') return String(n);
    return (Math.round(n * 10) / 10 === Math.round(n)) ? String(Math.round(n))
                                                       : (Math.round(n * 10) / 10).toFixed(1);
  }
  function ordinal(n) {
    var tens = n % 100, ones = n % 10;
    if (tens >= 11 && tens <= 13) return 'th';
    return ones === 1 ? 'st' : ones === 2 ? 'nd' : ones === 3 ? 'rd' : 'th';
  }
  /* Content text as one plain line: no raised-text marks, no line breaks. */
  function plain(text) {
    return String(text === null || text === undefined ? '' : text)
      .replace(/\^\{([^}]*)\}/g, '^$1')
      .replace(/\{\{([^}]+)\}\}/g, '$1')
      .replace(/\s+/g, ' ').trim();
  }
  /* A long text cut at a word, for a row label. */
  function short(text, max) {
    var t = plain(text);
    if (t.length <= max) return t;
    var cut = t.lastIndexOf(' ', max);
    return t.slice(0, cut > max * 0.6 ? cut : max).replace(/[,;:.\s]+$/, '') + '…';
  }
  function gameById(id) {
    for (var i = 0; i < state.games.length; i++) if (state.games[i].id === id) return state.games[i];
    return null;
  }
  function nextIndex() {
    for (var i = 0; i < state.games.length; i++) if (!state.games[i].result) return i;
    return -1;
  }
  function doneCount() {
    return state.games.filter(function (g) { return !!g.result; }).length;
  }

  /* ====================================================================== *
   * THE LOGIN — Redrock's loginHtml() and attemptLogin(), copied
   * ====================================================================== */
  function loginHtml() {
    return '<div class="centre-screen"><div class="panel">' +
             '<h1>' + esc(S.title) + '</h1>' +
             '<p class="lede">Please sign in to begin.</p>' +
             '<form id="login-form">' +
               '<div class="field">' +
                 '<label for="login-user">Username</label>' +
                 '<input id="login-user" type="text" autocomplete="username" autocapitalize="off"' +
                   ' spellcheck="false" value="' + esc(state.loginUser || '') + '">' +
               '</div>' +
               '<div class="field">' +
                 '<label for="login-pass">Password</label>' +
                 '<input id="login-pass" type="password" autocomplete="current-password">' +
               '</div>' +
               '<div class="form-error" id="login-error">' + esc(state.loginError) + '</div>' +
               '<button class="btn" type="submit" style="width:100%">Log in</button>' +
             '</form>' +
           '</div></div>';
  }

  function toHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (b) {
      return ('00' + b.toString(16)).slice(-2);
    }).join('');
  }

  function attemptLogin(username, password) {
    state.loginUser = username;
    if (username !== CONFIG.username) {
      state.loginError = 'That username and password do not match.';
      render();
      return;
    }
    if (!window.crypto || !window.crypto.subtle) {
      state.loginError = 'Login needs the page to be opened over https.';
      render();
      return;
    }
    window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
      .then(function (digest) {
        if (toHex(digest) === String(CONFIG.passcodeHash).toLowerCase()) {
          state.loggedIn = true;
          state.loginError = '';
          state.phase = 'home';
        } else {
          state.loginError = 'That username and password do not match.';
        }
        render();
      })
      .catch(function () {
        state.loginError = 'Login needs the page to be opened over https.';
        render();
      });
  }

  /* ====================================================================== *
   * FULL SCREEN — the shell's own button, the same look as Redrock's
   * ====================================================================== */
  function canFullscreen() {
    return !!(document.documentElement.requestFullscreen && document.fullscreenEnabled);
  }
  function fullscreenIcon() {
    var on = !!document.fullscreenElement;
    return on
      ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
        'stroke-width="1.6"><path d="M6 1v5H1M10 15v-5h5"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
        'stroke-width="1.6"><path d="M1 6V1h5M15 10v5h-5"/></svg>';
  }
  function fullscreenButton() {
    return canFullscreen()
      ? '<button class="icon-btn" type="button" data-act="fullscreen" aria-label="Full screen" ' +
        'title="Full screen">' + fullscreenIcon() + '</button>'
      : '';
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () {});
    }
  }
  /* Fix round 1 (D37): the shell is the ONLY owner of full screen. A game's
     own full-screen button no longer calls full screen itself in the Mock
     Test: it sends "mock-fullscreen" here, and the shell puts its whole page
     in full screen (the click inside the frame counts for this page too).
     The shell then tells every game frame whether it is in full screen
     ("mock-fullscreen-state"), on every change (the button, Esc) and as soon
     as a game says it is ready, so each game's button shows the right icon.
     Because the full-screen element is always this page, nothing has to be
     handed over when a game ends, nothing flashes, and the review bar is
     never covered by a frame. */
  function sendFullscreenState(onlyTo) {
    var on = !!document.fullscreenElement;
    state.games.forEach(function (g) {
      if (!g.frame || !g.frame.contentWindow || (onlyTo && onlyTo !== g)) return;
      try { g.frame.contentWindow.postMessage({ type: 'mock-fullscreen-state', on: on }, location.origin); } catch (e) { /* nothing */ }
    });
  }

  /* Before fix round 1 a game's own full-screen button put its FRAME in full
     screen, and this took full screen over to the shell when that game ended.
     The games no longer do that in the Mock Test (see above), so this never
     finds a frame in full screen now; it stays only as a harmless fallback. */
  function keepFullscreenOnShell() {
    var el = document.fullscreenElement;
    if (!el || el.tagName !== 'IFRAME') return;
    var ask = document.documentElement.requestFullscreen
      ? document.documentElement.requestFullscreen() : null;
    if (ask && ask.catch) {
      ask.catch(function () { if (document.exitFullscreen) document.exitFullscreen().catch(function () {}); });
    }
  }
  document.addEventListener('fullscreenchange', function () {
    sendFullscreenState();                                         /* D37 */
    if (state.phase === 'home' || state.phase === 'results' || state.phase === 'review') render();
  });

  /* ====================================================================== *
   * THE GAME FRAMES
   * ====================================================================== */
  function openGame(index) {
    var g = state.games[index];
    if (g.result) return;                     /* no going back into a finished game */
    if (!g.frame) {
      var f = document.createElement('iframe');
      f.src = g.folder + '/index.html?shell=1';
      f.title = g.title;
      f.setAttribute('allowfullscreen', '');
      f.setAttribute('allow', 'fullscreen');
      f.setAttribute('style', 'border:0;display:block;width:100%;height:100%');
      f.setAttribute('data-game', g.id);
      framesHost.appendChild(f);
      g.frame = f;
    }
    state.current = index;
    state.phase = 'playing';
    render();
    try { g.frame.focus(); } catch (e) { /* nothing */ }
  }

  function dropFrame(g) {
    if (g.frame && g.frame.parentNode) g.frame.parentNode.removeChild(g.frame);
    g.frame = null;
    g.ready = false;
  }

  function layoutFrames() {
    var reviewing = state.phase === 'review' ? state.games[state.current] : null;
    state.games.forEach(function (g, i) {
      if (!g.frame) return;
      var visible = (state.phase === 'playing' && state.current === i) || (reviewing === g);
      g.frame.classList.toggle('is-visible', visible);
      if (reviewing === g) {
        var h = Math.max(window.innerHeight - REVIEW_BAR, MIN_FRAME_HEIGHT[g.id] || 540);
        g.frame.style.top = REVIEW_BAR + 'px';
        g.frame.style.height = h + 'px';
      } else {
        g.frame.style.top = '0px';
        g.frame.style.height = '100%';
      }
    });
    if (reviewing) {
      /* If the window is too short for the game below the bar, the page
         scrolls rather than squeezing the game below its smallest size. */
      var total = REVIEW_BAR + Math.max(window.innerHeight - REVIEW_BAR, MIN_FRAME_HEIGHT[reviewing.id] || 540);
      framesHost.style.position = 'absolute';
      framesHost.style.height = total + 'px';
      framesHost.style.bottom = 'auto';
    } else {
      framesHost.style.position = '';
      framesHost.style.height = '';
      framesHost.style.bottom = '';
    }
  }
  window.addEventListener('resize', function () { if (state.phase === 'review') layoutFrames(); });

  /* Messages from the games. Accepted only from this same address and from
     the frame of the game it names (plan D18). */
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin) return;
    var data = event.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;
    var g = gameById(data.game);
    if (!g || !g.frame || event.source !== g.frame.contentWindow) return;

    if (data.type === 'mock-ready') {
      g.ready = true;
      try { event.source.postMessage({ type: 'mock-ack' }, location.origin); } catch (e) { /* nothing */ }
      sendFullscreenState(g);                                      /* D37: the game's button starts right */
      return;
    }
    if (data.type === 'mock-fullscreen') {                         /* D37: a game's full-screen button */
      toggleFullscreen();
      return;
    }
    if (data.type === 'mock-game-finished') {
      if (g.result) return;                   /* only once */
      g.result = data;
      g.finishedAt = new Date();
      g.error = null;
      keepFullscreenOnShell();
      if (doneCount() === state.games.length) {
        state.completedAt = g.finishedAt;
        state.phase = 'results';
      } else {
        state.phase = 'home';
      }
      render();
      return;
    }
    if (data.type === 'mock-error') {
      if (g.result) return;
      g.error = (data.errors && data.errors.length) ? data.errors.map(String) : ['The game could not start.'];
      keepFullscreenOnShell();
      state.phase = 'home';
      render();
    }
  });

  /* Leaving the page loses everything (plan D3), so the browser is asked to
     warn. Whether the warning shows inside the lesson's frame is up to the
     browser; see the delivery note. */
  /* D38: some browsers treat a click on a mail link as leaving the page and
     would show "Leave the Mock Test?" although the page stays. For one second
     after "Email us your results" is clicked the warning is not asked for. */
  var mailingUntil = 0;
  window.addEventListener('beforeunload', function (event) {
    if (!state.loggedIn) return;
    if (Date.now() < mailingUntil) return;
    event.preventDefault();
    event.returnValue = 'Leave the Mock Test? Nothing is saved.';
    return event.returnValue;
  });

  /* ====================================================================== *
   * WHAT EACH GAME'S RESULT SAYS — one summary per game, used by both the
   * results page and the export, so the two always agree.
   *
   * A summary: { score, of, weighted, percentile, limitSeconds, leftSeconds,
   *   minutesUsed, ranOut, late, phases: [{ name, scoreText, timeText,
   *   score, of, extra }],
   *   rows: [{ where, what, tag, state, points, detail, late }] }
   * ====================================================================== */

  function labelsOf(skills) {
    var map = {};
    ((skills && skills.list) || []).forEach(function (s) { map[s.id] = s.label; });
    return map;
  }
  function tagLabel(map, id) {
    return (id && map[id]) ? map[id] : '(untagged)';
  }
  /* A phase's time from two clock readings (seconds left at its start and
     at its end). `clamps` = this game's clock stops at 0 (Redrock), so after
     time ran out the reading says nothing and the wall clock is used. */
  function phaseTime(a, b, clamps) {
    if (!a || !b) return 'time not recorded';
    var s = a.secondsLeft - b.secondsLeft;
    if (clamps && a.secondsLeft <= 0) {
      var wall = minutesText((b.at - a.at) / 1000);
      return (wall === 'under 1 min' ? wall : 'about ' + wall) + ', all after time ran out';
    }
    var text = minutesText(s);
    if (b.secondsLeft <= 0) text += a.secondsLeft <= 0 ? ', all after time ran out' : ', time ran out';
    return text;
  }
  function minutesText(seconds) {
    if (seconds > 0 && seconds < 30) return 'under 1 min';
    return Math.round(Math.max(0, seconds) / 60) + ' min';
  }
  function markOf(marks, name) {
    for (var i = 0; i < (marks || []).length; i++) if (marks[i].phase === name) return marks[i];
    return null;
  }
  function stateWord(points, of) {
    if (of > 0 && points >= of) return 'correct';
    if (points > 0) return 'partly right';
    return 'wrong';
  }
  function baseSummary(g, score, of, weighted, percentile, late) {
    var msg = g.result;
    var limit = msg.timeLimitSeconds, left = msg.timeLeftSeconds;
    var used = Math.min(limit, limit - left);
    return {
      score: score, of: of, weighted: weighted, percentile: percentile, late: late,
      limitSeconds: limit, leftSeconds: left,
      minutesUsed: Math.ceil(Math.max(0, used) / 60),
      ranOut: left <= 0,
      phases: [], rows: []
    };
  }

  /* ---- Redrock ---------------------------------------------------------- */
  function redrockSummary(g) {
    var msg = g.result, r = msg.result, c = msg.content, v = c.version;
    var tags = labelsOf(v.skills);
    var sum = baseSummary(g, r.total.score, r.total.of, r.weighted, r.percentile, r.late);
    var marks = msg.phaseMarks || [];
    var order = ['investigation', 'analysis', 'report', 'cases', 'end'];
    var names = [v.labels.investigation_tab, v.labels.analysis_tab, v.labels.report_tab, v.labels.cases_tab];
    var scores = [[r.investigation.score, r.investigation.of], [r.analysis.score, r.analysis.of],
                  [r.report.score, r.report.of], [r.casesScore, r.casesOf]];
    for (var p = 0; p < 4; p++) {
      sum.phases.push({ name: names[p], scoreText: showScore(scores[p][0]) + '/' + showScore(scores[p][1]),
                        timeText: phaseTime(markOf(marks, order[p]), markOf(marks, order[p + 1]), true),
                        score: scores[p][0], of: scores[p][1], extra: '' });   /* D40: for the results card */
    }
    var rows = sum.rows;
    var items = c.investigation.items;
    function itemText(id) { return items[id] ? items[id].text : id; }
    function plainR(text) {
      return plain(String(text || '').replace(/\[\[([A-Za-z0-9_]+)\]\]/g, function (m, id) { return itemText(id); }));
    }

    /* Investigation: every required item, in the content's order. */
    var inv = r.investigation, invTag = tagLabel(tags, c.investigation.skill);
    var onReturn = {}, found = {};
    inv.returnVisit.forEach(function (id) { onReturn[id] = true; });
    inv.found.forEach(function (id) { found[id] = true; });
    Object.keys(items).forEach(function (id) {
      if (!items[id].required) return;
      var label = plain(items[id].label);
      if (found[id] && !onReturn[id]) {
        rows.push({ where: names[0], what: label, tag: invTag, state: 'correct', points: '1 / 1',
                    detail: 'collected on the first pass', late: false });
      } else if (found[id]) {
        rows.push({ where: names[0], what: label, tag: invTag, state: 'partly right',
                    points: showScore(inv.weight) + ' / 1',
                    detail: 'collected on a return visit from the Analysis', late: false });
      } else {
        rows.push({ where: names[0], what: label, tag: invTag, state: 'wrong', points: '0 / 1',
                    detail: 'missed; needed for: ' + plain(items[id].needed_for || ''), late: false });
      }
    });
    if (inv.extras.length) {
      rows.push({ info: true, text: names[0] + ' | collected but not needed (costs no marks): ' +
        inv.extras.map(function (id) { return plain(items[id] ? items[id].label : id); }).join('; ') });
    }

    /* Analysis: every box. */
    r.analysis.questions.forEach(function (q) {
      var cq = null;
      c.analysis.questions.forEach(function (x) { if (x.number === q.number) cq = x; });
      q.boxes.forEach(function (b) {
        var unit = b.unit || '';
        var given = isBlank(b.given) ? '' : String(b.given).trim() +
                    (unit && String(b.given).trim().slice(-unit.length) !== unit ? unit : '');
        rows.push(numberRow(names[1], 'Question ' + q.number + ': ' + plain(b.label),
                            tagLabel(tags, cq && cq.skill), b, given, String(b.expected) + unit));
      });
    });

    /* Report: every blank, the chart, every grid cell. */
    var rep = r.report, wTag = tagLabel(tags, c.report.written.skill);
    rep.written.forEach(function (w) {
      var what = v.labels.written_tab + ': blank ' + String(w.id).toUpperCase();
      if (w.kind === 'dropdown') {
        rows.push(choiceRow(names[2], what, wTag, w.correct, w.notAnswered,
                            plain(w.givenLabel || w.given), plain(w.expectedLabel), w.late));
      } else {
        rows.push(numberRow(names[2], what, wTag, w, isBlank(w.given) ? '' : String(w.given).trim(),
                            String(w.expected)));
      }
    });
    var CHART_NAMES = { bar: 'Bar chart', line: 'Line chart', pie: 'Pie chart',
                        scatter: 'Scatter plot', histogram: 'Histogram' };
    rows.push(choiceRow(names[2], v.labels.graph_tab + ': chart type', tagLabel(tags, c.report.chart.skill),
                        rep.chart.correct, rep.chart.notAnswered,
                        CHART_NAMES[rep.chart.given] || rep.chart.given,
                        CHART_NAMES[rep.chart.expected] || rep.chart.expected, rep.chart.late));
    var gTag = tagLabel(tags, c.report.grid.skill);
    rep.grid.forEach(function (cell) {
      rows.push(numberRow(names[2], v.labels.visual_tab + ': ' + plain(cell.rowLabel) + ', ' + plain(cell.colLabel),
                          gTag, cell, isBlank(cell.given) ? '' : String(cell.given).trim(), String(cell.expected)));
    });

    /* Cases: every case, one mark each. */
    r.cases.forEach(function (cr) {
      var cc = null;
      c.cases.cases.forEach(function (x) { if (x.number === cr.number) cc = x; });
      var tag = tagLabel(tags, cc && cc.skill);
      var what = 'Case ' + cr.number + ': ' + short(plainR(cr.question), 72);
      var d = cr.detail, given = '', expected = '', none = false;
      if (cr.mechanism === 'choose_one') {
        none = !!d.notAnswered;
        given = plain(d.givenLabel || d.given); expected = plain(d.expectedLabel);
      } else if (cr.mechanism === 'choose_many') {
        var chosen = [], should = [];
        Object.keys(d.per_option).forEach(function (id) {
          if (d.per_option[id].chosen) chosen.push(short(d.labels[id], 60));
          if (d.per_option[id].shouldBe) should.push(short(d.labels[id], 60));
        });
        none = chosen.length === 0;
        given = chosen.join(' | '); expected = should.join(' | ');
      } else if (cr.mechanism === 'dropdowns') {
        none = d.dropdowns.every(function (x) { return x.notAnswered; });
        given = d.dropdowns.map(function (x) { return plain(x.givenLabel || x.given || '…'); }).join(', ');
        expected = d.dropdowns.map(function (x) { return plain(x.expectedLabel); }).join(', ');
      } else if (cr.mechanism === 'number' || cr.mechanism === 'numbers') {
        none = d.boxes.every(function (x) { return x.notAnswered; });
        given = d.boxes.map(function (x) { return plain(x.label) + ' ' + (isBlank(x.given) ? '…' : String(x.given).trim()); }).join(', ');
        expected = d.boxes.map(function (x) { return plain(x.label) + ' ' + x.expected; }).join(', ');
      } else if (cr.mechanism === 'written') {
        none = d.blanks.every(function (x) { return x.notAnswered; });
        given = d.blanks.map(function (x) { return String(x.id).toUpperCase() + ' ' + (x.notAnswered ? '…' : plain(x.givenLabel || x.given)); }).join(', ');
        expected = d.blanks.map(function (x) { return String(x.id).toUpperCase() + ' ' + plain(x.expectedLabel); }).join(', ');
      } else if (cr.mechanism === 'collect') {
        var needed = d.found.length + d.missing.length;
        none = d.found.length === 0 && d.extras.length === 0;
        rows.push({ where: names[3], what: what, tag: tag,
                    state: none ? 'not answered' : (cr.correct ? 'correct' : 'wrong'),
                    detail: 'you collected ' + d.found.length + ' of the ' + needed + ' needed' +
                            (d.missing.length ? '; missed: ' + d.missing.map(function (id) { return plain(d.labels[id].label); }).join('; ') : '') +
                            (d.extras.length ? '; also collected, not needed: ' + d.extras.length : ''),
                    late: cr.late });
        return;
      }
      rows.push({ where: names[3], what: what, tag: tag,
                  state: none ? 'not answered' : (cr.correct ? 'correct' : 'wrong'),
                  detail: none ? 'expected ' + expected : 'you put ' + given + '; expected ' + expected,
                  late: cr.late });
    });
    return sum;
  }
  function numberRow(where, what, tag, m, given, expected) {
    var none = !!m.notAnswered || given === '';
    return { where: where, what: what, tag: tag,
             state: none ? 'not answered' : (m.correct ? 'correct' : 'wrong'),
             detail: none ? 'expected ' + expected : 'you put ' + given + ', expected ' + expected,
             late: !!m.late };
  }
  function choiceRow(where, what, tag, correct, notAnswered, given, expected, late) {
    var none = !!notAnswered || isBlank(given);
    return { where: where, what: what, tag: tag,
             state: none ? 'not answered' : (correct ? 'correct' : 'wrong'),
             detail: none ? 'expected ' + expected : 'you put ' + given + ', expected ' + expected,
             late: !!late };
  }

  /* ---- Sea Wolf --------------------------------------------------------- */
  function seawolfSummary(g) {
    var msg = g.result, r = msg.result, data = msg.content.data;
    var tags = labelsOf(data.skills);
    var byStep = (data.skills && data.skills.by_step) || {};
    var b = r.benchmark || {};
    var sum = baseSummary(g, r.summary.decisionsCorrect, r.summary.decisionsOf, b.weighted, b.percentile,
                          r.summary.lateAnswers);
    var labels = {};
    (msg.siteLabels || []).forEach(function (s) { labels[String(s.id)] = s; });
    var RETURN = msg.returnLabel || 'Return';
    var marks = msg.phaseMarks || [];
    function rangeText(x) { return x[0] + '–' + x[1]; }
    function itemText(x) { return x ? (x.trait || (x.attribute + ' ' + rangeText(x.range))) : ''; }

    data.sites.forEach(function (site) {
      var id = String(site.id), sr = r.sites[id];
      var here = labels[id] ? labels[id].label : 'Site ' + id;
      var next = labels[id] ? labels[id].next : 'Site ' + (Number(id) + 1);
      var parts = ['Step 1 ' + sr.step1.correct + '/' + sr.step1.of,
                   'Step 2 ' + sr.step2.correct + '/' + sr.step2.of,
                   'Step 3 ' + sr.step3.correct + '/' + sr.step3.of,
                   'Step 4 ' + sr.step4.score + '% (best ' + (sr.step4.bestOverall === null ? '—' : sr.step4.bestOverall + '%') + ')'];
      if (sr.step5.applicable) parts.push('Step 5 ' + sr.step5.correct + '/' + sr.step5.of);
      /* D40: the results card shows a site as decisions correct / decisions
         asked (Steps 1, 2, 3 and, where there is one, 5, added up) and the
         Step 4 score against the best possible beside the site's name. */
      var dScore = sr.step1.correct + sr.step2.correct + sr.step3.correct + (sr.step5.applicable ? sr.step5.correct : 0);
      var dOf = sr.step1.of + sr.step2.of + sr.step3.of + (sr.step5.applicable ? sr.step5.of : 0);
      sum.phases.push({ name: here, scoreText: parts.join(' · '),
                        timeText: phaseTime(markOf(marks, 'start:' + id), markOf(marks, 'end:' + id), false),
                        score: dScore, of: dOf,
                        extra: sr.step4.score + '%' + (sr.step4.bestOverall === null ? '' : ' of ' + sr.step4.bestOverall + '%') });

      var rows = sum.rows;
      /* Step 1: the two characteristics, trait first. */
      sr.step1.items.forEach(function (it, k) {
        var none = !sr.step1.answered || !it.candidate;
        rows.push({ where: here, what: 'Step 1: ' + (k === 0 ? 'trait' : 'attribute'),
                    tag: tagLabel(tags, byStep.step1),
                    state: none ? 'not answered' : (it.correct ? 'correct' : 'wrong'),
                    detail: none ? 'expected ' + itemText(it.expected)
                                 : 'you put ' + itemText(it.candidate) + ', expected ' + itemText(it.expected),
                    late: !!it.late });
      });
      /* Step 2: the tag depends on the expected answer (formats file §2.3). */
      sr.step2.items.forEach(function (it) {
        var key = it.expected === here ? 'this_site' : it.expected === next ? 'next_site'
                : it.expected === RETURN ? 'return' : null;
        var tagId = (byStep.step2 && key) ? byStep.step2[key] : null;
        rows.push({ where: here, what: 'Step 2: ' + it.microbe, tag: tagLabel(tags, tagId),
                    state: it.candidate === null ? 'not answered' : (it.correct ? 'correct' : 'wrong'),
                    detail: it.candidate === null ? 'expected ' + it.expected
                                                  : 'you put ' + it.candidate + ', expected ' + it.expected,
                    late: !!it.late });
      });
      /* Step 3: one pick per set. */
      sr.step3.items.forEach(function (it) {
        rows.push({ where: here, what: 'Step 3: ' + it.set, tag: tagLabel(tags, byStep.step3),
                    state: it.candidate === null ? 'not answered' : (it.correct ? 'correct' : 'wrong'),
                    detail: it.candidate === null ? 'expected ' + it.expected.join(' or ')
                                                  : 'you put ' + it.candidate + ', expected ' + it.expected.join(' or '),
                    late: !!it.late });
      });
      /* Step 4: the submission, marked out of the best possible score. */
      var s4 = sr.step4, best = s4.bestOverall === null ? '—' : s4.bestOverall + '%';
      var example = (s4.bestCombosOverall && s4.bestCombosOverall.length)
        ? '; a best trio: ' + s4.bestCombosOverall[0].join(' + ') : '';
      rows.push({ where: here, what: 'Step 4: submission', tag: tagLabel(tags, byStep.step4),
                  state: !s4.answered ? 'not answered' : (s4.score === s4.bestOverall ? 'correct' : 'wrong'),
                  points: s4.score + '% / ' + best,
                  detail: (s4.answered ? 'you put ' + s4.candidate.join(' + ') + ' = ' + s4.score + '%, ' : '') +
                          'best possible ' + best + example +
                          (s4.answered && s4.penalties.length ? '; lost: ' + s4.penalties.join('; ') : ''),
                  late: !!s4.late });
      /* Step 5: asked on the next site's screens, about what this site sent on. */
      if (sr.step5.applicable) {
        sr.step5.items.forEach(function (it) {
          rows.push({ where: here, what: 'Step 5 (on ' + next + '): ' + it.microbe, tag: tagLabel(tags, byStep.step5),
                      state: it.candidate === null ? 'not answered' : (it.correct ? 'correct' : 'wrong'),
                      detail: it.candidate === null ? 'expected ' + it.expected
                                                    : 'you put ' + it.candidate + ', expected ' + it.expected,
                      late: !!it.late });
        });
      }
    });
    return sum;
  }

  /* ---- SFL -------------------------------------------------------------- */
  function sflSummary(g) {
    var msg = g.result, r = msg.result, c = msg.content;
    var tags = labelsOf(c.skills);
    var byPhase = (c.skills && c.skills.by_phase) || {};
    var labels = c.labels || {};
    function L(key, fallback) { return typeof labels[key] === 'string' ? labels[key] : fallback; }
    function nameOf(list, id) { for (var i = 0; i < (list || []).length; i++) if (list[i].id === id) return list[i].short || list[i].name; return id; }
    function names(ids, list) { return (ids || []).map(function (id) { return nameOf(list, id); }).join(' or '); }
    var score = 0, of = 0;
    Object.keys(r.phaseTotals).forEach(function (k) { score += r.phaseTotals[k].score; of += r.phaseTotals[k].of; });
    score = Math.round(score * 100) / 100; of = Math.round(of * 100) / 100;
    var sum = baseSummary(g, score, of, r.weighted, r.percentile, 0);
    var marks = msg.phaseMarks || [];
    var rows = sum.rows;
    var assignScoring = (c.scoring && c.scoring.assign) || { reason_points: 0.5 };

    /* Onboarding */
    var ob = r.onboarding;
    sum.phases.push({ name: L('progress_onboarding', 'Onboarding'),
                      scoreText: showScore(ob.score) + '/' + showScore(ob.of),
                      timeText: phaseTime(markOf(marks, 'onboarding'), markOf(marks, 'day0'), false),
                      score: ob.score, of: ob.of, extra: '' });              /* D40 */
    ob.items.forEach(function (it) {
      rows.push({ where: L('progress_onboarding', 'Onboarding'), what: short(it.question.text, 72),
                  tag: tagLabel(tags, byPhase.onboarding),
                  state: it.yourPosition > 0 ? stateWord(it.points, it.of) : 'not answered',
                  points: showScore(it.points) + ' / ' + showScore(it.of),
                  detail: it.yourPosition > 0 ? 'you put it at position ' + it.yourPosition + ', recommended ' + it.recommended
                                              : 'recommended position ' + it.recommended,
                  late: !!it.late });
    });

    /* The days */
    c.days.forEach(function (day, di) {
      var dres = r.days[di], dayName = day.name;
      var parts = [], ds = 0, dof = 0;
      (day.phases || []).forEach(function (ph) {
        if (!dres[ph]) return;
        parts.push(L('phase_' + ph, ph) + ' ' + showScore(dres[ph].score) + '/' + showScore(dres[ph].of));
        ds += dres[ph].score; dof += dres[ph].of;
      });
      sum.phases.push({ name: dayName, scoreText: parts.join(' · '),
                        timeText: phaseTime(markOf(marks, 'day' + di),
                                            markOf(marks, di + 1 < c.days.length ? 'day' + (di + 1) : 'end'), false),
                        score: Math.round(ds * 100) / 100, of: Math.round(dof * 100) / 100, extra: '' });   /* D40: the day's phases added up */

      if (dres.explore) {
        var where = dayName + ' ' + L('phase_explore', 'Explore'), etag = tagLabel(tags, byPhase.explore);
        dres.explore.items.forEach(function (it) {
          rows.push({ where: where,
                      what: (it.who ? it.who.name : '') + ': "' + plain(it.question ? it.question.label : it.asked.q) + '"',
                      tag: etag, state: stateWord(it.points, it.of),
                      points: showScore(it.points) + ' / ' + showScore(it.of),
                      detail: it.useful ? 'useful' : 'not useful: the screen already told you this',
                      late: !!it.late });
        });
        var budget = day.explore_points || 0, asked = dres.explore.items.length;
        for (var k = asked + 1; k <= budget; k++) {
          rows.push({ where: where, what: 'request ' + k + ' of ' + budget + ' not used', tag: etag,
                      state: 'not used', points: '0 / ' + showScore(c.scoring.explore.points_useful),
                      detail: '', late: false });
        }
      }
      if (dres.assign) {
        var aw = dayName + ' ' + L('phase_assign', 'Assign');
        dres.assign.items.forEach(function (it) {
          var placeOf = Math.round((it.of - assignScoring.reason_points) * 100) / 100;
          var placePts = Math.round((it.pointsPlace + it.pointsPair) * 100) / 100;
          var pair = (it.pairsScored !== false && it.pairWith.length)
            ? '; pair with ' + names(it.pairWith, c.people) + ': ' + (it.pointsPair > 0 ? 'yes' : 'no') : '';
          rows.push({ where: aw, what: it.person.name + ': placement',
                      tag: tagLabel(tags, byPhase.assign && byPhase.assign.placement),
                      state: stateWord(placePts, placeOf), points: showScore(placePts) + ' / ' + showScore(placeOf),
                      detail: 'you put ' + (it.station ? (it.station.short || it.station.name) : 'nowhere') +
                              ', expected ' + names(it.goodStations, c.stations) + pair,
                      late: !!it.late });
          var reasonDetail = it.reason
            ? 'you put ' + it.reason.label + ', ' + (it.honest ? 'backed by what you asked' : 'not backed by what you asked')
            : 'not moved, so no reason was asked' + (it.good ? '; already well placed' : '; not well placed');
          rows.push({ where: aw, what: it.person.name + ': reason',
                      tag: tagLabel(tags, byPhase.assign && byPhase.assign.reason),
                      state: stateWord(it.pointsReason, assignScoring.reason_points),
                      points: showScore(it.pointsReason) + ' / ' + showScore(assignScoring.reason_points),
                      detail: reasonDetail, late: !!it.late });
        });
      }
      if (dres.support) {
        var sw = dayName + ' ' + L('phase_support', 'Support'), stag = tagLabel(tags, byPhase.support);
        dres.support.items.forEach(function (it) {
          var none = !it.chosen;
          rows.push({ where: sw, what: (it.person ? it.person.name + ': ' : '') + short(it.item.message, 60),
                      tag: stag, state: none ? 'not answered' : stateWord(it.points, it.of),
                      points: showScore(it.points) + ' / ' + showScore(it.of),
                      detail: none ? 'recommended ' + String(it.recommended.id).toUpperCase()
                            : it.chosen.id === it.recommended.id ? 'you chose ' + String(it.chosen.id).toUpperCase() + ', the recommended option'
                            : 'you chose ' + String(it.chosen.id).toUpperCase() + ' (' + it.chosen.tier + '), recommended ' + String(it.recommended.id).toUpperCase(),
                      late: !!it.late });
        });
      }
      if (dres.reflect) {
        var rw = dayName + ' ' + L('phase_reflect', 'Reflect'), rtag = tagLabel(tags, byPhase.reflect);
        var moodLabel = function (id) {
          if (!id) return '';
          if (id === 'idk') return L('idk', "I don't know");
          var opts = (day.reflect && day.reflect.options) || [];
          for (var i = 0; i < opts.length; i++) if (opts[i].id === id) return opts[i].label;
          return id;
        };
        dres.reflect.items.forEach(function (it) {
          var none = !it.chosenId;
          rows.push({ where: rw, what: it.person.name, tag: rtag,
                      state: none ? 'not answered' : stateWord(it.points, it.of),
                      points: showScore(it.points) + ' / ' + showScore(it.of),
                      detail: (none ? '' : 'you put ' + moodLabel(it.chosenId) + ', ') + 'expected ' + moodLabel(it.expectedId) +
                              (it.expectedId === 'idk' ? ' (no clue was given)' : ''),
                      late: !!it.late });
        });
      }
    });
    sum.late = rows.filter(function (x) { return x.late; }).length;
    return sum;
  }

  function summaryOf(g) {
    if (!g.result) return null;
    if (g.id === 'rr-m1') return redrockSummary(g);
    if (g.id === 'sw-m1') return seawolfSummary(g);
    return sflSummary(g);
  }

  /* The overall estimated percentile: the weighted mean of the three games'
     percentiles, rounded (plan D5). */
  function overall(summaries) {
    var sw = 0, sp = 0;
    for (var i = 0; i < state.games.length; i++) {
      var s = summaries[i];
      if (!s || typeof s.percentile !== 'number') return null;
      var w = (S.weights && typeof S.weights[state.games[i].id] === 'number') ? S.weights[state.games[i].id] : 1;
      sw += w; sp += w * s.percentile;
    }
    return sw ? Math.round(sp / sw) : null;
  }
  /* The four zones the three games share (the same table in all three). */
  function sharedZones() {
    var g = state.games[0];
    var c = g.result && g.result.content;
    return (c && c.version && c.version.benchmark && c.version.benchmark.zones) ||
           [{ from: 0, label: 'Below 70th' }, { from: 70, label: 'Borderline' },
            { from: 80, label: 'Likely pass' }, { from: 90, label: 'Comfortable' }];
  }

  /* ====================================================================== *
   * THE EXPORT (plan D6, handover §3) — plain text, one row per marked unit
   * ====================================================================== */
  function rowText(x) {
    if (x.info) return '  ' + x.text;
    return '  ' + x.where + ' | ' + x.what + ' | ' + x.tag + ' | ' + x.state +
           (x.points ? ' · ' + x.points : '') +
           (x.detail ? ' (' + x.detail + ')' : '') +
           (x.late ? ' · after time' : '');
  }
  function gameHeadText(g, s) {
    return g.title.toUpperCase() + ' — ' + showScore(s.score) + ' / ' + showScore(s.of) +
      ' · weighted ' + (typeof s.weighted === 'number' ? s.weighted.toFixed(1) : '—') + ' / 100' +
      ' · ' + (typeof s.percentile === 'number' ? s.percentile + ordinal(s.percentile) + ' percentile' : 'no percentile') +
      ' · ' + s.minutesUsed + ' of ' + Math.round(s.limitSeconds / 60) + ' min' + (s.ranOut ? ' (time ran out)' : '') +
      ' · ' + s.late + ' late' +
      (g.result.finished === false ? ' · did not reach the end' : '');
  }
  function exportText() {
    var summaries = state.games.map(summaryOf);
    var done = doneCount(), all = done === state.games.length;
    var lines = [];
    if (all) {
      lines.push(S.title + ' — ' + S.export_label + ' — completed ' + stamp(state.completedAt));
      var o = overall(summaries);
      lines.push('Overall estimated percentile: ' + (o === null ? '—' : o) + '  (' +
        state.games.map(function (g, i) {
          return g.title.replace(/ Mock$/, '') + ' ' + (summaries[i] && typeof summaries[i].percentile === 'number' ? summaries[i].percentile : '—');
        }).join(' · ') + ')');
    } else {
      lines.push(S.title + ' — ' + S.export_label + ' — PARTIAL RESULTS (' + done + ' of ' + state.games.length +
                 ' games finished) — saved ' + stamp(new Date()));
      lines.push('Overall estimated percentile: not available until all ' + state.games.length + ' games are finished.');
    }
    state.games.forEach(function (g, i) {
      lines.push('');
      var s = summaries[i];
      if (!s) { lines.push(g.title.toUpperCase() + ' — not played yet'); return; }
      lines.push(gameHeadText(g, s) + ' · finished ' + stamp(g.finishedAt));
      lines.push('  ' + s.phases.map(function (p) {
        /* "Investigation 27.5/29 · 9 min", "Site 1: Step 1 2/2 · … · 12 min" */
        return p.name + (p.scoreText.indexOf(' · ') !== -1 || /[a-z]/i.test(p.scoreText) ? ': ' : ' ') +
               p.scoreText + ' · ' + p.timeText;
      }).join('   '));
      s.rows.forEach(function (x) { lines.push(rowText(x)); });
    });
    return lines.join('\r\n') + '\r\n';
  }
  function exportFileName() {
    var slug = (S.title + ' ' + S.export_label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return slug + (doneCount() === state.games.length ? '' : '-partial') + '-results.txt';
  }
  var lastBlobUrl = null;
  function blobUrl() {
    if (lastBlobUrl) { try { URL.revokeObjectURL(lastBlobUrl); } catch (e) { /* nothing */ } }
    lastBlobUrl = URL.createObjectURL(new Blob([exportText()], { type: 'text/plain;charset=utf-8' }));
    return lastBlobUrl;
  }
  function downloadText() {
    var link = document.createElement('a');
    link.href = blobUrl();
    link.download = exportFileName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ====================================================================== *
   * SCREENS
   * ====================================================================== */
  function homeHtml() {
    var next = nextIndex();
    var cards = state.games.map(function (g, i) {
      var cls = 'game-card', foot;
      if (g.result) {
        cls += ' is-done';
        foot = '<span class="gc-state">Completed ✓</span>';
      } else if (i === next && g.error) {
        cls += ' is-error';
        foot = '<p class="gc-state" style="color:var(--error)">This game could not load</p>' +
               '<ul class="gc-error">' + g.error.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' +
               '<div style="margin-top:8px"><button class="btn" type="button" data-act="retry" data-i="' + i + '">Try again</button></div>';
      } else if (i === next) {
        cls += ' is-next';
        foot = '<button class="btn" type="button" data-act="play" data-i="' + i + '">Start</button>';
      } else {
        cls += ' is-locked';
        foot = '<span class="gc-state">Opens after ' + esc(state.games[i - 1].title) + '</span>';
      }
      return '<div class="' + cls + '" data-card="' + esc(g.id) + '">' +
               '<span class="gc-step">Game ' + (i + 1) + ' of ' + state.games.length + '</span>' +
               '<span class="gc-title">' + esc(g.title) + '</span>' +
               '<span class="gc-time">' + g.minutes + ' minutes</span>' +
               '<div class="gc-foot">' + foot + '</div>' +
             '</div>';
    }).join('');
    var done = doneCount();
    var actions = (done > 0 && done < state.games.length)
      ? '<div class="home-actions"><button class="btn-quiet" type="button" data-act="download-partial">' +
        'Download results so far</button></div>'
      : '';
    return '<div class="header-bar shell-head"><div class="header-right">' + fullscreenButton() + '</div></div>' +
      '<div class="home"><div class="home-card">' +
        '<h1>' + esc(S.title) + '</h1>' +
        '<p class="home-intro">' + esc(S.intro_line) + '</p>' +
        '<div class="game-cards">' + cards + '</div>' +
        actions +
      '</div></div>';
  }

  /* "Where you stand", for the overall figure: Redrock's standingHtml(),
     copied, with the overall percentile and the sentence the brief gives. */
  function zoneTone(index, count) {
    if (index === 0) return 'grey';
    var fromTop = count - 1 - index;
    return fromTop === 0 ? 'green' : fromTop === 1 ? 'lightgreen' : 'amber';
  }
  function zoneIndexOf(p, zones) {
    var found = -1;
    for (var i = 0; i < zones.length; i++) if (zones[i].from <= p) found = i;
    return found;
  }
  function standingHtml(p) {
    if (p === null || p === undefined) return '';
    var zones = sharedZones();
    var zi = zoneIndexOf(p, zones);
    var tone = zi >= 0 ? zoneTone(zi, zones.length) : 'grey';
    var decile = Math.max(1, Math.min(10, Math.ceil(p / 10)));
    var cells = '', nums = '';
    for (var d = 1; d <= 10; d++) {
      var z = zoneIndexOf((d - 1) * 10, zones);
      cells += '<span class="band-cell tone-' + (z >= 0 ? zoneTone(z, zones.length) : 'grey') + '"></span>';
      nums += '<span>' + d + '</span>';
    }
    var cellIndex = Math.min(9, Math.floor(p / 10));
    var left = 'calc((100% - 36px) * ' + (p / 100) + ' + ' + (cellIndex * 4) + 'px)';
    var legend = '';
    for (var i = 0; i < zones.length; i++) {
      var range = i === 0 ? ''
                : (i === zones.length - 1 ? zones[i].from + '+'
                                          : zones[i].from + '–' + (zones[i + 1].from - 1)) + ' · ';
      legend += '<span class="legend-item"><i class="tone-' + zoneTone(i, zones.length) + '"></i>' +
                esc(range) + esc(zones[i].label) + '</span>';
    }
    return '<section class="standing tone-' + tone + '" aria-label="Where you stand">' +
      '<div class="standing-main">' +
        '<div class="standing-left">' +
          '<div class="standing-figure">' +
            '<span class="standing-number">' + p + '</span>' +
            '<span class="standing-ordinal">' + ordinal(p) + '</span>' +
            '<span class="standing-word">percentile</span>' +
          '</div>' +
          '<div class="standing-pill">Decile ' + decile + ' · ' + (100 - p) + '% scored better</div>' +
          '<p class="standing-sentence">Estimated overall standing across the three games.</p>' +   /* D39 */
        '</div>' +
        '<div class="standing-right">' +
          '<div class="band" role="img" aria-label="Decile band, you are at the ' + p + ordinal(p) + ' percentile">' +
            '<div class="band-marker" style="left:' + left + '">' +
              '<span class="marker-label">You · ' + p + ordinal(p) + '</span>' +
              '<span class="marker-arrow"></span>' +
              '<span class="marker-line"></span>' +
            '</div>' +
            '<div class="band-cells">' + cells + '</div>' +
            '<div class="band-nums">' + nums + '</div>' +
          '</div>' +
          '<div class="band-legend">' + legend + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="standing-note">Each game’s percentile is our own estimate from that game’s score, ' +
        'not a McKinsey figure.</p>' +   /* D39: how the overall is added up is no longer spelled out */
    '</section>';
  }

  /* D38: the "Email us your results" link. The address and the subject come
     from content/settings.js; the Mock label is added to the subject. A mail
     link can fill in the address, subject and body, but cannot attach a file. */
  function mailtoHref() {
    var to = S.results_email || '';
    var subject = (S.results_subject || (S.title + ' results')) + ' — ' + S.export_label;
    var body = 'My ' + S.title + ' results are attached.';
    return 'mailto:' + encodeURI(to) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  /* D40: one game's card on the results page. Top to bottom: the title and a
     percentile pill coloured by its zone (the same zones and tones as "Where
     you stand"); the score as the one big number; the weighted score; the
     time used and the answers after time; then one row per phase (name,
     score, time) with a thin bar for score / out of; then "Open review".
     The per-step detail lines stay in the export and in the game's own
     review, not on the card. */
  function percentilePill(p) {
    if (typeof p !== 'number') return '<span class="gr-pill tone-grey">no percentile</span>';
    var zones = sharedZones(), zi = zoneIndexOf(p, zones);
    var tone = zi >= 0 ? zoneTone(zi, zones.length) : 'grey';
    return '<span class="gr-pill tone-' + tone + '">' + p + ordinal(p) + ' percentile</span>';
  }
  function gameCardHtml(g, s, i) {
    var phases = s.phases.map(function (p) {
      var share = (typeof p.of === 'number' && p.of > 0) ? Math.max(0, Math.min(1, p.score / p.of)) : 0;
      return '<div class="gr-phase">' +
               '<span class="ph-name">' + esc(p.name) +
                 (p.extra ? '<span class="ph-extra"> · ' + esc(p.extra) + '</span>' : '') + '</span>' +
               '<span class="ph-score">' + (typeof p.score === 'number' ? showScore(p.score) + ' / ' + showScore(p.of) : '—') + '</span>' +
               '<span class="ph-time">' + esc(String(p.timeText).replace('under 1 min', '<1 min')) + '</span>' +
               '<span class="ph-bar" aria-hidden="true"><i style="width:' + (Math.round(share * 1000) / 10) + '%"></i></span>' +
             '</div>';
    }).join('');
    return '<div class="game-result" data-result="' + esc(g.id) + '">' +
      '<div class="gr-head"><h2>' + esc(g.title) + '</h2>' + percentilePill(s.percentile) + '</div>' +
      '<div class="gr-score">' + showScore(s.score) + ' / ' + showScore(s.of) + '</div>' +
      '<div class="gr-line gr-weighted">Weighted ' + (typeof s.weighted === 'number' ? s.weighted.toFixed(1) : '—') + ' / 100</div>' +
      '<div class="gr-line gr-time">' + s.minutesUsed + ' of ' + Math.round(s.limitSeconds / 60) + ' min · ' +
        s.late + (s.late === 1 ? ' answer' : ' answers') + ' after time' + (s.ranOut ? ' · time ran out' : '') + '</div>' +
      '<div class="gr-phases">' + phases + '</div>' +
      '<div class="gr-foot"><button class="btn" type="button" data-act="review" data-i="' + i + '">Open review</button></div>' +
    '</div>';
  }

  function resultsHtml() {
    var summaries = state.games.map(summaryOf);
    var o = overall(summaries);
    var cards = state.games.map(function (g, i) { return gameCardHtml(g, summaries[i], i); }).join('');
    var exportBox = state.exportShown
      ? '<textarea id="export-text" readonly spellcheck="false" aria-label="Your results as text">' + esc(exportText()) + '</textarea>'
      : '';
    return '<div class="results"><div class="results-inner">' +
      '<div class="results-head"><h1>' + esc(S.title) + ': your results</h1>' +
        '<div class="results-actions">' + fullscreenButton() + '</div></div>' +
      standingHtml(o) +
      '<div class="game-results">' + cards + '</div>' +
      /* D38: download first, then an email link to us (the browser cannot
         attach the file, so the page says to), then copying as text as a
         quiet fallback, and the new-tab link. */
      '<section class="export">' +
        '<h2>Your results for the personal review</h2>' +
        '<p>Download your results and email the file to us for your personal result review. ' +
          'They are not saved anywhere else: if you close or refresh this page, they are gone.</p>' +
        '<div class="export-actions">' +
          '<button class="btn" type="button" data-act="download">Download results (.txt)</button>' +
          '<a class="btn-quiet export-email" href="' + esc(mailtoHref()) + '" data-act="email">Email us your results</a>' +
          '<a href="#" class="export-copy" data-act="copy">Copy as text instead</a>' +
          '<a href="#" data-act="open-tab">Open the results in a new tab</a>' +
          '<span class="export-said" id="export-said">' + esc(state.exportSaid) + '</span>' +
        '</div>' +
        '<p class="export-attach">Attach the downloaded file to the email.</p>' +
        exportBox +
      '</section>' +
    '</div></div>';
  }

  function reviewBarHtml() {
    var g = state.games[state.current];
    return '<div class="review-bar">' +
      '<button class="btn-quiet" type="button" data-act="back-to-results">← Back to results</button>' +
      '<span class="review-title">' + esc(g.title) + '</span>' +
      '<span class="review-tools">' + fullscreenButton() + '</span>' +   /* D37: the shell's own button */
    '</div>';
  }

  function render() {
    document.body.classList.toggle('is-playing', state.phase === 'playing');
    document.body.classList.toggle('is-reviewing', state.phase === 'review');
    document.body.classList.toggle('scrolls', state.phase === 'results');
    if (state.phase === 'login') app.innerHTML = loginHtml();
    else if (state.phase === 'home') app.innerHTML = homeHtml();
    else if (state.phase === 'results') app.innerHTML = resultsHtml();
    else if (state.phase === 'review') app.innerHTML = reviewBarHtml();
    else app.innerHTML = '';
    layoutFrames();
    if (state.phase === 'login') {
      var u = byId('login-user');
      if (u && !u.value) u.focus(); else if (byId('login-pass')) byId('login-pass').focus();
    } else if (state.phase === 'home') {
      var go = app.querySelector('[data-act="play"], [data-act="retry"], [data-act="download-partial"]');
      if (go) go.focus();
    }
  }

  /* ====================================================================== *
   * EVENTS
   * ====================================================================== */
  document.addEventListener('submit', function (event) {
    if (!event.target || event.target.id !== 'login-form') return;
    event.preventDefault();
    attemptLogin(byId('login-user').value.trim(), byId('login-pass').value);
  });

  document.addEventListener('click', function (event) {
    var el = event.target.closest ? event.target.closest('[data-act]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    var i = parseInt(el.getAttribute('data-i'), 10);
    switch (act) {
      case 'fullscreen': event.preventDefault(); toggleFullscreen(); return;
      case 'play': event.preventDefault(); if (i === nextIndex()) openGame(i); return;
      case 'retry':
        event.preventDefault();
        if (i !== nextIndex()) return;
        dropFrame(state.games[i]);
        state.games[i].error = null;
        openGame(i);
        return;
      case 'download-partial': event.preventDefault(); downloadText(); return;
      case 'review': {
        event.preventDefault();
        var g = state.games[i];
        if (!g || !g.result || !g.frame) return;
        state.current = i;
        state.phase = 'review';
        render();
        window.scrollTo(0, 0);
        /* Ask once: the game keeps its results page drawn after that. */
        if (!g.reviewAsked) {
          g.reviewAsked = true;
          try { g.frame.contentWindow.postMessage({ type: 'mock-show-results' }, location.origin); } catch (e) { /* nothing */ }
        }
        return;
      }
      case 'back-to-results':
        event.preventDefault();
        state.phase = 'results';
        render();
        return;
      case 'copy': {
        event.preventDefault();
        state.exportShown = true;
        state.exportSaid = '';
        render();
        var box = byId('export-text');
        box.focus();
        box.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        var said = byId('export-said');
        if (ok) {
          state.exportSaid = 'Copied. Paste it into your email.';
          said.textContent = state.exportSaid;
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(box.value).then(function () {
            state.exportSaid = 'Copied. Paste it into your email.';
            said.textContent = state.exportSaid;
          }, function () {
            state.exportSaid = 'The text is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.';
            said.textContent = state.exportSaid;
          });
        } else {
          state.exportSaid = 'The text is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.';
          said.textContent = state.exportSaid;
        }
        return;
      }
      case 'download': event.preventDefault(); downloadText(); return;
      case 'email': mailingUntil = Date.now() + 1000; return;     /* D38: the link opens the mail program itself */
      case 'open-tab': {
        event.preventDefault();
        var w = window.open(blobUrl(), '_blank');
        if (!w) {
          state.exportShown = true;
          state.exportSaid = 'The browser blocked the new tab. The text is below.';
          render();
        }
        return;
      }
    }
  });

  /* Test hook: lets the automated build checks read the state and the
     export. Not used by the page. */
  window.__mockShell = {
    state: function () { return state; },
    exportText: exportText,
    summaries: function () { return state.games.map(summaryOf); }
  };

  render();
}());
