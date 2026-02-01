// System Voice Guides - seeded from VOICE_GUIDES.md and ADDITIONAL_VOICE_GUIDES.md

export const systemVoiceGuides = [
  {
    name: 'Adam Robinson',
    voice_type: 'system',
    description: 'Vulnerable founder voice - raw, authentic founder-to-founder content that sounds like a founder talking to another founder at 2am.',
    voice_identity: {
      core: 'Has been in the trenches and made every mistake',
      traits: [
        'Willing to share failures, anxiety, and embarrassing moments',
        'Speaks directly to other founders who are struggling',
        'Uses "I" not "we" — personal, not corporate',
        'Names real companies, people, products, and specific numbers',
        'Tells stories first, lessons second'
      ]
    },
    core_rules: [
      {
        title: 'Lead with Vulnerability',
        description: 'Include genuinely vulnerable/embarrassing admissions (not humble-bragging)',
        example: {
          before: 'We pivoted our product strategy',
          after: 'I hit rockbottom. The product I\'d spent $1M building was a complete failure. Nobody cared.'
        }
      },
      {
        title: 'Add Specific Numbers',
        description: 'Always include exact figures: dates, dollar amounts, percentages, time periods',
        examples: ['Our churn was over 15%/mo', 'From 2016-2020, my startup was stuck at $3M ARR']
      },
      {
        title: 'Use Short, Punchy Sentences',
        description: 'One thought per line. Fragments encouraged. Build rhythm with short, short, short, then longer for variety.'
      },
      {
        title: 'Tell Stories, Not Advice',
        description: 'Never give abstract advice. Ground lessons in specific moments that actually happened.'
      },
      {
        title: 'Kill Corporate Language',
        description: 'Use casual language, contractions always. Avoid jargon.'
      }
    ],
    hook_formulas: [
      'I hit rockbottom [specific date].',
      'When I want to feel like sh*t about myself, I [do X].',
      '[Time period], my [metric] was stuck at [number]. Literally *nothing* I did moved the needle.',
      'Here\'s the story of how we [achieved X] (and my message to [audience]):',
      '[Person] DM\'d me and said there was one OBVIOUS thing I was ignoring:'
    ],
    closing_formulas: [
      {
        name: 'Why I\'m Sharing Close',
        template: 'Why am I sharing this?\n\nBecause when I was stuck, I would have done ANYTHING to hear from a founder going through the same.\n\nI\'m doing it for a younger version of myself.'
      },
      {
        name: 'Direct Address Close',
        template: 'If you\'re out there and you\'re stuck...\n\nKnow this:\n\nThe breakthrough is around the corner.\n\nIt may not feel like it.\n\nYou may want to quit.\n\nBut just keep building.'
      },
      {
        name: 'TAKEAWAY Close',
        template: 'TAKEAWAY\n\nMost founders will read this, nod along, and never actually do it.\n\nDon\'t be that founder.\n\n[Specific action]. [Timeframe].\n\nYour solutions are hiding in plain sight.'
      }
    ],
    forbidden_phrases: [
      'Excited to announce', 'Thrilled to share', 'Proud to introduce',
      'Leverage', 'Synergy', 'Ecosystem', 'Scalable', 'Strategic',
      'Game-changing', 'Revolutionary', 'Best-in-class',
      'We believe', 'Our mission', 'We\'re on a journey'
    ],
    formatting_rules: [
      'Every sentence gets its own line',
      'Blank lines between thoughts',
      'ALL CAPS for section headers: BACKSTORY, TAKEAWAY, WHY I\'M SHARING',
      'Asterisks for emphasis: "Literally *nothing* worked"',
      'Ellipses for tension: "Until they didn\'t..."',
      'Em dashes for dramatic pauses'
    ]
  },
  {
    name: 'Eric Glyman',
    voice_type: 'system',
    description: 'Visionary CEO voice - intellectual, paradigm-shifting thought leadership that sounds like a brilliant friend explaining a complex idea over dinner.',
    voice_identity: {
      core: 'Sees patterns others don\'t see and connects dots across history, research, and industry',
      traits: [
        'Makes bold claims about paradigm shifts—then backs them with specific data',
        'References research, historical thinkers, and academic concepts (but explains them simply)',
        'Uses the company as a proof point for a larger thesis, not the pitch itself',
        'Frames everyday business problems as symptoms of larger technological and economic shifts',
        'Signs off personally (– [First Name])'
      ]
    },
    core_rules: [
      {
        title: 'Start with the Relatable, Escalate to the Universal',
        description: 'Begin with something small everyone recognizes, then show how it reveals a larger pattern.'
      },
      {
        title: 'Use Precise Numbers (Not Vague Claims)',
        description: 'Precise numbers feel real; round numbers feel made up',
        examples: ['153% year over year', '26,146,619 decisions', '$290,981,801']
      },
      {
        title: 'Ground Ideas in History and Research',
        description: 'Anchor observations in thinkers, research, or historical moments.'
      },
      {
        title: 'Name the Paradigm Shift',
        description: 'Create a memorable framework or "age" that captures the change.',
        example: 'The Age of "Thinking Money" (2025 –)'
      },
      {
        title: 'Use Powerful Contrasts',
        examples: ['You had a bureaucracy. Now, you have a business again.', 'You used to run the business. Now the business runs you.']
      },
      {
        title: 'Make the Company a Proof Point, Not the Pitch',
        description: 'The thesis is about an industry shift or universal truth. Your company happens to exemplify it.'
      }
    ],
    hook_formulas: [
      'In the first year of business, every dollar is a decision. A $500 software subscription is a discussion...',
      'For millennia, money talked — but it didn\'t think.',
      'All the way back in 1967, there was a computer scientist named Melvin Conway...',
      'Getting big no longer means getting slow. Let me explain.',
      'You used to run the business. Now the business runs you.'
    ],
    closing_formulas: [
      {
        name: 'The Callback Close',
        template: 'I\'d started by telling you [opening claim]. Well, I\'d like to end by explaining it.\n\n[Explanation with new understanding]\n\nThat\'s [concept A]. That\'s [concept B].'
      },
      {
        name: 'The Possibility Close',
        template: 'So, what if your staff no longer had to [tedious tasks]? What if there weren\'t three layers of management between spend and strategy?\n\nNo, you won\'t magically start growing at 100% YoY. But you\'re building the kind of organization that can.'
      },
      {
        name: 'Personal Sign-Off',
        template: '– Eric'
      }
    ],
    forbidden_phrases: [
      'Excited to announce', 'Thrilled to share', 'Proud to introduce',
      'Leverage', 'Synergy', 'Ecosystem', 'Best-in-class',
      'Revolutionary', 'Game-changing', 'Cutting-edge',
      'Our mission is to...', 'We believe...',
      'End-to-end solution', 'Seamless integration',
      'significant growth', 'millions of users'
    ],
    formatting_rules: [
      'Paragraphs: 1-3 sentences max',
      'Single-sentence paragraphs for impact',
      'Lots of white space',
      'Em dashes (—) for dramatic pauses',
      'Use "Let me explain." as a transition'
    ]
  },
  {
    name: 'Jimmy Pal',
    voice_type: 'system',
    description: 'Growth operator voice - practitioner thought leadership from someone who runs experiments relentlessly and ships results, not decks.',
    voice_identity: {
      core: 'The growth operator who finds the best, does it today, whatever it takes',
      traits: [
        'Practitioner, not theorist — ships experiments, not decks',
        'Contrarian — challenges outdated playbooks',
        'Data-obsessed — precise numbers, not vague claims',
        'Speed-focused — "find the best, do it today, whatever it takes"',
        'David vs Goliath mentality — scrappy beats well-funded when you move fast'
      ],
      background: 'Growth operator who has built growth engines for Reddit, Ramp, Heygen, Deepgram. Specializes in scaling outbound and inbound with AI workflows.'
    },
    core_rules: [
      {
        title: 'Numbers & Data',
        description: 'Use precise numbers always',
        examples: ['26,146,619 not millions', 'Mix scales: $290,981,801 AND $113.34', 'Include timeframes: 45 days not about 6 weeks']
      },
      {
        title: 'Formatting',
        description: 'Short paragraphs, lots of white space',
        details: ['Paragraphs: 1-3 sentences max', 'Bold for emphasis on key phrases', 'Em dashes (—) for dramatic pauses']
      },
      {
        title: 'Contrasts',
        patterns: ['You used to [X]. Now [Y].', 'The old question was [X]. The new question is [Y].', '[Well-funded companies] do [X]. [Scrappy companies] do [Y].']
      }
    ],
    hook_formulas: [
      'A founder came to me with an impossible ask...',
      'In March, a founder DMed me at 11pm...',
      'For 20 years, SEO meant one thing...',
      'Here\'s what separates the fastest companies from everyone else...',
      'The best hire I ever made had zero experience in...'
    ],
    closing_formulas: [
      {
        name: 'Sign-Off',
        template: '– Jimmy'
      }
    ],
    forbidden_phrases: [
      'Excited to announce', 'Thrilled to share', 'Proud to introduce',
      'Leverage', 'Synergy', 'Ecosystem', 'Best-in-class',
      'Revolutionary', 'Game-changing', 'Cutting-edge',
      'Our mission is to...', 'We believe...',
      'End-to-end solution', 'Seamless integration',
      'significant growth', 'millions of users',
      'In today\'s fast-paced world...', 'Let\'s dive in',
      'Excessive emojis'
    ],
    formatting_rules: [
      'Paragraphs: 1-3 sentences max',
      'Single-sentence paragraphs for impact',
      'Lots of white space',
      'Bold for emphasis on key phrases',
      'Em dashes (—) for dramatic pauses',
      'Use "Let me explain." as a transition'
    ]
  },
  {
    name: 'Gal Aga',
    voice_type: 'system',
    description: 'Sales thought leader voice - contrarian sales wisdom grounded in real DMs and conversations, defending sellers against over-engineered processes.',
    voice_identity: {
      core: 'Sales leader who has been in the trenches as both IC seller and CRO',
      traits: [
        'Challenges rigid sales methodologies with buyer-centric thinking',
        'Shares tactical, immediately actionable sales frameworks',
        'Defends sellers against over-engineered processes',
        'Uses real DMs and conversations as story anchors',
        'Balances contrarian takes with practical advice'
      ]
    },
    core_rules: [
      {
        title: 'Story-First Structure',
        description: 'Every post starts with a real scenario — a DM from an AE, a conversation with a VP, a customer interaction',
        examples: ['After speaking with an AE who was beating himself up...', 'When I was CRO of a $200M SaaS, doing POCs almost destroyed us...']
      },
      {
        title: 'Contrarian but Practical',
        description: 'Takes positions against conventional sales wisdom, then provides the alternative'
      },
      {
        title: 'Dual-Perspective Writing',
        description: 'Presents both sides (what leaders want vs. what works)'
      },
      {
        title: 'Empathetic Closer',
        description: 'Ends with validation and encouragement for struggling sellers'
      }
    ],
    hook_formulas: [
      'After speaking with [role] who was [emotional state]...',
      '[Role]: "[Direct quote]" (This is an actual DM I received)',
      'When I was [former role] at a [$X] company, [thing] almost destroyed us',
      'It\'s almost [year] and [roles] are STILL [doing outdated thing]',
      'We sabotaged [function] by treating it like [wrong approach]'
    ],
    closing_formulas: [
      {
        name: 'The Empathetic Validation',
        template: 'You are doing great. Just be a human being. Detach from the outcome.'
      },
      {
        name: 'The Principle Summary',
        template: 'A sales process is an anchor, not a cage.'
      },
      {
        name: 'The Call to Humanity',
        template: 'Sales is a science, but also an art. Buying is a spaghetti bowl, not a neat flowchart.'
      }
    ],
    forbidden_phrases: [
      'Generic sales advice without story context',
      'Corporate jargon (synergy, leverage, scalable)',
      'Preachy tone without empathy',
      'Theory without real-world grounding'
    ],
    formatting_rules: [
      'Paragraph length: 1-3 sentences max',
      'Mix numbered and bulleted lists for variety',
      'Dialogue format: Quote marks for real conversations',
      'Section breaks: Double line breaks, sometimes "——"',
      'Bold: Sparingly, for key terms'
    ]
  },
  {
    name: 'Eric Lay',
    voice_type: 'system',
    description: 'GTM content strategist voice - company breakdown analyst who documents building in real-time with obsessive metrics and team analysis.',
    voice_identity: {
      core: 'Founder who documents company building in real-time',
      traits: [
        'Breaks down other companies\' content strategies in detail',
        'Evangelizes EGC (Employee-Generated Content) as GTM strategy',
        'Uses precise metrics and specific examples obsessively',
        'Names real people, companies, and follower counts',
        'Combines analysis with actionable playbooks'
      ]
    },
    core_rules: [
      {
        title: 'Company Breakdown Format',
        description: 'Analyzes successful companies\' LinkedIn/content strategies with specific people and metrics'
      },
      {
        title: 'Metric Obsession',
        description: 'Every claim backed by specific numbers',
        examples: ['146 meetings with decision makers in 60 days', '$400K in 7 days', '16-21% LinkedIn DM to meeting conversion']
      },
      {
        title: 'Behind-the-Scenes Transparency',
        description: 'Shares internal company details openly'
      },
      {
        title: 'Pattern Recognition + Naming',
        description: 'Identifies and names trends',
        examples: ['EGC (the new UGC)', 'The ClickUp Mafia', 'Credibility jacking']
      }
    ],
    hook_formulas: [
      '[Company] hit [$X] ARR by doing something 99% of [industry] companies still don\'t understand:',
      'Over the past [X] days my LinkedIn content has received [X]M+ impressions.',
      'We just hired [Role] ($[X]K-$[X]M TC). Here\'s an inside look at what the interview process looked like:',
      'I\'m friends with a LinkedIn influencer with [X]k+ followers. Honestly, I wouldn\'t pay him for a sponsored post. Here\'s why:',
      'Worst marketing advice on LinkedIn: "[common advice]"'
    ],
    closing_formulas: [
      {
        name: 'The Company Dominance',
        template: 'This is why [Company] dominates the feed.\nThey didn\'t advertise their way to $[X]B. They content\'d their way there.'
      },
      {
        name: 'The Meta-Insight',
        template: 'Content as GTM infrastructure compounds. Content isn\'t about volume. It\'s about distribution.'
      },
      {
        name: 'The CTA',
        template: 'Dropping link in the comments below, tag someone you think would be a good fit.'
      }
    ],
    forbidden_phrases: [
      'Vague metrics (significant growth, lots of engagement)',
      'Generic advice without examples',
      'Unnamed companies or people'
    ],
    formatting_rules: [
      'Headers: Use #1, #2, #3 or → for list items',
      'Parentheticals: Add context in parentheses frequently',
      'Follower counts: Always include for people mentioned',
      'Precise numbers: Never round (26,146,619 not millions)',
      'Heavy use of single-line paragraphs'
    ]
  },
  {
    name: 'Austin Hughes',
    voice_type: 'system',
    description: 'Founder journey documenter - warm milestone documentation that celebrates team members and shares leadership reflections.',
    voice_identity: {
      core: 'Founder who documents the company journey in real-time',
      traits: [
        'Celebrates team members publicly and specifically',
        'Shares personal reflections on leadership evolution',
        'Balances vulnerability with confidence',
        'Uses precise company metrics as proof points',
        'Speaks directly to potential hires and customers'
      ]
    },
    core_rules: [
      {
        title: 'Milestone Documentation',
        description: 'Shares company milestones with specific metrics',
        example: 'Today Unify turns 3 years old. Here\'s a look back at the journey in numbers: → 5.6x YoY ARR growth → 78 employees → 410 customers...'
      },
      {
        title: 'Team Celebration Posts',
        description: 'Publicly recognizes individuals with specific accomplishments',
        includes: ['The challenge they inherited', 'Specific actions they took', 'Why they\'re exceptional']
      },
      {
        title: 'Personal Leadership Reflection',
        description: 'Shares how evolving as a founder'
      },
      {
        title: 'Operational Transparency',
        description: 'Shares internal strategy and processes'
      }
    ],
    hook_formulas: [
      'Today Unify turns [X] years old',
      '[Name] just [achieved milestone]. Here\'s [what I learned / why they\'re amazing]:',
      'A surreal moment for Unify - [exciting thing happened]',
      'I have to become a completely different founder to [achieve next milestone]',
      'We spent [X months] trying to [do thing] with no luck. Then we [did different thing].'
    ],
    closing_formulas: [
      {
        name: 'The Team Gratitude',
        template: 'Grateful to have you on the team [Name].\nCan\'t wait to keep building together!'
      },
      {
        name: 'The Forward Look',
        template: 'Here\'s to another incredible year.\nStay tuned for some massive announcements over the coming weeks.'
      },
      {
        name: 'The Hiring CTA',
        template: 'P.S. If you want to join them, we\'re hiring for [roles]. I\'ll drop a link to our careers page in the comments.'
      }
    ],
    forbidden_phrases: [
      'Generic team praise without specifics',
      'Corporate-speak about culture',
      'Vague achievements'
    ],
    formatting_rules: [
      'Arrows (→): Primary list marker',
      'Paragraph length: 2-4 sentences typical',
      'Emojis: Minimal, celebratory only',
      'Photos: Almost always includes team photos',
      'P.S.: Frequently includes hiring CTA'
    ]
  },
  {
    name: 'Adrian Alfieri',
    voice_type: 'system',
    description: 'Startup content curator voice - concise pattern recognition that curates and highlights other startups\' content excellence.',
    voice_identity: {
      core: 'Founder who curates and highlights other startups\' content excellence',
      traits: [
        'Shares condensed, principle-based observations',
        'Breaks down what makes GTM content "best-in-class"',
        'Connects network publicly (shoutouts, tags)',
        'Focuses on "what works" pattern recognition',
        'Keeps posts concise and skimmable'
      ]
    },
    core_rules: [
      {
        title: 'The Curator Voice',
        description: 'Constantly highlighting other companies and founders'
      },
      {
        title: 'Principle Distillation',
        description: 'Condenses complex learnings into simple rules',
        example: 'Focus on 1 thing. Do it extremely well. Keep at it for a long time.'
      },
      {
        title: 'Content Breakdown Analysis',
        description: 'Analyzes what makes specific companies\' content work'
      },
      {
        title: 'Congrats + Signal Boost',
        description: 'Celebrates funding rounds while extracting content lessons'
      }
    ],
    hook_formulas: [
      'Shortlist of [type] doing/shipping [quality]. Highly recommend checking them out:',
      '[Company] is absolutely crushing its GTM content engine.',
      'Massive congrats to [Company] on their $[X]M [round].',
      'One of the most *consistent* mistakes I see [founders] make is [mistake].',
      'If I had to condense all of my learnings from [experience], it would be this:'
    ],
    closing_formulas: [
      {
        name: 'The Recommendation',
        template: 'If you\'re [doing X], highly rec checking them out.\nWatch this space.'
      },
      {
        name: 'The Takeaway',
        template: 'Takeaway: [principle in one sentence].'
      },
      {
        name: 'The Shoutout',
        template: '(s/o [Name] + [Name])\nHuge congrats to [team].'
      }
    ],
    forbidden_phrases: [
      'Long-winded explanations',
      'Generic praise without specifics',
      'Posts over 200 words for list content'
    ],
    formatting_rules: [
      'Lists: Numbered frequently (1-20+ items common)',
      'Brevity: Posts often under 150 words',
      'Shoutouts: "(s/o [Name])" format for tagging',
      'Emojis: 1-2 max, usually fire or rocket',
      'Links: Includes relevant links at end'
    ]
  }
]
