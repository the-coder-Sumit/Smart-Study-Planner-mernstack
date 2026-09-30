const fs = require('fs');
['client/src/pages/Login.js', 'client/src/pages/Register.js'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // The broken placeholder could be anything right now, so we can use a regex for placeholder="..."
    // where type is password. But let's just replace the exact broken text if possible, or use a more precise replace.
    // Actually, just replace placeholder=\"[^\"]+\" right after type=\"password\"
    content = content.replace(/type="password"\s*\n\s*value=\{password\}\s*\n\s*onChange=\{\(e\) => setPassword\(e.target.value\)\}\s*\n\s*placeholder="[^"]+"/g, 'type="password"\n            value={password}\n            onChange={(e) => setPassword(e.target.value)}\n            placeholder="******"');
    
    // Also try catching the specific weird characters just in case it didn't match the multi-line
    content = content.replace(/placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"/g, 'placeholder="******"');
    content = content.replace(/placeholder=".*?€.*?"/g, 'placeholder="******"');
    
    fs.writeFileSync(file, content, 'utf8');
});
