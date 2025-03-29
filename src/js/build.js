const fs = require('fs');
const path = require('path');
const glob = require('glob');
const terser = require('terser');
const csso = require('csso');
const htmlmin = require('html-minifier');

// Configuration
const config = {
  rootJs: {
    src: '*.js',
    exclude: ['*.min.js', 'build*.js'],
    outputExt: '.js'
  },
  js: {
    src: ['src/**/*.js', 'node_modules/**/*.js'],
    exclude: ['src/**/*.min.js', 'src/**/build*.js'],
    outputExt: '.js'
  },
  css: {
    src: ['src/**/*.css', 'node_modules/**/*.css'],
    exclude: 'src/**/*.min.css',
    outputExt: '.css'
  },
  json: {
    src: ['src/**/*.json', './package.json', './package-lock.json', 'node_modules/**/*.json']
  },
  html: {
    src: ['src/**/*.html', 'node_modules/**/*.html']
  },
  images: {
    src: 'src/**/*.+(png|jpg|jpeg|gif|svg|ico)'
  },
  typescript: {
    src: ['src/**/*.+(ts|ts.map|d.ts)', 'node_modules/**/*.+(ts|ts.map|d.ts)']
  }
  // Add all files that might contain references
  // allFiles: {
  //   src: ['./*.js', 'src/**/*.js', 'src/**/*.css', 'src/**/*.json']
  // }
};

// Ensure directory exists
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Clean public directory
function cleanPublicDir() {
  console.log('Cleaning public directory...');
  if (fs.existsSync('public')) {
    fs.rmSync('public', { recursive: true, force: true });
  }
  fs.mkdirSync('public');
  console.log('✓ Public directory cleaned');
}

// Create output path preserving directory structure
function createOutputPath(file, baseDir, outputExt = null) {
  // Get relative path from the source root
  const relativePath = path.relative(baseDir, file);
  
  // Create public path with the same relative structure
  let outputPath = path.join('public', relativePath);
  
  // Apply output extension if provided
  if (outputExt) {
    outputPath = outputPath.replace(path.extname(outputPath), outputExt);
  }
  
  return outputPath;
}

// Debug minification for app.js
async function debugAppJsMinification() {
  console.log('Debugging app.js minification specifically...');
  
  if (!fs.existsSync('app.js')) {
    console.error('❌ app.js not found in root directory');
    return;
  }
  
  try {
    const appJsContent = fs.readFileSync('app.js', 'utf8');
    console.log(`✓ app.js loaded successfully - file size: ${appJsContent.length} bytes`);
    console.log(`✓ First 100 characters: ${appJsContent.substring(0, 100)}...`);
    
    // Check for syntax errors by parsing
    try {
      const result = await terser.minify(appJsContent, {
        compress: true,
        mangle: true,
        sourceMap: false,
        toplevel: true
      });
      
      if (result.error) {
        console.error('❌ Error during app.js parsing:', result.error);
        return;
      }
      
      if (!result.code || result.code.length === 0) {
        console.error('❌ Minification produced empty output');
        return;
      }
      
      console.log(`✓ app.js minified successfully - result size: ${result.code.length} bytes`);
      console.log(`✓ First 100 characters of minified: ${result.code.substring(0, 100)}...`);
      
      // Write to output with explicit name
      const outputPath = path.join('public', 'app.js');
      fs.writeFileSync(outputPath, result.code);
      console.log(`✓ Written minified app.js to: ${outputPath}`);
      
      // Calculate compression ratio
      const ratio = Math.round((result.code.length / appJsContent.length) * 100);
      console.log(`✓ Compression ratio: ${ratio}% (smaller is better)`);
      
    } catch (err) {
      console.error('❌ Terser processing error:', err);
    }
  } catch (err) {
    console.error('❌ Error reading app.js:', err);
  }
}

async function appJsMinification() {
  console.log('Debugging app.js minification specifically...');
  
  if (!fs.existsSync('app.js')) {
    console.error('❌ app.js not found in root directory');
    return;
  }
  
  try {
    const appJsContent = fs.readFileSync('app.js', 'utf8');
    console.log(`✓ app.js loaded successfully - file size: ${appJsContent.length} bytes`);
    console.log(`✓ First 100 characters: ${appJsContent.substring(0, 100)}...`);
    
    // Check for syntax errors by parsing
    try {
      const result = await terser.minify(appJsContent, {
        compress: true,
        mangle: true,
        sourceMap: false,
        toplevel: true
      });
      
      if (result.error) {
        console.error('❌ Error during app.js parsing:', result.error);
        return;
      }
      
      if (!result.code || result.code.length === 0) {
        console.error('❌ Minification produced empty output');
        return;
      }
      
      console.log(`✓ app.js minified successfully - result size: ${result.code.length} bytes`);
      console.log(`✓ First 100 characters of minified: ${result.code.substring(0, 100)}...`);
      
      // Write to output with explicit name
      const outputPath = path.join('public', 'app.js');
      fs.writeFileSync(outputPath, result.code);
      console.log(`✓ Written minified app.js to: ${outputPath}`);
      
      // Calculate compression ratio
      const ratio = Math.round((result.code.length / appJsContent.length) * 100);
      console.log(`✓ Compression ratio: ${ratio}% (smaller is better)`);
      
    } catch (err) {
      console.error('❌ Terser processing error:', err);
    }
  } catch (err) {
    console.error('❌ Error reading app.js:', err);
  }
}

// Minify JavaScript files
async function minifyJS() {
  console.log('Minifying JavaScript files...');
  
  // Minify root-level JS files (like app.js)
  const rootFiles = glob.sync(config.rootJs.src, { ignore: config.rootJs.exclude });
  
  console.log(`Found ${rootFiles.length} root JS files to process:`, rootFiles);
  
  for (const file of rootFiles) {
    // Skip already minified files
    if (file.endsWith('.min.js')) continue;
    
    try {
      console.log(`Processing ${file}...`);
      const content = fs.readFileSync(file, 'utf8');
      console.log(`- Read ${content.length} bytes`);
      
      // Special handling for app.js with more aggressive options
      const minifyOptions = file === 'app.js' ? {
        compress: {
          dead_code: true,
          drop_console: false,
          drop_debugger: true,
          keep_fargs: false,
          unused: true
        },
        mangle: true,
        toplevel: true
      } : {
        compress: true,
        mangle: true
      };
      
      const result = await terser.minify(content, minifyOptions);
      
      if (result.error) {
        console.error(`- Error minifying ${file}:`, result.error);
        continue;
      }
      
      console.log(`- Minified from ${content.length} to ${result.code.length} bytes`);
      
      const outputPath = createOutputPath(file, '.', config.rootJs.outputExt);
      ensureDirectoryExistence(outputPath);
      fs.writeFileSync(outputPath, result.code);
      console.log(`✓ Minified: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error minifying ${file}:`, err);
    }
  }
  
  // Minify JavaScript files in src directory
  const srcFiles = glob.sync(config.js.src, { ignore: config.js.exclude });
  
  for (const file of srcFiles) {
    // Skip already minified files
    if (file.endsWith('.min.js')) continue;
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      const result = await terser.minify(content, {
        compress: true,
        mangle: true
      });
      
      const outputPath = createOutputPath(file, '.', config.js.outputExt);
      ensureDirectoryExistence(outputPath);
      fs.writeFileSync(outputPath, result.code);
      console.log(`✓ Minified: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error minifying ${file}:`, err);
    }
  }
}

// Minify CSS files
function minifyCSS() {
  console.log('Minifying CSS files...');
  const files = glob.sync(config.css.src, { ignore: config.css.exclude });
  
  for (const file of files) {
    if (file.endsWith('.min.css')) continue;
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      const result = csso.minify(content);
      
      const outputPath = createOutputPath(file, '.', config.css.outputExt);
      ensureDirectoryExistence(outputPath);
      fs.writeFileSync(outputPath, result.css);
      console.log(`✓ Minified: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error minifying ${file}:`, err);
    }
  }
}

// Minify JSON files
function minifyJSON() {
  console.log('Minifying JSON files...');
  const files = glob.sync(config.json.src);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const jsonData = JSON.parse(content);
      const minified = JSON.stringify(jsonData);
      
      const outputPath = createOutputPath(file, '.');
      ensureDirectoryExistence(outputPath);
      fs.writeFileSync(outputPath, minified);
      console.log(`✓ Minified: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error minifying ${file}:`, err);
    }
  }
}

// Minify HTML files and update references
/*
function minifyHTML() {
  console.log('Minifying HTML files...');
  const files = glob.sync(config.html.src);
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Update JS references to minified versions, preserving directory structure
    content = content.replace(/src=["'](.+?)\.js["']/g, (match, p1) => {
      return `src="${p1}.min.js"`;
    });
    
    // Update CSS references to minified versions, preserving directory structure
    content = content.replace(/href=["'](.+?)\.css["']/g, (match, p1) => {
      return `href="${p1}.min.css"`;
    });
    
    // Minify HTML
    const minified = htmlmin.minify(content, {
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true
    });
    
    const outputPath = createOutputPath(file, '.');
    ensureDirectoryExistence(outputPath);
    fs.writeFileSync(outputPath, minified);
    console.log(`✓ Minified: ${file} -> ${outputPath}`);
  }
} */

// Minify HTML files
function minifyHTML() {
  console.log('Minifying HTML files...');
  const files = glob.sync(config.html.src);
  
  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      // Minify HTML
      const minified = htmlmin.minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true
      });
      
      const outputPath = createOutputPath(file, '.');
      ensureDirectoryExistence(outputPath);
      fs.writeFileSync(outputPath, minified);
      console.log(`✓ Minified: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error minifying ${file}:`, err);
    }
  }
}

// Copy images
function copyImages() {
  console.log('Copying images...');
  const files = glob.sync(config.images.src);
  
  for (const file of files) {
    try {
      const outputPath = createOutputPath(file, '.');
      ensureDirectoryExistence(outputPath);
      fs.copyFileSync(file, outputPath);
      console.log(`✓ Copied: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error copying ${file}:`, err);
    }
  }
}

// Copy TypeScript files
function copyTypeScriptFiles() {
  console.log('Copying TypeScript files...');
  const files = glob.sync(config.typescript.src);
  
  for (const file of files) {
    try {
      const outputPath = createOutputPath(file, '.');
      ensureDirectoryExistence(outputPath);
      fs.copyFileSync(file, outputPath);
      console.log(`✓ Copied: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error copying ${file}:`, err);
    }
  }
}

// Copy node_modules folder
function copyNodeModules() {
  console.log('Copying node_modules folder...');
  
  if (!fs.existsSync('node_modules')) {
    console.warn('⚠️ node_modules folder not found in root directory, skipping...');
    return;
  }
  
  try {
    const targetDir = path.join('public', 'node_modules');
    
    // Create the target directory
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Use a more efficient approach to copy the directory
    console.log('Starting node_modules copy (this may take a while)...');
    
    // Use recursive directory copy with shell command if available
    const { exec } = require('child_process');
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      exec('xcopy node_modules public\\node_modules /E /I /H /Y', (error) => {
        if (error) {
          console.error('Error using xcopy for node_modules:', error);
          copyNodeModulesManually();
        } else {
          console.log('✓ Copied node_modules directory using xcopy');
        }
      });
    } else {
      exec('cp -R node_modules public/', (error) => {
        if (error) {
          console.error('Error using cp for node_modules:', error);
          copyNodeModulesManually();
        } else {
          console.log('✓ Copied node_modules directory using cp');
        }
      });
    }
  } catch (err) {
    console.error('Error copying node_modules folder:', err);
  }
}

// Fall back to manual copy if shell commands fail
function copyNodeModulesManually() {
  console.log('Falling back to manual node_modules copy (this will be slower)...');
  
  function copyFolderRecursiveSync(source, target) {
    // Check if folder needs to be created or integrated
    const targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
      const files = fs.readdirSync(source);
      files.forEach(function (file) {
        const curSource = path.join(source, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          copyFolderRecursiveSync(curSource, targetFolder);
        } else {
          fs.copyFileSync(curSource, path.join(targetFolder, file));
        }
      });
    }
  }
  
  try {
    copyFolderRecursiveSync('node_modules', 'public');
    console.log('✓ Copied node_modules directory manually');
  } catch (err) {
    console.error('Error in manual node_modules copy:', err);
  }
}

// Update all file references in all files
/*
function updateAllReferences() {
  console.log('Updating file references in all files...');
  
  // Get all files that might contain references
  const files = glob.sync(config.allFiles.src);
  
  // Create a list of file mappings (original to minified)
  const jsFiles = [
    ...glob.sync(config.rootJs.src, { ignore: config.rootJs.exclude }),
    ...glob.sync(config.js.src, { ignore: config.js.exclude })
  ]
  .filter(file => !file.endsWith('.min.js') && !file.endsWith('.d.ts') && !file.endsWith('.map') && file !== 'build.js');
  
  const cssFiles = glob.sync(config.css.src, { ignore: config.css.exclude })
    .filter(file => !file.endsWith('.min.css'));
  
  for (const targetFile of files) {
    // Skip build.js
    if (targetFile === 'build.js' || targetFile.includes('build_v')) continue;
    
    // Skip files that likely don't have references or are already processed
    if (targetFile.endsWith('.min.js') || targetFile.endsWith('.d.ts') || 
        targetFile.endsWith('.map') || targetFile.endsWith('.min.css')) continue;
    
    try {
      let content = fs.readFileSync(targetFile, 'utf8');
      let modified = false;
      
      // Replace JS file references
      for (const jsFile of jsFiles) {
        // Get different forms of the path for replacement
        const normalizedPath = jsFile.replace(/\\/g, '/');  // Convert backslashes to forward slashes
        const relativePath = './' + normalizedPath;  // With leading ./
        const plainPath = normalizedPath;  // Without leading ./
        const fileNameOnly = path.basename(normalizedPath);  // Just the filename
        
        // Create minified versions of each path form
        const normalizedPathMin = normalizedPath.replace('.js', '.min.js');
        const relativePathMin = relativePath.replace('.js', '.min.js');
        const plainPathMin = plainPath.replace('.js', '.min.js');
        const fileNameOnlyMin = fileNameOnly.replace('.js', '.min.js');
        
        // Attempt different path styles replacements
        if (content.includes(relativePath)) {
          content = content.replace(new RegExp(escapeRegExp(relativePath), 'g'), relativePathMin);
          modified = true;
        }
        if (content.includes(plainPath)) {
          content = content.replace(new RegExp(escapeRegExp(plainPath), 'g'), plainPathMin);
          modified = true;
        }
        if (content.includes(fileNameOnly) && fileNameOnly !== 'index.js') { // Be careful with just filenames
          content = content.replace(new RegExp(`(['"\\s])${escapeRegExp(fileNameOnly)}(['"\\s])`, 'g'), 
                                    `$1${fileNameOnlyMin}$2`);
          modified = true;
        }
      }
      
      // Replace CSS file references
      for (const cssFile of cssFiles) {
        const normalizedPath = cssFile.replace(/\\/g, '/');
        const relativePath = './' + normalizedPath;
        const plainPath = normalizedPath;
        const fileNameOnly = path.basename(normalizedPath);
        
        const normalizedPathMin = normalizedPath.replace('.css', '.min.css');
        const relativePathMin = relativePath.replace('.css', '.min.css');
        const plainPathMin = plainPath.replace('.css', '.min.css');
        const fileNameOnlyMin = fileNameOnly.replace('.css', '.min.css');
        
        if (content.includes(relativePath)) {
          content = content.replace(new RegExp(escapeRegExp(relativePath), 'g'), relativePathMin);
          modified = true;
        }
        if (content.includes(plainPath)) {
          content = content.replace(new RegExp(escapeRegExp(plainPath), 'g'), plainPathMin);
          modified = true;
        }
        if (content.includes(fileNameOnly) && fileNameOnly !== 'styles.css') { // Be careful with just filenames
          content = content.replace(new RegExp(`(['"\\s])${escapeRegExp(fileNameOnly)}(['"\\s])`, 'g'), 
                                    `$1${fileNameOnlyMin}$2`);
          modified = true;
        }
      }
      
      if (modified) {
        // Write updated content to the public version
        const outputPath = createOutputPath(targetFile, '.', 
                          targetFile.endsWith('.js') ? config.js.outputExt : 
                          targetFile.endsWith('.css') ? config.css.outputExt : null);
        fs.writeFileSync(outputPath, content);
        console.log(`✓ Updated references in: ${outputPath}`);
      }
    } catch (err) {
      console.error(`Error updating references in ${targetFile}:`, err);
    }
  }
} */

// Helper function to escape special characters in a string for use in RegExp
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Main function
async function build() {
  console.log('Starting build process...');
  
  cleanPublicDir();
  copyNodeModules();
  
  // Run specific app.js debugging and minification
  await debugAppJsMinification();
  
  await minifyJS();
  minifyCSS();
  minifyJSON();
  minifyHTML();
  appJsMinification();
  copyImages();
  copyTypeScriptFiles();
  // updateAllReferences();
  
  console.log('Build completed successfully!');
}

// Standalone debugging script for app.js
async function debugAppJsOnly() {
  console.log('Running standalone debug for app.js minification only');
  await debugAppJsMinification();
  console.log('Debug completed');
}

// Check if this script is being run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--debug-app')) {
    debugAppJsOnly().catch(err => {
      console.error('Debug failed:', err);
      process.exit(1);
    });
  } else {
    build().catch(err => {
      console.error('Build failed:', err);
      process.exit(1);
    });
  }
}

// Export functions for external usage
module.exports = {
  build,
  debugAppJsOnly
};