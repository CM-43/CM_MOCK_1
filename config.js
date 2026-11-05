/* ==========================================================================
   config.js — THE MOCK TEST PAGE'S LOGIN

   This is the one login for the whole Full Mock Test. The three games
   inside it (redrock/, seawolf/, sfl/) have their own login switched off.

   >>> THE PASSWORD BELOW IS A PLACEHOLDER AND MUST BE CHANGED BEFORE LAUNCH. <<<

   The password is currently:   change-me-before-launch

   It is written here on purpose so the Mock Test can be opened and checked.
   Because anyone can read this repository, it protects nothing. To set the
   real one:
     1. Open  tools/make-passcode.html  from the published web address
        (https://cm-43.github.io/CM_MOCK_1/tools/make-passcode.html).
     2. Type the password you want.
     3. Copy the long line of letters and numbers it prints.
     4. Paste it below, between the quote marks after passcodeHash,
        replacing what is there.
     5. Upload this file to GitHub.
   Change the username on the line above it too, if you want.
   ========================================================================== */
var CONFIG = {

  /* The username candidates type. */
  username: "CaseMentorMock1",

  /* The password, scrambled (a SHA-256 "hash"). Currently the placeholder
     change-me-before-launch. */
  passcodeHash: "22d1c9017df0929ef31cfd943bbc97d2adeff40c010e19d89f1a006943f2132c",

  /* The Mock Test page itself may be opened directly (it has the login).
     The three games inside it refuse to run unless they are inside this
     page: that is set in each game's own config.js. */
  blockDirectAccess: false,

  allowedEmbedDomains: ["app.casementor.com", "casementor.spayee.com"]
};
