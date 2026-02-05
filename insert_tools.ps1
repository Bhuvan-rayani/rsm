$file = 'c:\Users\RAYANIBHUVANCHAND-24\Downloads\rsm-task-portal\pages\TaskDetail.tsx'
$content = Get-Content $file -Raw

$toolsSection = @"
            {/* Tools You Must Learn and Use */}
            <div style={{ 
              ...glassStyle, 
              padding: '32px',
              border: `1px solid `${THEME.accent}40`,
              background: `linear-gradient(135deg, `${THEME.surface} 0%, `${THEME.accentMuted} 100%)`
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', borderLeft: `3px solid `${THEME.accent}`, paddingLeft: '16px' }}>
                Tools You Must Learn and Use
              </h3>
              <p style={{ color: THEME.textSecondary, fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                You are required to explore and practically use all of the following tools during this task. You do not need expert-level mastery, but you should understand what each tool is used for and how it helps in research.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {['Google Scholar', 'Semantic Scholar', 'SciSpace', 'Scopus', 'ResearchGate', 'NotebookLM', 'Zotero', 'Mendeley', 'Notion', 'Obsidian'].map((toolName, i) => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: `1px solid `${THEME.glassBorder}`,
                    background: 'rgba(255,255,255,0.03)',
                    fontSize: '14px',
                    color: THEME.textPrimary,
                    textAlign: 'center'
                  }}>
                    ✓ {toolName}
                  </div>
                ))}
              </div>
            </div>
"@

$newContent = $content -replace '(\)}\})\s+(\{\s*/\* Learning Resources \*/)', "`$1`n`n$toolsSection`n`n`$2"
Set-Content $file -Value $newContent -Encoding UTF8
Write-Host "Updated TaskDetail.tsx with Tools section"
