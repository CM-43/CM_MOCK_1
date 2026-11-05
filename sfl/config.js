/* ==========================================================================
   SETTINGS YOU MAY CHANGE — login and which content file to use.
   See EDITING-GUIDE.md before changing anything here.
   ========================================================================== */
var CONFIG = {

  /* true = ask for a username and password first. false = go straight in
     (for example for a free demo). */
  requireLogin: false,   /* Full Mock Test: the shell (../index.html) has the one login */

  /* The username, exactly as the customer must type it. */
  username: "CaseMentor3917",

  /* The password is NOT stored here, only a scrambled fingerprint of it
     (a "SHA-256 hash"). To change the password: open tools/make-passcode.html
     in your browser, type the new password, and paste the long code it shows
     between the quote marks below. */
  passcodeHash: "985cbd88fc39f7a3fe29310bf97fd1df2380feb6bc46cf6ede69bbb7b8a04ecb",

  /* Which content folder inside data/ to use. "sfl-m1" = data/sfl-m1/content.js.
     A different one can also be opened for testing by adding ?content=<name>
     to the web address, e.g. index.html?content=test-every-shape */
  content: "sfl-m1",

  /* Full Mock Test: which game this is, in the messages it sends to the
     shell (../index.html). Must match the id in ../content/settings.js. */
  mockGameId: "sfl-m1",

  /* Should the simulation refuse to run outside the Mock Test page?
     true = it only runs inside a page on one of the addresses below; opened
     on its own it shows "Please open the simulation from your course".
     The check FAILS OPEN: if the browser gives no usable information about
     where the page was opened from, the simulation loads normally.
     (Copied from Redrock's config.js for the Full Mock Test.) */
  blockDirectAccess: true,

  /* The addresses the Mock Test page may be served from. localhost and
     127.0.0.1 are there so the build checks can run on a local computer. */
  allowedEmbedDomains: ["cm-43.github.io", "localhost", "127.0.0.1"]
};
