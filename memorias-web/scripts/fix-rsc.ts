import * as fs from "fs";
import * as path from "path";

const rootDir = path.join(process.cwd(), "src");

// Helper to recursively list files
function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList);
    } else if (name.endsWith(".tsx") || name.endsWith(".ts")) {
      fileList.push(name);
    }
  }
  return fileList;
}

const allFiles = getFiles(rootDir);

console.log(`Found ${allFiles.length} files to scan and fix.`);

let fixCount = 0;

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 1. Skip client-only files for RSC specific serialization issues where possible, 
  // but apply background theme fixes to everything to be safe.
  const isClientComponent = content.includes('"use client"') || content.includes("'use client'");

  // 2. Fix background function style objects
  const bgReplacements = [
    {
      // Hero gradient
      target: /background:\s*\(theme\)\s*=>\s*theme\.palette\.mode\s*===\s*["']dark["']\s*\?\s*["']linear-gradient\(135deg,\s*#0b0f19\s*0%,\s*#141c2f\s*100%\)["']\s*:\s*`linear-gradient\(135deg,\s*\${theme\.palette\.primary\.main\}\s*0%,\s*\${theme\.palette\.primary\.dark\}\s*100%\)`/g,
      replacement: `background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)"`
    },
    {
      // Hero gradient variation (about page)
      target: /background:\s*\(theme\)\s*=>\s*theme\.palette\.mode\s*===\s*["']dark["']\s*\?\s*["']linear-gradient\(135deg,\s*#0b0f19\s*0%,\s*#141c2f\s*100%\)["']\s*:\s*`linear-gradient\(135deg,\s*\${theme\.palette\.primary\.main\}\s*0%,\s*\${theme\.palette\.primary\.dark\s*\|\|\s*theme\.palette\.primary\.main\}\s*100%\)`/g,
      replacement: `background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)"`
    },
    {
      // Hero gradient variation with #052438 (new/edit pages)
      target: /background:\s*\(theme\)\s*=>\s*theme\.palette\.mode\s*===\s*["']dark["']\s*\?\s*["']linear-gradient\(135deg,\s*#052438\s*0%,\s*#093A54\s*100%\)["']\s*:\s*["']linear-gradient\(135deg,\s*#093A54\s*0%,\s*#0d4b6e\s*100%\)["']/g,
      replacement: `background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)"`
    },
    {
      // Hero gradient variation with #1e293b (catalog headers)
      target: /background:\s*\(theme\)\s*=>\s*theme\.palette\.mode\s*===\s*["']dark["']\s*\?\s*["']linear-gradient\(135deg,\s*#1e293b\s*0%,\s*#0f172a\s*100%\)["']\s*:\s*`linear-gradient\(135deg,\s*\${theme\.palette\.primary\.main\}\s*0%,\s*\${theme\.palette\.primary\.dark\}\s*100%\)`/g,
      replacement: `background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)"`
    },
    {
      // Hero gradient variation for lists/tables
      target: /background:\s*\(theme\)\s*=>\s*theme\.palette\.mode\s*===\s*["']dark["']\s*\?\s*["']linear-gradient\(135deg,\s*#1e293b\s*0%,\s*#0f172a\s*100%\)["']\s*:\s*["']linear-gradient\(135deg,\s*#f8fafc\s*0%,\s*#e2e8f0\s*100%\)["']/g,
      replacement: `background: "linear-gradient(135deg, var(--mui-palette-background-default) 0%, var(--mui-palette-background-paper) 100%)"`
    },
    {
      // Card border gradient
      target: /background:\s*\(theme\)\s*=>\s*`linear-gradient\(90deg,\s*\${theme\.palette\.primary\.main\},\s*\${theme\.palette\.secondary\.main\}\)`/g,
      replacement: `background: "linear-gradient(90deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))"`
    },
    {
      // General primary dynamic gradient
      target: /background:\s*\(theme\)\s*=>\s*`linear-gradient\(135deg,\s*\${theme\.palette\.primary\.main\}\s*0%,\s*\${theme\.palette\.primary\.dark\s*\|\|\s*theme\.palette\.primary\.main\}\s*100%\)`/g,
      replacement: `background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)"`
    },
    {
      // General secondary dynamic gradient (statistics page)
      target: /background:\s*\(theme\)\s*=>\s*`linear-gradient\(135deg,\s*\${theme\.palette\.secondary\.main\}\s*0%,\s*\${theme\.palette\.secondary\.dark\}\s*100%\)`/g,
      replacement: `background: "linear-gradient(135deg, var(--mui-palette-secondary-main) 0%, var(--mui-palette-secondary-dark) 100%)"`
    },
    {
      // General primary dynamic gradient (variant 2)
      target: /background:\s*\(theme\)\s*=>\s*`linear-gradient\(135deg,\s*\${theme\.palette\.primary\.main\}\s*0%,\s*\${theme\.palette\.primary\.dark\}\s*100%\)`/g,
      replacement: `background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)"`
    },
    {
      // Footer transparent background function
      target: /bgcolor:\s*\(theme\)\s*=>\s*theme\.palette\.mode\s*===\s*["']dark["']\s*\?\s*["']rgba\(20,\s*28,\s*47,\s*0\.4\)["']\s*:\s*["']rgba\(255,\s*255,\s*255,\s*0\.4\)["']/g,
      replacement: `bgcolor: "background.paper", style: { backdropFilter: "blur(8px)" }`
    }
  ];

  for (const rep of bgReplacements) {
    if (rep.target.test(content)) {
      content = content.replace(rep.target, rep.replacement);
      modified = true;
    }
  }

  // 3. Fix component={Link} in Server Components (skip files that are client components)
  if (!isClientComponent) {
    let temp = content;

    // Match Button with component={Link} and its corresponding closing tag
    const buttonRegex = /<Button\s+([^>]*?)component=\{Link\}([^>]*?)>([\s\S]*?)<\/Button>/g;
    if (buttonRegex.test(temp)) {
      temp = temp.replace(buttonRegex, "<LinkButton $1$2>$3</LinkButton>");
    }

    // Match ListItemButton with component={Link} and its corresponding closing tag
    const listItemButtonRegex = /<ListItemButton\s+([^>]*?)component=\{Link\}([^>]*?)>([\s\S]*?)<\/ListItemButton>/g;
    if (listItemButtonRegex.test(temp)) {
      temp = temp.replace(listItemButtonRegex, "<LinkListItemButton $1$2>$3</LinkListItemButton>");
    }

    // Match IconButton with component={Link} and its corresponding closing tag
    const iconButtonRegex = /<IconButton\s+([^>]*?)component=\{Link\}([^>]*?)>([\s\S]*?)<\/IconButton>/g;
    if (iconButtonRegex.test(temp)) {
      temp = temp.replace(iconButtonRegex, "<LinkIconButton $1$2>$3</LinkIconButton>");
    }

    if (temp !== content) {
      content = temp;
      modified = true;

      // Add import statement for LinkComponents at the top of the file
      const importLine = `import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";\n`;
      const firstImportIndex = content.indexOf("import");
      if (firstImportIndex !== -1) {
        const nextLineIndex = content.indexOf("\n", firstImportIndex) + 1;
        content = content.slice(0, nextLineIndex) + importLine + content.slice(nextLineIndex);
      } else {
        content = importLine + content;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`[FIXED] ${path.relative(rootDir, filePath)}`);
    fixCount++;
  }
}

console.log(`Completed fixing ${fixCount} files successfully.`);
