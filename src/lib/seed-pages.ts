export interface Page { title: string; body: string; upd: number }

const LLD = ['Tic-Tac-Toe', '2048 game', 'Chess', 'JSON parser', 'Snake and Ladder', 'Minesweeper', 'Logging library like log4j', 'File system', 'Alarm / alert service for AWS', 'Tetris', 'Google Authenticator', 'Rate limiter', 'Android unlock pattern', 'Coupon system for a quick-commerce app', 'Thread pool', 'Uber', 'Google Calendar database model', 'Sublime Text IDE', 'Internet download manager', 'OYO / Airbnb', 'Amazon Prime Video', 'Online book management system', 'AWS S3', 'WhatsApp messenger', 'Collaborative document editing', 'Cryptocurrency exchange', 'Video conferencing like Zoom', 'Google Drive', 'Tinder', 'Real-time chat for millions of users', 'Game engine like Unreal', 'Mentorship platform', 'Version control (GitHub) database model', 'Alexa', 'Gmail', 'Payment recommendation system'];

export function seedPages(now = Date.now()): Record<string, Page> {
  return {
    pg1: { title: 'Pattern cheat sheet', body: '# Pattern cheat sheet\n\nOne line per pattern: when to use it + the template.\n\n## Two pointers\n- Sorted array, pair/triplet sums, palindromes\n\n## Sliding window\n- Longest/shortest substring or subarray with a condition\n', upd: now },
    pg2: { title: 'STAR story bank', body: '# STAR story bank\n\n## Story: <name>\n- **Situation:**\n- **Task:**\n- **Action:**\n- **Result (numbers):**\n- **Leadership Principles it fits:**\n', upd: now - 1 },
    pg3: { title: 'Mistakes log', body: '# Mistakes log\n\nEvery bug or wrong approach goes here. Reread on Sundays.\n\n- [ ] \n', upd: now - 2 },
    pg4: { title: 'AI notes', body: '# AI notes\n\n## News worth remembering\n- \n\n## Concepts I can explain\n- [ ] Tokens and context windows\n- [ ] RAG\n- [ ] Tool use and agents\n- [ ] Evals\n', upd: now - 3 },
    pg5: { title: 'Job tracker', body: '# Job tracker\n\n| Company | Role | Referral? | Applied | Stage |\n|---|---|---|---|---|\n\n## Skills job posts keep asking for\n- \n', upd: now - 4 },
    pg6: { title: 'LLD question bank', body: '# LLD question bank (from the board)\n\nSaturdays cover the first ones. Tick the rest off when you practice them. Reference: https://www.lldcoding.com/\n\n' + LLD.map(q => `- [ ] ${q}`).join('\n') + '\n', upd: now - 5 },
    pg7: { title: 'FDE decomposition template', body: '# Decomposition template\n\nSpend the first 10 minutes structuring. Name no technology yet.\n\n1. **Goal:** what changes for the customer if this works?\n2. **Stakeholders:** who uses it, who pays, who can block it?\n3. **Data:** what exists, where, how messy, who owns it, PII?\n4. **Main constraint:** time, data access, compliance, latency, budget\n5. **First slice:** the smallest thing we ship in 2 weeks\n6. **Success metric:** one number we move\n7. **Rollout:** pilot → eval gate → wider rollout → monitoring\n8. **Risks + what I would ask next**\n', upd: now - 6 },
    pg8: { title: 'Parking lot', body: '# Parking lot\n\nFound something interesting online? Put it here, not in today. Look at this list on Sundays or in Month 4.\n\n- [ ] \n', upd: now - 7 },
  };
}
