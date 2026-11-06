import fs from 'fs';
import path from 'path';

function checkAll(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') checkAll(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        // Matches literal $ in JSX or string literals, but NOT ${expr} in template literals
        // We can strip all `${` occurrences and then check if `$` still exists
        const stripped = l.replace(/\$\{[^}]*\}/g, 'EXPR').replace(/\$\{/g, 'EXPR');
        if (stripped.includes('$') || /USD/i.test(stripped) || /dollar/i.test(stripped)) {
          console.log(`${full}:${idx + 1} -> ${l.trim()}`);
        }
      });
    }
  }
}

checkAll('src');
checkAll('public');
