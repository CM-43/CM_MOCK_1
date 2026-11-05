/* ==========================================================================
   config.js — THE ONLY FILE YOU NEED TO EDIT TO CHANGE THE LOGIN

   Change a setting here, save the file, upload it to GitHub, and the change
   is live. Nothing else has to be touched.
   ========================================================================== */

const CONFIG = {

  /* Turn the login screen on or off.
     false removes it entirely and the simulation starts at the start screen. */
  requireLogin: false,   /* Full Mock Test: the shell (../index.html) has the one login */

  /* Which content folder this repository plays: data/<version>/.
     One repository, one version. To make another version, copy the whole
     repository, replace the data folder, and change this one word. */
  version: "rr-m1",

  /* Full Mock Test: which game this is, in the messages it sends to the
     shell (../index.html). Must match the id in ../content/settings.js. */
  mockGameId: "rr-m1",

  /* The username candidates type. Change it to whatever you like. */
  username: "CaseMentor0157",

  /* ------------------------------------------------------------------------
     The password is never written in this file. What is stored is a
     "hash" — a scrambled fingerprint of the password that cannot be turned
     back into it. The page scrambles whatever the candidate types the same
     way and compares the two fingerprints.

     Since v1.7 (WK, 23 Sep 2026) this repository uses the SAME username and
     password as the freelancer-coded RR6 simulation it replaces, so the
     lesson and the customers' notes need no change. WK accepts that the old
     password was written in plain text in the old repository's public code.
     Another version's repository reuses that version's own old credentials
     (they are in the old repository's js/log_in.js).

     To set a different password:
       1. Open tools/make-passcode.html in a browser.
       2. Type the password you want.
       3. Copy the long line of letters and numbers it prints.
       4. Paste it between the quotes below, replacing what is there.
       5. Save this file and upload it.
     ---------------------------------------------------------------------- */
  passcodeHash: "5d6e93ad0948753cc24845fb88be4b720966a9cb72ea9c7e86429942df6cce98",

  /* ------------------------------------------------------------------------
     Should the simulation refuse to run outside your course?

     Ships as false, which means it runs anywhere. Switch it to true once you
     have confirmed in a real lesson which address the lesson runs under.

     Even when true, the check FAILS OPEN: if the browser gives no usable
     information about where the page was opened from, the simulation loads
     normally. A candidate who cannot start their assessment is a far worse
     outcome than somebody finding the page by accident.
     ---------------------------------------------------------------------- */
  /* Full Mock Test: the game only runs inside the Mock Test page (the
     shell), which is served from cm-43.github.io. localhost and 127.0.0.1
     are there so the build checks can run on a local computer. */
  blockDirectAccess: true,

  allowedEmbedDomains: ["cm-43.github.io", "localhost", "127.0.0.1"]
};
