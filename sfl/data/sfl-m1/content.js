/* ==========================================================================
   SUSTAINABLE FUTURES LAB — CONTENT FILE v2 (scenario: SFL Mock, Kell Marsh)

   EVERYTHING THE CANDIDATE READS, AND EVERY NUMBER THAT SHAPES THE GAME,
   IS IN THIS FILE. Read EDITING-GUIDE.md before changing it.

   Quick rules for editing safely:
   · Text goes inside "double quote marks". To use a quote mark inside text,
     write \" (or use ' single quotes inside the text instead).
   · Every item in a list or group ends with a comma.
   · Lines starting with // are notes for us. The simulation ignores them.
   · \n inside text is a line break; \n\n is a blank line.
   · If you break something, the simulation will not start and will show a
     list of what to fix. Nothing broken ever reaches a customer silently.

   This is the MOCK scenario (sfl-m1). Its shape follows the live Orrin Island
   file exactly: the same rules, scoring, labels and stage texts, and the same
   difficulty. Only the story, the people, the Workstations and the three days
   are new. The story, names and sentences are our own.
   A worked marking example is at the bottom of this file.
   ========================================================================== */
window.SFL_CONTENT = {

  title: "SFL Mock",              // login heading, page title, results file name

  time_limit_minutes: 30,        // same clock as the live simulation

  results_mode: "full",          // "full" = everything explained; "demo" = percentile and scores only

  /* ---------------------------------------------------------------------
     RULES — how the game behaves. Change a value here, not the code.
     (Copied unchanged from the live file.)
     --------------------------------------------------------------------- */
  rules: {
    show_tutorial: true,             // true = the five tutorial screens come first (clock paused). VERIFIED
    time_warning_minutes: [10, 5, 4, 3, 2, 1], // a "Time remaining" note appears once at each of these minutes left. VERIFIED at 4; the list is DECIDED
    station_capacity: 2,             // most people one Workstation can hold; a Workstation may also be empty. VERIFIED
    questions_per_target_per_day: 1, // how many questions one person or Workstation answers per day. VERIFIED for people, INFERRED for Workstations

    // Questions the candidate can ask a person in Explore.
    // reveals_mood: true marks the question whose answer tells you how the person feels (used in Reflect marking).
    person_questions: [
      { id: "feeling", label: "How are you feeling about the project today?", reveals_mood: true },
      { id: "working", label: "How do you like to work with the team?" }
    ],

    // Questions the candidate can ask a Workstation in Explore.
    station_questions: [
      { id: "work",  label: "What work is planned here today?" },
      { id: "learn", label: "What have we learned here that could help today?" }
    ],

    // Reasons offered after every move in Assign. VERIFIED: four reasons plus Cancel.
    // Short labels (buttons, reasons, mood words, tabs, slot names, small headings) use the real game's wording (Master Doc D55);
    // full sentences are our own.
    // needs = what the candidate must have asked, on any day so far (Day 1 up to today), for the reason to be honest.
    //   The candidate's memory does not reset at midnight, so a question asked on an earlier day still backs a reason today.
    //   target "person"  = the person being moved; target "station" = the Workstation they are moved to.
    //   Several questions in one need = ANY one of them counts. An empty list = always honest.
    reasons: [
      { id: "preference", label: "Researcher preference",    needs: [{ target: "person",  questions: ["working", "feeling"] }] },
      { id: "teammate",   label: "Researcher assistance",    needs: [{ target: "person",  questions: ["working", "feeling"] }] },   // either question counts (2 Oct 2026): a "feeling" answer can also say who the person wants to work beside
      { id: "needs",      label: "Latest workstation needs", needs: [{ target: "station", questions: ["work", "learn"] }] },
      { id: "coverage",   label: "Workstation coverage",     needs: [] }
    ],

    ask_reason_for_unmoved: false,   // false = people left where they started are not asked for a reason. REPORTED
    show_support_outcomes: false,    // false = nothing is shown after a Support answer. REPORTED
    notes_in_reflect: true,          // true = Notes can be opened on the Reflect screen. VERIFIED
    notes_include_onboarding: false, // false = the Onboarding answers are not kept in Notes. VERIFIED (no such tab in the photos)
    can_skip_explore_points: true,   // true = the candidate may leave Explore with requests unused. DECIDED
    reflect_default: null            // null = nothing pre-selected in Reflect. SHAKY (SQ26). Or a mood id such as "mid"
  },

  /* ---------------------------------------------------------------------
     SCORING — our own marking (McKinsey publishes nothing).
     (Copied unchanged from the live file.)
     --------------------------------------------------------------------- */
  scoring: {
    onboarding: { points_by_distance: [1, 0.5, 0, 0] },   // points for a question placed 0, 1, 2, 3 places from our order
    explore:    { points_useful: 1, points_not_useful: 0 }, // per question asked; the maximum is the day's Explore points
    assign:     { placement_points: 1,                      // person on one of their good_stations
                  pair_points: 0.5,                         // person shares a Workstation with someone in their pair_with AND that Workstation is one of their good_stations (only for people who have pair_with)
                  reason_points: 0.5 },                     // an honest reason (see rules > reasons > needs). Unscored in the real game? Unknown (SQ5)
    support:    { tier_points: { recommended: 1, acceptable: 1, weak: 0 } }, // only clearly weak answers lose marks
    reflect:    { points_correct: 1,                        // you had a clue about the person and picked their true mood
                  points_idk_when_unknown: 1 }              // you had no clue about the person and picked "I don't know"
  },

  /* ---------------------------------------------------------------------
     BENCHMARK — the same on every CaseMentor simulation. Do not change the
     zones or the percentiles table. The note will be updated after review.
     (Copied unchanged from the live file.)
     --------------------------------------------------------------------- */
  benchmark: {
    note: "This percentile is our own estimate for this simulation, not a McKinsey figure. McKinsey does not publish how this game is scored, and parts of the game are still being confirmed, so we score how closely your choices match the approach we teach. In Support, any reasonable response earns full marks; only clearly weak ones do not. Candidates who pass typically score in the top quartile, but we recommend aiming for the 90th and above.",
    phase_weights: { onboarding: 10, explore: 15, assign: 25, support: 25, reflect: 25 },
    zones: [
      { from: 0,  label: "Below 70th" },
      { from: 70, label: "Borderline" },
      { from: 80, label: "Likely pass" },
      { from: 90, label: "Comfortable" }
    ],
    percentiles: [[0,1],[20,5],[35,12],[45,20],[55,30],[62,40],[68,50],[74,60],[79,68],[84,75],[88,80],[91,85],[94,90],[96,94],[98,97],[100,99]]
  },

  /* ---------------------------------------------------------------------
     SKILL TAGS — the six skills the course teaches, and which stage tests
     each one. Fixed block: do not add, rename or reorder.
     --------------------------------------------------------------------- */
  skills: {
    list: [
      { id: "order-questions", label: "Ordering questions by dependency" },
      { id: "spend-questions", label: "Spending questions on the unknown" },
      { id: "place-people",    label: "Placing people on what you learned" },
      { id: "give-reason",     label: "Giving the true reason for a move" },
      { id: "eliminate-weak",  label: "Eliminating weak options" },
      { id: "read-mood",       label: "Reading mood, or saying \"I don't know\"" }
    ],
    by_phase: {
      onboarding: "order-questions",
      explore:    "spend-questions",
      assign:     { placement: "place-people", reason: "give-reason" },
      support:    "eliminate-weak",
      reflect:    "read-mood"
    }
  },

  /* ---------------------------------------------------------------------
     WORDS ON BUTTONS AND SCREENS
     {name}, {station}, {day}, {n}, {minutes} are filled in automatically.
     (Copied unchanged from the live file.)
     --------------------------------------------------------------------- */
  labels: {
    // Login and start
    login_lede: "Please sign in to begin.",
    start_button: "Start",
    // Buttons that move the candidate on
    continue: "Continue",
    start: "Start",                          // Project Introduction card
    start_project: "Start Project",          // last tutorial card; starts the clock
    start_day: "Start Day {n}",              // Day Goal card
    start_explore: "Start Explore",
    start_assign: "Start Assign",
    start_support: "Start Support",
    start_reflect: "Start Reflect",
    confirm_order: "Confirm Order",
    understood: "Understood",
    confirm_assignments: "Confirm Assignments",
    complete_reflect: "Complete Reflect",
    // Progress line and left column
    progress_tutorial: "Tutorial",
    progress_onboarding: "Onboarding",
    kicker_day: "Day {n}",                   // small heading above each stage intro card
    day_goal: "Day {day} Goal",
    stage: "Stage",
    phase_onboarding: "Onboarding",
    onboarding: "Onboarding",                // results and CSV section name
    phase_explore: "Explore",
    phase_assign: "Assign",
    phase_support: "Support",
    phase_reflect: "Reflect",
    // Onboarding ranking
    slot_1: "First Question",               // slot names on the ranking screen, one per onboarding question
    slot_2: "Second Question",
    slot_3: "Third Question",
    slot_4: "Fourth Question",
    drag_hint: "Drag a question into a slot, or click a question and then a slot.",
    move_up: "Move up",
    move_down: "Move down",
    // Explore
    explore_requests: "Explore Requests",
    ask_person_greeting: "Hello! I have time for one question today. What would you like to ask?",
    ask_no_points: "You have no Explore Requests left today.",
    never_mind: "Actually, never mind.",     // closes either question card in Explore
    cancel_pill: "Cancel",                   // closes the reason card in Assign
    cancel: "Cancel",                        // the Restart popup
    continue_pill: "Continue",
    // Assign
    assign_title: "Assign {name} to the {station}?",
    assign_reason_sub: "Choose the reason for this move.",
    station_full: "That Workstation is full. Move someone off it first.",
    assign_complete_title: "Assign Complete!",
    assign_complete_body: "Every Researcher now knows where they are working today.",
    not_placed: "Not placed",
    // Support
    support_request_title: "Support Request",
    support_request_body: "{name} would like your help with their work.",
    answer_request: "Answer Request",
    make_another_selection: "Make Another Selection",
    support_outcome_title: "What happened",      // only used when rules > show_support_outcomes is true
    support_close: "Back to the map",            // only used when rules > show_support_outcomes is true
    // Reflect
    idk: "I don't know",
    // Notes and Help
    notes: "Notes",
    help: "Help",
    close: "Close",
    notes_researchers: "Researchers",
    notes_workstations: "Workstations",
    notes_project: "Project",                    // only used when rules > notes_include_onboarding is true
    conversation_history: "Conversation History",
    no_history: "No conversation history recorded yet.",
    i_asked: "I asked",
    response: "Response",
    help_instructions: "This stage",
    help_definitions: "Key terms",
    // Clock
    timer_min: "min",
    timer_up: "Time's up",
    timer_paused: "Timer paused",
    time_warning_title: "Time remaining",
    time_warning_body: "{n} minutes left to complete the project.",
    time_warning_body_one: "1 minute left to complete the project.",   // used for the 1-minute note
    // Top-right tools
    restart: "Restart",
    restart_title: "Restart the simulation?",
    restart_body: "Your answers will be lost.",
    fullscreen: "Full Screen",
    exit_fullscreen: "Exit Full Screen",
    // End and results
    finish_title: "You have completed the simulation",
    finish_button: "See Your Results",
    finish_button_shell: "Finish",   // Full Mock Test only: the same button inside the Mock Test, where no results follow
    results_title: "Your result",
    print: "Print",
    csv: "Download CSV",
    tile_onboarding: "Onboarding",
    tile_explore: "Explore",
    tile_assign: "Assign",
    tile_support: "Support",
    tile_reflect: "Reflect",
    out_of: "out of {n}",
    late: "answered after time ran out",
    weighted_line: "Weighted score {n} / 100",
    time_left_line: "Finished with {n} min left",
    time_up_line: "Time ran out before the end; late answers are marked",
    your_answer: "Your answer",
    our_view: "Our view",
    not_answered: "Not answered",
    recommended_label: "Recommended",
    reason_flag: "you had not asked, on any day so far, what this reason relies on",
    reason_none: "no reason asked (not moved)",
    unused_points: "{n} Explore Request(s) not used",
    nothing_asked: "No questions asked",
    useful_yes: "worth asking",
    useful_no: "already clear from what was on screen",
    paired_yes: "working with {name}",
    paired_no: "should share a Workstation with {name}",
    cue_asked: "You asked {name} how they felt.",
    cue_support: "{name}'s Support request showed how they felt.",
    cue_none: "You had no information about how {name} felt today, so \"I don't know\" was the honest answer.",
    demo_note: "This is the free demo, which shows your score and percentile only. Our full simulations come with every answer explained in detail.",
    // CSV column and row names
    csv_section: "Section",
    csv_item: "Item",
    csv_your_answer: "Your answer",
    csv_our_view: "Our view",
    csv_points: "Points",
    csv_out_of: "Out of",
    csv_late: "Late",
    csv_total: "Total",
    csv_weighted: "Weighted score",
    csv_percentile: "Estimated percentile",
    csv_yes: "yes"
  },

  /* ---------------------------------------------------------------------
     START CARD (house card; the clock does not start here)
     --------------------------------------------------------------------- */
  start: {
    heading: "Sustainable Futures Lab",
    body: "This is a full mock sitting of the Sustainable Futures Lab, with a new project. You will lead a research team through a short tutorial, an onboarding step and three project days. Each day has four stages: Explore, Assign, Support and Reflect.\n\nYou will have {minutes} minutes once the project begins. The clock stays paused during the tutorial."
  },

  /* ---------------------------------------------------------------------
     TUTORIAL — five cards, clock paused. VERIFIED order and topics.
     The welcome card carries the new story; the other four are unchanged.
     --------------------------------------------------------------------- */
  tutorial: {
    welcome: {
      heading: "Welcome to the Lab",
      body: "Kell Marsh is a wide freshwater marsh at the foot of the hills, fed by three streams. Reed beds line its shore, and every spring grey herons return to nest in the alder trees along its western edge. The Sustainable Futures Lab studies how the marsh is changing and works with the village and the farms around it to protect what lives there.\n\nYou have joined the Lab as Team Leader. Over a three-day project, you will guide four Researchers as they work on a problem that threatens the marsh. Each day starts with a goal and has four stages: Explore, Assign, Support and Reflect.\n\nPress \"Continue\" for a short tour of the features you will use."
    },
    timer: {
      heading: "Timer",
      body: "The timer is paused while you read this tutorial.\n\nOnce the project begins it runs without stopping, and you cannot pause it. Your remaining time is shown in the top-left corner."
    },
    notes: {
      heading: "Notes",
      body: "Everything you learn in Explore is saved in your Notes: each question you asked and the answer you were given, sorted by Researcher and by Workstation.\n\nYou can review them whenever you like before making later decisions. Notes start empty each day. Open them from the bottom-left corner."
    },
    help: {
      heading: "Help Menu",
      body: "Help explains what to do in the stage you are on, and defines the key terms, such as Workstation and Explore Request.\n\nOpen it from the bottom-left corner, next to Notes."
    },
    complete: {
      heading: "Tutorial Complete",
      body: "Some situations will point to one clear answer. Others will need your judgement, so use what you learn about the Researchers as you go, and check your Notes first.\n\nAre you ready to join the Lab?\n\nWhen you press \"Start Project\", the project and your timer will start."
    }
  },

  /* ---------------------------------------------------------------------
     HELP PANEL — key terms (the current stage's instructions are added
     automatically). (Copied unchanged from the live file.)
     --------------------------------------------------------------------- */
  help: {
    definitions: [
      { term: "Researcher", meaning: "A member of your team, with their own role and strengths." },
      { term: "Workstation", meaning: "Where one kind of work happens. Holds up to two Researchers, or none." },
      { term: "Explore Request", meaning: "One question. You get a few each day." },
      { term: "Support Request", meaning: "A Researcher asking for your advice." },
      { term: "Notes", meaning: "What you learned in Explore today." }
    ]
  },

  /* ---------------------------------------------------------------------
     ONBOARDING — introduction, rank four questions, read the brief.
     The questions are general, not about the story (VERIFIED).
     recommended_position = our order; why = shown in the results.
     Our order: the problem -> the work -> the people -> how the day is judged.
     Each step depends on the one before it.
     --------------------------------------------------------------------- */
  onboarding: {
    intro_heading: "Project Introduction",
    intro: "Along Kell Marsh's northern shore, the reed beds are dying back, and the water has turned cloudy for the first time in years.\n\nThose reeds hold the shore mud in place and shelter the small fish the herons feed on. If the reeds keep failing, this spring's heron chicks may go hungry.\n\nThe Lab has been asked to find out what is going wrong and to protect the heronry.",
    rank_heading: "Prioritize Your Onboarding Brief",
    rank_instruction: "Your brief will answer the four questions below. Choose the order you want them answered in, from first to last.",
    brief_heading: "Onboarding Brief",
    questions: [
      { id: "ob-problem", recommended_position: 1,
        text: "What is the problem, and why does it matter now?",
        answer: "The reeds along the northern shore are dying back and the water is clouding. The team has looked at the streams, the farm ditches and the shore mud as causes; none is confirmed yet. The heron chicks are in the nests now and depend on the fish the reeds shelter, so the Lab has to act this season.",
        why: "Start with the problem and why it matters now: every later choice is measured against it." },
      { id: "ob-work", recommended_position: 2,
        text: "What work will the team do, and where?",
        answer: "Three jobs: settle why the reeds are failing, keep the chicks safe until they fledge, and keep the village and the farms informed. The work happens at four Workstations: the Reedbed and the Streams for the first job, the Heronry for the second, and the Village Workstation for the third.",
        why: "Next, what has to be done and where it happens: you can only place people once you know the work." },
      { id: "ob-team", recommended_position: 3,
        text: "Who is on the team, and what is each of them good at?",
        answer: "Your team: Soren (Hydrologist), Amara (Ornithologist), Ravi (Wetland Botanist) and Jonas (Field Technician). Their titles say what they trained in. What each is best at right now, you will learn by asking them.",
        why: "Once the problem and the work are clear, turn to the people who will do it." },
      { id: "ob-judge", recommended_position: 4,
        text: "How will I know whether each day has gone well?",
        answer: "Each day you will place the Researchers, advise them when they ask for help and, at the end, judge how each of them feels. Your results show how closely your choices matched what the team and the project needed.",
        why: "Judging the day depends on knowing the problem, the work and the people, so it comes last." }
    ]
  },

  /* ---------------------------------------------------------------------
     PEOPLE — the same four every day.
     good_stations = where they fit (placement points).
     pair_with     = who they should share a Workstation with (pair points). Leave it out if nobody.
     image         = optional picture file; null draws the house initials circle.
     --------------------------------------------------------------------- */
  people: [
    { id: "soren", name: "Soren", role: "Hydrologist", image: null,
      description: "Studies how water moves through streams and soil, and what it does to the roots of plants.",
      good_stations: ["streams", "reedbed"],    // either fits: water, mud and roots are his subject
      placement_why: "Soren's work is the meeting point of water, mud and roots, so he fits either the Streams or the Reedbed Workstation. He is happiest left to get on with it alone." },
    { id: "amara", name: "Amara", role: "Ornithologist", image: null,
      description: "Studies birds: how they nest, feed and raise their young.",
      good_stations: ["heronry"],
      pair_with: ["jonas"],                     // she reads the footage; Jonas records it
      placement_why: "Amara's gift is reading what the herons do and why; a camera that has stopped is not her problem to solve. Put her at the Heronry, where she can make sense of the footage Jonas brings in." },
    { id: "ravi", name: "Ravi", role: "Wetland Botanist", image: null,
      description: "Studies the plants of marshes and wet ground.",
      good_stations: ["village"],               // non-obvious: his title points to reed work, his strength is keeping the village informed
      placement_why: "Ravi trained as a botanist, but the village knows him and brings him its questions. Logging the farms' reports and answering them is what the Village Workstation needs right now, and nobody else on the team can do it as well." },
    { id: "jonas", name: "Jonas", role: "Field Technician", image: null,
      description: "Sets up and runs the cameras, loggers and traps the Lab uses in the field.",
      good_stations: ["heronry", "streams"],    // either fits his equipment skills
      pair_with: ["amara"],                     // he wants someone who can explain what the footage shows
      placement_why: "Jonas keeps the cameras and loggers running. His best place is the Heronry, beside Amara: he brings in the footage and she tells him what it means for the chicks." }
  ],

  /* ---------------------------------------------------------------------
     WORKSTATIONS — the same four every day.
     short  = the word on the Workstation's sign and badges
     icon   = leaf, drop, signal, paw, bird, sprout, wrench, chart, boat, document or chat
     colour = green, blue, amber, orange or purple
     --------------------------------------------------------------------- */
  stations: [
    { id: "reedbed", name: "Reedbed Workstation", short: "Reedbed", icon: "sprout", colour: "green", image: null,
      description: "Where Researchers grow and replant the reeds along the shore." },
    { id: "streams", name: "Streams Workstation", short: "Streams", icon: "drop", colour: "blue", image: null,
      description: "Where Researchers measure the water flowing into the marsh from the three streams." },
    { id: "village", name: "Village Workstation", short: "Village", icon: "chat", colour: "amber", image: null,
      description: "Where Researchers keep the village and the farms informed." },
    { id: "heronry", name: "Heronry Workstation", short: "Heronry", icon: "bird", colour: "purple", image: null,
      description: "Where Researchers watch over the herons and their nests." }
  ],

  map: { image: null },   // optional picture of the whole marsh; null draws our own map

  /* ---------------------------------------------------------------------
     THE THREE DAYS
     --------------------------------------------------------------------- */
  days: [

    /* === DAY 1 === */
    {
      id: "day1", name: "Day 1",
      goal_heading: "Day 1 Goal",
      goal: "Put each Researcher where today's work needs their skills and interests most.",
      phases: ["explore", "assign", "support", "reflect"],
      // THE STAGE INTRO CARDS ARE THE SAME ON EVERY DAY (the real game shows one fixed
      // text per stage). If you change one of these four texts, change it in Day 1,
      // Day 2 and Day 3 so all three stay identical. Nothing here may hint at the day's
      // own twist; the day-specific steer belongs in that day's "goal".
      intros: {
        explore: "Use your Explore Requests to learn about the Researchers and Workstations that matter for today's goal. Each request asks one Researcher or Workstation one question.\n\nWho and what you can ask changes from day to day.",
        assign: "Here is where each Researcher is working now.\n\nMove anyone you think should work somewhere else, using your goal, what you learned in Explore and what each Workstation needs.",
        support: "During the day, Researchers will come to you for advice on problems in their work. Each request describes a situation and offers several possible responses.\n\nChoose the response that helps them most. When more than one request is waiting, you decide which one to answer first.",
        reflect: "Before the day ends, think about how each Researcher is feeling. Use what they told you and how they came across in their requests today, and decide how each of them would describe their day."
      },
      instructions: {   // shown in the left column and in Help
        explore: "Click a Researcher or Workstation with a badge to ask one question. Each uses one Explore Request; each answers once a day. Answers go into your Notes.",
        assign: "Drag Researchers onto Workstations: up to two each, or none. Give a reason for every move. Everyone starts where their past experience put them; change anything today's work needs.",
        support: "Click a Researcher with an alert to open their request. Read the situation carefully, then choose the response that you think helps them and the project the most.",
        reflect: "Choose how each Researcher would finish the sentence, using what they told you and how they came across today. With nothing to go on, choose \"I don't know\"."
      },
      // Pair points are not scored on Day 1: neither person in the pair (Amara, Jonas), nor
      // either of their Workstations (Heronry, Streams), can be asked today, so the
      // candidate cannot know the pairing.
      score_pairs: false,
      explore_points: 3,   // 3 / 3 / 2, as in the live file
      available: { people: ["soren", "ravi"], stations: ["reedbed", "village"] },   // 2 people + 2 Workstations
      answers: {
        people: {
          soren: {
            feeling: { text: "I'm confident today. Two of the stream loggers are giving clean readings, and I'd happily spend the day at the Streams or along the reed beds, wherever the water meets the mud.",
                       useful: true, why: "Tells you Soren felt confident today, a cue for Reflect." },   // feeling answers are always useful: they give a mood cue
            working: { text: "Leave me with the readings for a few hours, then ask me what they say; I work fine alone. Water, mud and roots are my subject, streams or reed beds.",
                       useful: false, why: "Soren's role already told you where he fits; the request was better spent where the answer was open." }
          },
          ravi: {
            feeling: { text: "I'll admit I'm uneasy. The farms keep phoning about their ditches, each with a different story, and nothing is written down. If the council asks what we know, nobody could tell them.",
                       useful: true, why: "Tells you Ravi felt doubtful today, a cue for Reflect. It also hints that logging the farms' reports matters to him." },
            working: { text: "I grew up here, so the farmers ring me, not the Lab. What I do well is take their reports, log them and get back to them. Others can survey the reeds.",
                       useful: true, why: "Shows Ravi belongs at the Village Workstation, even though his title points to reed work." }
          }
        },
        stations: {
          reedbed: {
            work:  { text: "Researchers will set reed shoots in rows along the northern shore and measure the water around each row while the roots take. It is work for someone who reads water and mud.",
                     useful: false, why: "The Reedbed's description already told you this work, and Soren's role already fits it; nothing here changes a placement." },
            learn: { text: "The shoots that die first sit in the shallowest mud, where the water drains fastest after rain. Measuring that is one person's job with a water gauge, not a planting team's.",
                     useful: true, why: "Told you the Reedbed's job today is one person's with a water gauge, so Soren alone covers it and nobody else needs to join him there; nothing on screen said that." }
          },
          village: {
            // The description already says what this Workstation does, so "What work is planned" only repeats it.
            // "What have we learned" is the open question here.
            work:  { text: "Today, as every day, this Workstation keeps the village and the farms informed: questions come in by phone and at the door, answers go back out, and nothing may be missed.",
                     useful: false, why: "The Village Workstation's description already told you this; the request was better spent on the other Village question, or on Ravi." },
            learn: { text: "Last week's council questions went unanswered because nobody knew who had taken the call, and two farmers have since stopped sending reports. The farms talk to whoever they know and trust.",
                     useful: true, why: "Told you the Village Workstation needs someone the farms know and trust, which points to Ravi, who grew up there." }
          }
        }
      },
      // One Workstation with two, one empty. Two start in the right place (Soren, Amara), two do not (Jonas, Ravi).
      start_assignment: { reedbed: ["soren"], streams: [], village: ["jonas"], heronry: ["amara", "ravi"] },
      support_groups: [["d1-s1"], ["d1-s2"], ["d1-s3"], ["d1-s4"]],   // Day 1: one request at a time
      support: [
        { id: "d1-s1", person: "jonas", reveals_mood: false,
          // The anger here is the FARMER's, not Jonas's: his request shows nothing about how he feels.
          message: "The farmer nearest the marsh is furious. He wants the water logger off his main ditch by tomorrow because it sits where his tractor turns, and he has threatened to pull it out himself. That logger has recorded for three weeks and its readings matter for the ditch question.\n\nHow should I answer him?",
          options: [
            { id: "a", tier: "recommended", text: "Ask the farmer where on the ditch the tractor needs room, and agree a new spot together today that keeps the logger on that ditch and out of the tractor's way.",
              why: "Keeps the readings going and solves the farmer's real problem with them." },
            { id: "b", tier: "weak", text: "Tell the farmer the logger has to stay where it is, because three weeks of readings depend on it, and offer to put a marker post beside it so the tractor can steer round it.",
              why: "Too forceful: it refuses a farmer whose land the Lab works on, instead of finding a spot that suits both." }
          ] },
        { id: "d1-s2", person: "amara", reveals_mood: true,   // "I'm not sure I've read this right" = Doubtful
          message: "I'm not sure I've read this right. The nest cameras show two of the eleven nests empty this morning, but the volunteers' count from the hide says all eleven are still occupied. They post their count on the village board every evening, and tonight's goes up at six.\n\nWhat should I do before then?",
          options: [
            { id: "a", tier: "weak", text: "Spend tonight going back through every camera, nest by nest, until you are sure what happened to the two nests, and only then take it up with the volunteers.",
              why: "Waits too long: tonight's count goes up at six, before you have said a word, and it may be wrong." },
            { id: "b", tier: "recommended", text: "Go to the hide this afternoon with the footage, look at the two nests together with the volunteers, and settle between you what tonight's count should say.",
              why: "Raises the gap in time and settles it with the people who post the count." }
          ] },
        { id: "d1-s3", person: "soren", reveals_mood: true,   // "I'm confident in what the water is telling us" = Confident
          message: "I'm confident in what the water is telling us so far: two of the three streams run clear, and their readings hold steady week to week. The council wants a one-page summary of the water results for its meeting on Thursday, but the third stream's logger failed last week.\n\nHow should I write it up?",
          options: [
            { id: "a", tier: "recommended", text: "Report the two streams clearly, say plainly that the third stream's readings are missing and when they will be back, and offer to answer questions at the meeting on Thursday.",
              why: "Honest about the gap, and makes the results useful to the council on the day." },
            { id: "b", tier: "acceptable", text: "Send the council the two streams' readings as they stand, with a note that the third stream's logger failed and that its readings will follow once it is working again.",
              why: "Honest, but it hands over numbers without saying what they mean or offering to explain them." }
          ] },
        { id: "d1-s4", person: "ravi", reveals_mood: false,
          message: "The village school wants to bring a class of twenty to the Reedbed on Thursday to help with the planting. The reed team says Thursday is the only day the shoots can go in, and children would slow them down. Both have written to me twice today.\n\nHow should I settle this?",
          options: [
            { id: "a", tier: "weak", text: "Tell the school that Thursday is not possible and offer the class a visit to the hide next week instead, so the reed team can get the shoots in without delay.",
              why: "Looks tidy, but the school is never asked what the class needs from the day, so the teacher's side goes unheard." },
            { id: "b", tier: "recommended", text: "Ask the reed team what the children could safely do without slowing the planting, and the teacher what the class needs from the day, then propose a plan both can accept.",
              why: "Finds out what each side actually needs and builds an answer both can accept." }
          ] }
      ],
      reflect: {
        heading: "How would each Researcher finish this sentence?",
        prompt: "At the end of today, I feel…",
        options: [ { id: "low", label: "Doubtful" }, { id: "mid", label: "Neutral" }, { id: "high", label: "Confident" } ],   // Day 1 words, low to high (real game's words, VERIFIED)
        moods: { soren: "high", amara: "low", ravi: "low", jonas: "mid" },
        why: {   // shown in the results
          soren: "Soren said he was confident in Explore, and his Support request said he was confident in what the water was telling the team.",
          amara: "Amara's Support request began \"I'm not sure I've read this right\": she doubted her own work.",
          ravi: "Ravi told you in Explore that he was uneasy: nobody was logging what the farms reported.",
          jonas: "Jonas could not be asked today, and his request showed how the farmer felt, not how he felt."
        }
      }
    },

    /* === DAY 2 === */
    {
      id: "day2", name: "Day 2",
      goal_heading: "Day 2 Goal",
      goal: "Make sure Researchers who work better together share a Workstation today.",
      phases: ["explore", "assign", "support", "reflect"],
      // THE STAGE INTRO CARDS ARE THE SAME ON EVERY DAY (the real game shows one fixed
      // text per stage). If you change one of these four texts, change it in Day 1,
      // Day 2 and Day 3 so all three stay identical. Nothing here may hint at the day's
      // own twist; the day-specific steer belongs in that day's "goal".
      intros: {
        explore: "Use your Explore Requests to learn about the Researchers and Workstations that matter for today's goal. Each request asks one Researcher or Workstation one question.\n\nWho and what you can ask changes from day to day.",
        assign: "Here is where each Researcher is working now.\n\nMove anyone you think should work somewhere else, using your goal, what you learned in Explore and what each Workstation needs.",
        support: "During the day, Researchers will come to you for advice on problems in their work. Each request describes a situation and offers several possible responses.\n\nChoose the response that helps them most. When more than one request is waiting, you decide which one to answer first.",
        reflect: "Before the day ends, think about how each Researcher is feeling. Use what they told you and how they came across in their requests today, and decide how each of them would describe their day."
      },
      instructions: {
        explore: "Click a Researcher or Workstation with a badge to ask one question. Each uses one Explore Request; each answers once a day. Answers go into your Notes.",
        assign: "Drag Researchers onto Workstations: up to two each, or none. Give a reason for every move. Everyone starts where their past experience put them; change anything today's work needs.",
        support: "Click a Researcher with an alert to open their request. Read the situation carefully, then choose the response that you think helps them and the project the most.",
        reflect: "Choose how each Researcher would finish the sentence, using what they told you and how they came across today. With nothing to go on, choose \"I don't know\"."
      },
      explore_points: 3,
      available: { people: ["amara", "jonas"], stations: ["streams", "heronry"] },
      answers: {
        people: {
          amara: {
            feeling: { text: "I'm being pulled every way at once. This morning went on cameras that stopped overnight, up a ladder in the alders, when I should have been watching the herons.",
                       useful: true, why: "Tells you Amara felt unbalanced today, a cue for Reflect. It also shows that running equipment is not her best use." },
            working: { text: "Hand me a day's footage and a nest count and I'll tell you what the herons are doing. Someone else should keep the cameras running, and I'd like them working beside me.",
                       useful: true, why: "Shows Amara should be paired with someone who runs the equipment: Jonas." }
          },
          jonas: {
            feeling: { text: "Not bad, not good; an ordinary sort of day. The cameras are up and most are working. I'd rather be wherever the footage lands, with Amara to tell me what it shows.",
                       useful: true, why: "Tells you Jonas felt ordinary today, a cue for Reflect, and that he wants to be where the footage comes in, with Amara." },
            working: { text: "Cameras and loggers: give me kit to run and I'm content. What I can't do is tell a hungry chick from a sleepy one, so I want a bird expert beside me.",
                       useful: true, why: "Shows Jonas needs a bird expert beside him: Amara at the Heronry." }
          }
        },
        stations: {
          streams: {
            work:  { text: "Today is bottle work: a sample from each marked point on the three streams, morning and evening, labelled and boxed. Anyone careful can do it; it does not need a scientist.",
                     useful: true, why: "Told you the Streams need no specialist today, so nobody well placed elsewhere needs to move." },
            learn: { text: "The stream water tests all come back clean, so whatever is clouding the marsh is not coming in from the streams. What remains here is routine sampling anyone careful can do.",
                     useful: true, why: "Told you the streams are an unlikely cause and that the sampling needs no specialist, so nobody has to move to the Streams." }
          },
          heronry: {
            work:  { text: "Today's job is to go through every nest camera and decide which chicks are in trouble, too cold or too hungry. Hands for the cameras, eyes for the birds: two people.",
                     useful: true, why: "Shows the Heronry needs two people working together: Jonas for the cameras, Amara for the birds." },
            learn: { text: "Last night's wind damaged two nests, and by tonight the volunteers want to know which others to watch overnight. Pulling the footage is one job, reading it another; the Heronry needs both.",
                     useful: true, why: "Told you the Heronry needs someone for the cameras and someone for the birds at the same time, which points to Jonas with Amara." }
          }
        }
      },
      // One each. Two start in the right place (Soren, Amara), two do not (Ravi, Jonas).
      start_assignment: { reedbed: ["ravi"], streams: ["soren"], village: ["jonas"], heronry: ["amara"] },
      support_groups: [["d2-s1"], ["d2-s2", "d2-s3"], ["d2-s4"]],   // one, then two together, then one
      support: [
        { id: "d2-s1", person: "ravi", reveals_mood: false,   // nothing here shows how Ravi feels: he has no mood clue today
          message: "The council has asked to pin the Lab's weekly water readings on the village notice board, starting this Saturday. They are raw numbers, and last week's include a false spike from a failed logger, and nobody at the Lab has checked them yet. The council clerk would like an answer today.\n\nHow should I respond?",
          options: [
            { id: "a", tier: "recommended", text: "Agree, and offer to write a short weekly note for the board with the checked readings and one line on what they mean, so the village sees numbers it can trust.",
              why: "Gives the council what it asked for, in a form the village can read and trust." },
            { id: "b", tier: "acceptable", text: "Agree to pin the readings up each week once the Lab has taken out any failed-logger errors, with a line saying they are raw figures that nobody has yet explained.",
              why: "Safe, but it gives the village numbers without saying what they mean." },
            { id: "c", tier: "weak", text: "Ask the council to wait for the project's final report instead, so the village gets one clear answer rather than weekly numbers that may change or turn out to be wrong.",
              why: "Waits too long: the council asked to keep the village informed now, and silence until the report leaves people guessing for weeks." }
          ] },
        { id: "d2-s2", person: "amara", reveals_mood: true,   // "I'm swamped", can't keep up = Unbalanced
          message: "I'm swamped. The volunteers want a note on each of the eleven nests for the hide logbook by tonight, and I promised the school a talk at five that I can't move. A proper note on a nest takes me most of an hour, and there are eleven of them.\n\nWhat should I do?",
          options: [
            { id: "a", tier: "weak", text: "Write the eleven notes properly tomorrow and hand the logbook back then, since a rushed note on a nest is worse than no note at all for the volunteers reading it.",
              why: "Waits too long: the volunteers watch the nests tonight on what the logbook tells them, and tonight it would tell them nothing." },
            { id: "b", tier: "recommended", text: "Ring the volunteers now, ask which nests they need notes on for tonight's watch, write those before five, and agree with them when the rest will follow.",
              why: "Gets the volunteers what they need tonight and settles the rest with them, without Amara breaking her word to the school." },
            { id: "c", tier: "acceptable", text: "Write a short line on every nest, two or three sentences each, so the logbook has something on all eleven by five, and offer the volunteers fuller notes tomorrow.",
              why: "Reasonable, but it decides alone what the volunteers get tonight instead of asking which nests matter." }
          ] },
        { id: "d2-s3", person: "soren", reveals_mood: false,
          message: "Our water-level readings so far point to the farm ditches as the likeliest cause of the reed die-back, but we have only three weeks of readings. Another farmer, the one who dug the newest ditch, sits on the council, and today he asked me whether the Lab blames his ditch.\n\nWhat should I tell him?",
          options: [
            { id: "a", tier: "recommended", text: "Tell him what three weeks of readings can and cannot show, that the Lab is not blaming anyone yet, and invite him to see the loggers and the readings for himself.",
              why: "Honest about the evidence, and brings him into the work instead of leaving him to guess." },
            { id: "b", tier: "weak", text: "Tell him the readings do point to his ditch, and that the farm should block it before the autumn rains, so the water level along the shore does not drop any further.",
              why: "Too forceful for three weeks of readings: it blames him and tells him what to do before the evidence is in." },
            { id: "c", tier: "weak", text: "Tell him you will give him an answer once the Lab has a full season of readings from that stretch, so you never say anything you might have to take back.",
              why: "Waits too long: a council member left without an answer for a season will draw his own conclusions." }
          ] },
        { id: "d2-s4", person: "jonas", reveals_mood: false,
          message: "The water loggers need new batteries every ten days. I've done it so far, but now that the cameras take up my days I can't get round all twelve. The reed team says it isn't their job and the Streams sampling team says the same. Two loggers have already stopped.\n\nWhat should I do?",
          options: [
            { id: "a", tier: "weak", text: "Add the battery round to the Streams team's sampling walk, since they pass every logger twice a day anyway, and let them know it starts on Monday.",
              why: "Practical, but it decides for the Streams team without asking them, so their side is never heard." },
            { id: "b", tier: "recommended", text: "Get both teams in a room, show them what the loggers record and why each team relies on it, and agree a rota between the three of you that starts this week.",
              why: "Uses the shared need to reach a rota that both teams own." },
            { id: "c", tier: "acceptable", text: "Take one morning off the cameras this week to do the battery round yourself, and raise the question at Friday's team meeting so a rota can be agreed.",
              why: "Keeps the loggers running, but it takes Jonas off the cameras and leaves the question open until Friday." }
          ] }
      ],
      reflect: {
        heading: "How would each Researcher finish this sentence?",
        prompt: "At the end of today, I feel…",
        options: [ { id: "low", label: "Unbalanced" }, { id: "mid", label: "Neutral" }, { id: "high", label: "Balanced" } ],   // Day 2 words (real game's words, VERIFIED)
        moods: { soren: "mid", amara: "low", ravi: "mid", jonas: "mid" },   // two people have no clue today (Soren, Ravi): two "I don't know"s
        why: {
          soren: "Soren could not be asked today, and his request did not show how he felt.",
          amara: "Amara said she was being pulled every way at once in Explore, and her Support request began \"I'm swamped\".",
          ravi: "Ravi could not be asked today, and his request was about the council's notice board; it did not show how he felt.",
          jonas: "Jonas told you in Explore that today felt ordinary."
        }
      }
    },

    /* === DAY 3 === */
    {
      id: "day3", name: "Day 3",
      goal_heading: "Day 3 Goal",
      // The Daily Goal carries the only day-specific steer (the stage intro cards must stay identical).
      goal: "Turn what the team has found into a recovery plan for the marsh. Some Workstations' work has changed today.",
      phases: ["explore", "assign", "support", "reflect"],
      // THE STAGE INTRO CARDS ARE THE SAME ON EVERY DAY (the real game shows one fixed
      // text per stage). If you change one of these four texts, change it in Day 1,
      // Day 2 and Day 3 so all three stay identical. Nothing here may hint at the day's
      // own twist; the day-specific steer belongs in that day's "goal".
      intros: {
        explore: "Use your Explore Requests to learn about the Researchers and Workstations that matter for today's goal. Each request asks one Researcher or Workstation one question.\n\nWho and what you can ask changes from day to day.",
        assign: "Here is where each Researcher is working now.\n\nMove anyone you think should work somewhere else, using your goal, what you learned in Explore and what each Workstation needs.",
        support: "During the day, Researchers will come to you for advice on problems in their work. Each request describes a situation and offers several possible responses.\n\nChoose the response that helps them most. When more than one request is waiting, you decide which one to answer first.",
        reflect: "Before the day ends, think about how each Researcher is feeling. Use what they told you and how they came across in their requests today, and decide how each of them would describe their day."
      },
      instructions: {
        explore: "Click a Researcher or Workstation with a badge to ask one question. Each uses one Explore Request; each answers once a day. Answers go into your Notes.",
        assign: "Drag Researchers onto Workstations: up to two each, or none. Give a reason for every move. Everyone starts where their past experience put them; change anything today's work needs.",
        support: "Click a Researcher with an alert to open their request. Read the situation carefully, then choose the response that you think helps them and the project the most.",
        reflect: "Choose how each Researcher would finish the sentence, using what they told you and how they came across today. With nothing to go on, choose \"I don't know\"."
      },
      explore_points: 2,
      available: { people: ["jonas", "soren"], stations: ["reedbed", "heronry"] },   // 2 + 2, as in the live file
      answers: {
        people: {
          jonas: {
            feeling: { text: "Today I'm itching to build. The footage shows which nests the wind catches, and I can shelter them, as long as Amara is beside me to say what the birds will tolerate.",
                       useful: true, why: "Tells you Jonas felt energised today, a cue for Reflect, and confirms he should work with Amara." },
            working: { text: "Give me a drawing and a toolbox and it's up by dark. Cameras, loggers, shelters: if it has to be built or fixed in the field, that's my job.",
                       useful: false, why: "Jonas's role already told you he builds and runs the Lab's field kit; the request was better spent on a Workstation whose work has changed." }
          },
          soren: {
            feeling: { text: "Steady, I'd say. The readings are behaving and the mud is where I left it. Another day at the Streams or down among the reeds and the water-level work will be finished.",
                       useful: true, why: "Tells you Soren felt steady today, a cue for Reflect, and that he wants to stay at the Streams or the Reedbed." },
            working: { text: "Today I'd rather be at the reed beds than the Streams: the rows need their water measured again before anything new is planted, and I work best left to it.",
                       useful: true, why: "Told you Soren wants the Reedbed today; either of his Workstations still scores, but this backs \"Researcher preference\" for a move to the Reedbed." }
          }
        },
        stations: {
          reedbed: {
            work:  { text: "No planting today. The survival records are in, and the job is choosing which reed varieties to try next, and where. That needs a botanist who knows marsh plants.",
                     useful: true, why: "Shows the Reedbed needs a botanist today: Ravi belongs at the Reedbed now, not at the Village Workstation." },
            learn: { text: "The rows that kept their water through the dry spell kept their reeds; the rows that drained lost them. Choosing hardier varieties for the drained rows is botany, and it starts today.",
                     useful: true, why: "Told you the Reedbed's work today is choosing reed varieties, which is botany: Ravi belongs there today, not at the Village Workstation." }
          },
          heronry: {
            work:  { text: "Storms are forecast for next week, so we design shelters to fit above the exposed nests. A technician has to build them, with a bird expert saying what the herons will accept.",
                     useful: true, why: "Shows the Heronry needs Jonas and Amara together." },
            learn: { text: "Until they fledge in two weeks, a storm can tip chicks out of an exposed nest. The shelters must go up this week: a technician to build, a bird expert beside him.",
                     useful: true, why: "Told you the shelters must go up this week, built by a technician with a bird expert: Jonas with Amara." }
          }
        }
      },
      // Day 3's own insight: Ravi's best fit moves to the Reedbed.
      // The change only counts against the candidate if today's Explore told them about it.
      //   good_stations_override   = where the person fits today, INSTEAD of their usual good_stations
      //   override_revealed_by     = what the candidate must have asked TODAY for the change to apply.
      //                              Same shape as a reason's "needs", but each entry names its own id.
      //                              Leave it out and the change always applies.
      //   placement_why_override   = the results explanation when the change was revealed
      //   placement_why_unrevealed = the results explanation when it was not (no second penalty)
      good_stations_override: { ravi: ["reedbed"] },
      override_revealed_by:   { ravi: [{ target: "station", id: "reedbed", questions: ["work", "learn"] }] },
      placement_why_override: {   // shown in the results instead of the person's usual placement_why
        ravi: "Today the Reedbed is choosing which reed varieties to try next, from the survival records, which is botany, so Ravi fits the Reedbed and the Village Workstation no longer needs him most. You asked the Reedbed today, so you were told this before you decided."
      },
      placement_why_unrevealed: {   // shown when nothing the candidate asked today revealed the change
        ravi: "Nothing you asked today showed that the Reedbed's work had changed, so the Village Workstation was right on what you knew, and this row is marked against the Village Workstation. Had you asked the Reedbed what work is planned, you would have learned that today it chooses which reed varieties to try next, which is botany, and that Ravi fits there."
      },
      // Two start in the right place (Jonas, Amara), two do not (Ravi, Soren). Repeating Day 2's answer is not enough.
      start_assignment: { reedbed: [], streams: ["jonas"], village: ["ravi"], heronry: ["amara", "soren"] },
      support_groups: [["d3-s1", "d3-s2"], ["d3-s3", "d3-s4"], ["d3-s5"]],   // two, two, one
      support: [
        { id: "d3-s1", person: "jonas", reveals_mood: true,   // "I can't wait to start" = Energised
          message: "I can't wait to start: the shelter design is finished and fitting could begin tomorrow. The owner of the land the alders stand on has just heard of it, and she is upset nobody asked her. She says no one goes up those trees until she has seen the plan.\n\nHow should I handle this?",
          options: [
            { id: "a", tier: "recommended", text: "Go and see her today with the design, ask what she needs to know and what worries her, and agree with her how and when the fitting goes ahead on her land.",
              why: "Puts right the missed step, listens to her, and decides the fitting with her rather than around her." },
            { id: "b", tier: "acceptable", text: "Phone her today to apologise for the missed step, tell her what the shelters are for, and offer to drop the plan round so she can read it before anything starts.",
              why: "Mends the relationship and gives her the plan, but it does not ask what worries her or agree the fitting with her." },
            { id: "c", tier: "weak", text: "Explain to her that the Lab has the council's permission for work at the heronry and that fitting starts tomorrow as planned, then send her the schedule so she knows.",
              why: "Too forceful: it pulls rank on the person whose land the trees stand on, instead of involving her." },
            { id: "d", tier: "weak", text: "Put the fitting off until she has had time to read the plan and come back to you, however long that takes, so nothing happens on her land without her agreement.",
              why: "Waits too long: the storms are forecast for next week, and an open-ended wait leaves the nests exposed." }
          ] },
        { id: "d3-s2", person: "ravi", reveals_mood: true,   // "I'm running on empty" = Drained
          message: "I'm running on empty. The farmers' cooperative has called a meeting for tomorrow evening and wants the Lab to say, in front of everyone, whether the ditches should close. The reed team says yes, now; the cooperative chair says not before the harvest; both expect me to speak for them.\n\nWhat should I bring?",
          options: [
            { id: "a", tier: "weak", text: "Take the reed team's answer, since the readings back it, and tell the meeting the Lab's view is that the ditches should close now, with the figures to show why.",
              why: "Has the evidence behind it, but it picks a side before the farmers have been heard, so they are left out of a decision about their own land." },
            { id: "b", tier: "recommended", text: "Take the readings and a short list of what each side needs, and ask the meeting to agree what a plan must achieve before anyone votes on when the ditches close.",
              why: "Brings the facts and both sides' needs, and gets the room to agree the goal before the argument about dates." },
            { id: "c", tier: "acceptable", text: "Take a proposal of your own: close the oldest ditch now and the two newest after the harvest, and invite the meeting to pick it apart before anything is decided.",
              why: "A fair middle and open to challenge, but a compromise written alone may suit neither side's real need." },
            { id: "d", tier: "weak", text: "Tell the meeting the readings leave no room for debate, that the ditches must close this week whatever the harvest needs, and that the Lab will say so to the council.",
              why: "Too forceful: three weeks of readings do not settle it, and the farms are told rather than asked about their own ditches." }
          ] },
        { id: "d3-s3", person: "soren", reveals_mood: false,
          message: "The district water office has offered to raise the marsh's outlet weir by twenty centimetres next week, lifting the water level along the northern shore. My readings say that would help the reeds, but the two lowest farms would get wetter field edges. The office wants our answer by Friday.\n\nWhat should I tell them?",
          options: [
            { id: "a", tier: "recommended", text: "Tell the office the readings support a higher weir, say the two lowest farms must be shown what it means for their fields first, and offer to arrange that before Friday.",
              why: "Backs the evidence, and brings in the two farms who carry the cost before the answer goes back." },
            { id: "b", tier: "acceptable", text: "Ask the office whether the weir could go up in two steps of ten centimetres, so the Lab can measure the effect on the farms' fields before the second step.",
              why: "Careful and reasonable, but it still does not bring the two farms into the decision." },
            { id: "c", tier: "weak", text: "Tell the office yes before Friday, since the readings are clear and the offer may not come again, and let the two farms know once the date for the work is fixed.",
              why: "Leaves the two farms out: it decides for them and tells them afterwards, when the wetter fields are their cost." },
            { id: "d", tier: "weak", text: "Ask the office to hold its offer until the Lab's report is finished, so the decision rests on a full season of readings rather than on three weeks of them.",
              why: "Waits too long: the office offered now, and the reeds are failing now." }
          ] },
        { id: "d3-s4", person: "jonas", reveals_mood: false,   // Jonas's second request today (one person can ask twice)
          message: "To fit the shelters someone has to climb the alders, and the adults leave the nests while anyone is in the tree. The volunteers want to do all eleven nests tomorrow morning. Amara says that leaves the chicks uncovered too long, but she can't plan it with them today.\n\nHow should I plan it?",
          options: [
            { id: "a", tier: "recommended", text: "Agree with Amara how long a nest can safely be left, then set the order and timing of the climbs with the volunteers around that, over two or three short sessions.",
              why: "Gets the bird expert's limit first, then plans the work with the people doing it." },
            { id: "b", tier: "acceptable", text: "Split the fitting over three mornings, three or four nests each, and ask Amara to watch the cameras on the first morning and stop the work if the adults stay away too long.",
              why: "Sensible, but it fixes the plan before Amara has said what the chicks can take." },
            { id: "c", tier: "weak", text: "Tell the volunteers it will be done Amara's way or not at all, and send them a schedule of short sessions to follow, since the chicks' safety is not up for discussion.",
              why: "Too forceful: it dictates to the volunteers who will do the climbing, instead of planning it with them." },
            { id: "d", tier: "weak", text: "Put the fitting back until Amara has a free day to plan it with the volunteers herself, so the climbs are done right the first time and nobody is rushed.",
              why: "Waits too long: the storms are forecast for next week, and a free day may not come before them." }
          ] },
        { id: "d3-s5", person: "amara", reveals_mood: false,   // The anger here is the VOLUNTEERS', not Amara's: her request shows nothing about how she feels.
          message: "The Heronry volunteers are up in arms. A photographer has been flying a drone over the nest trees, the council has shared his footage online, and twice this week our cameras show the adults leaving the nests as it passes. He has offered the Lab free use of the footage.\n\nHow should I handle this?",
          options: [
            { id: "a", tier: "acceptable", text: "Thank the photographer for the offer, and ask him to stop flying over the nest trees until the chicks have fledged, explaining that the adults leave the nests when it passes.",
              why: "Deals with the risk, but it tells rather than asks, and offers the photographer nothing in return." },
            { id: "b", tier: "recommended", text: "Thank the photographer, show him the footage of the adults leaving the nests, and agree together where and when the drone can fly without disturbing the herons.",
              why: "Keeps his goodwill and protects the nests by deciding together." },
            { id: "c", tier: "weak", text: "Ask the council to ban drones over the marsh until the chicks have fledged, and tell the photographer the Lab cannot use footage that was taken over the nests.",
              why: "Too forceful: it goes over the photographer's head before anyone has spoken to him." },
            { id: "d", tier: "weak", text: "Keep watching the cameras for another week to be sure the drone is the cause, before you raise it with the photographer or the council.",
              why: "Waits too long: twice in a week is already a risk to the chicks." }
          ] }
      ],
      reflect: {
        heading: "How would each Researcher finish this sentence?",
        prompt: "At the end of today, I feel…",
        options: [ { id: "low", label: "Drained" }, { id: "mid", label: "Neutral" }, { id: "high", label: "Energised" } ],   // Day 3 words: our own (the real ones were never photographed); different from the live file's and the teaching copy's
        moods: { soren: "mid", amara: "mid", ravi: "low", jonas: "high" },
        why: {
          soren: "Soren told you in Explore that he felt steady.",
          amara: "Amara could not be asked today, and her request showed how the volunteers felt, not how she felt.",
          ravi: "Ravi's Support request began with \"I'm running on empty\".",
          jonas: "Jonas said he was itching to build in Explore, and his first Support request began \"I can't wait to start\"."
        }
      }
    }
  ]
};

/* ==========================================================================
   WORKED MARKING EXAMPLE (Day 2) - how the rules above turn choices into points.
   Written in the same style as the live file's example, for tools/test-marking.js
   (that script names the live scenario's people and Workstations; point it at
   this file and use the ids below).

   EXPLORE (3 requests). The candidate asks:
     Amara   "How are you feeling..."   useful: true                   -> 1
     Jonas   "How are you feeling..."   useful: true                   -> 1
     Streams "What work is planned..."  useful: true                   -> 1
     Explore = 3 out of 3.
     (Every answer on Day 2 is worth asking. The four answers in the whole file
      that are not are Day 1 Soren "How do you like to work", Day 1 Reedbed
      "What work is planned", Day 1 Village "What work is planned" and Day 3
      Jonas "How do you like to work": each one only repeats what the role text
      or the Workstation's description already said on screen.)

   ASSIGN. Day 2 starts: Reedbed Ravi - Streams Soren - Village Jonas - Heronry Amara.
   The candidate moves:
     Jonas  -> Heronry, reason "Latest workstation needs"
              (needs a question to the Heronry Workstation; on Day 1 it could not be
               asked and today only the Streams were asked, so it is NOT honest: the
               results say "you had not asked, on any day so far, what this reason relies on")
     Ravi   -> Village, reason "Workstation coverage"  (needs nothing: honest)
     Soren and Amara are left where they are (already well placed, so no reason is asked).
   Points (placement 1 + pair 0.5 if they share a GOOD Workstation with their pair + reason 0.5):
     Soren  Streams is a good fit 1 + no pair_with (0 of 0) + left well placed 0.5 = 1.5 of 1.5
     Amara  Heronry 1 + shares it with Jonas 0.5 + left well placed 0.5          = 2   of 2
     Jonas  Heronry 1 + shares it with Amara 0.5 + not honest 0                  = 1.5 of 2
     Ravi   Village 1 + no pair_with + honest 0.5                                = 1.5 of 1.5
     Assign = 6.5 out of 7. (One pair, Amara and Jonas, earns the pair bonus for both.)
     Day 1 is different: it has score_pairs: false, so no pair bonus is scored at
     all and Day 1's Assign is out of 6, not 7. Day 3 is out of 7 like Day 2.

   SUPPORT. The recommended option on all four requests: 4 out of 4.

   REFLECT. True moods: Amara Unbalanced, Jonas Neutral, Ravi Neutral, Soren Neutral.
     Amara: two cues (asked how she felt + her mood-revealing request). Answer Unbalanced -> 1 of 1
     Jonas: one cue (asked how he felt). Answer Balanced (wrong)                  -> 0 of 1
     Ravi:  no cue (not askable; his request shows nothing about how he feels).
            Answer "I don't know"                                                  -> 1 of 1
     Soren: no cue (not askable, his request reveals nothing). Answer Neutral.
            Right mood, but he gave no sign of it; "I don't know" was expected    -> 0 of 1
     Reflect = 2 out of 4. (Day 2 has two people with no clue at all, so two
     "I don't know"s is the full-marks answer for them.)

   THE DAY 3 CHANGE, IN ONE LINE. On Day 3 Ravi's best fit moves to the Reedbed,
   but only for a candidate who asked the Reedbed something today. Ask it and
   leaving him at the Village Workstation scores 0; do not ask it and the Village
   Workstation still scores 1, and the results say what asking would have told
   them. Not asking the Reedbed never costs the placement point: on what the
   candidate knew, the Village Workstation was right.
   ========================================================================== */
