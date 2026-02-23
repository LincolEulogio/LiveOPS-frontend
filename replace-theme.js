const fs = require('fs');
const glob = require('glob');

const files = [
    'src/app/(public)/status/[id]/page.tsx',
    'src/app/(talent)/layout.tsx',
    'src/app/(talent)/productions/[id]/room/page.tsx',
    'src/app/(dashboard)/productions/[id]/team/page.tsx',
    'src/shared/socket/socket.provider.tsx',
    'src/shared/components/ThemeSwitcher.tsx',
    'src/shared/components/SkeletonLoaders.tsx',
    'src/shared/components/PresenceBar.tsx',
    'src/shared/components/ErrorBoundary.tsx',
    'src/shared/components/CommandPalette.tsx',
    'src/app/(dashboard)/productions/[id]/overlays/page.tsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/bg-stone-950/g, 'bg-background');
    content = content.replace(/bg-stone-900/g, 'bg-card-bg');
    content = content.replace(/bg-stone-800/g, 'bg-card-border');
    content = content.replace(/border-stone-900/g, 'border-card-border');
    content = content.replace(/border-stone-800/g, 'border-card-border');
    content = content.replace(/text-stone-300/g, 'text-foreground');
    content = content.replace(/text-stone-400/g, 'text-muted');
    content = content.replace(/text-stone-500/g, 'text-muted');
    content = content.replace(/text-stone-600/g, 'text-muted');
    content = content.replace(/text-stone-700/g, 'text-muted');
    content = content.replace(/ring-stone-950/g, 'ring-background');
    fs.writeFileSync(file, content);
    console.log('Processed', file);
});
