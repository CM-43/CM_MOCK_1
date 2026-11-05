/* ==========================================================================
   content/settings.js — WHAT THE MOCK TEST PAGE SHOWS AROUND THE THREE GAMES

   The Mock Test page (index.html, "the shell") reads this file before any
   game has loaded, so the home page can show the three cards at once.
   The game content itself lives in each game's own data folder:
     redrock/data/rr-m1/   seawolf/data/   sfl/data/sfl-m1/content.js

   Safe to edit: title, intro_line, a game's title or minutes (they must
   match the game's own content file: the build checks this), the weights,
   export_label. Do not change an id or a folder: they name the game's
   folder and the id the game sends with its result (its config.js
   "mockGameId").
   ========================================================================== */
window.MOCK_SETTINGS = {

  /* The heading on the login, home and results pages. */
  title: "Full Mock Test",

  /* The line under the heading on the home page. */
  intro_line: "Three games, one sitting: 35 + 30 + 30 minutes. Take a break between games if you like. Do not refresh or leave this page: nothing is saved until you export your results.",

  /* The three games, in the order they are played (Redrock, Sea Wolf, SFL). */
  games: [
    { id: "rr-m1",  folder: "redrock", title: "Redrock Mock",  minutes: 35 },
    { id: "sw-m1",  folder: "seawolf", title: "Sea Wolf Mock", minutes: 30 },
    { id: "sfl-m1", folder: "sfl",     title: "SFL Mock",      minutes: 30 }
  ],

  /* How much each game's percentile counts in the overall estimated
     percentile (all equal: the overall is the plain average). */
  weights: { "rr-m1": 1, "sw-m1": 1, "sfl-m1": 1 },

  /* The Mock Test version, printed at the top of the exported results. */
  export_label: "Mock 1"
};
