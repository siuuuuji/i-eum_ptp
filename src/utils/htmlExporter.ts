interface ExportScene {
  id: string
  index: number
  text: string
  imageUrl?: string
}

interface ExportOptions {
  scenes: ExportScene[]
  template: {
    layout: string
    font: string
    color: string
    animation: string
  }
  projectName?: string
  autoPlay?: boolean
  showNavigation?: boolean
}

class HTMLExporter {
  /**
   * 씬 데이터를 Base64 데이터 URL로 변환 (온라인 이미지)
   * 주의: 외부 이미지 URL 직접 사용
   */
  async generateHTML(options: ExportOptions): Promise<string> {
    const {
      scenes,
      template,
      projectName = 'Interactive Scene',
      autoPlay = false,
      showNavigation = true
    } = options

    const colorMap = this.getColorScheme(template.color)
    const fontMap = this.getFontFamily(template.font)
    const layoutType = template.layout

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(projectName)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary-color: ${colorMap.primary};
      --secondary-color: ${colorMap.secondary};
      --accent-color: ${colorMap.accent};
      --text-primary: ${colorMap.textPrimary};
      --text-secondary: ${colorMap.textSecondary};
      --font-family: ${fontMap};
    }

    body {
      font-family: var(--font-family);
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .container {
      max-width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* 상단 정보 바 */
    .header {
      padding: 20px;
      background: rgba(0, 0, 0, 0.3);
      text-align: center;
      border-bottom: 2px solid var(--accent-color);
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 5px;
      letter-spacing: -0.5px;
    }

    .header p {
      font-size: 14px;
      color: var(--text-secondary);
    }

    /* 메인 콘텐츠 */
    .content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    .scene-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.8s ease-in-out;
      position: absolute;
      top: 0;
      left: 0;
    }

    .scene-container.active {
      opacity: 1;
      position: relative;
    }

    /* 레이아웃 변형 */
    .scene-layout {
      display: flex;
      width: 100%;
      height: 100%;
      gap: 30px;
      padding: 40px;
      align-items: center;
      justify-content: center;
    }

    /* 이미지 위 텍스트 아래 */
    .layout-top .scene-layout {
      flex-direction: column;
    }

    .scene-image {
      max-width: 100%;
      max-height: 50vh;
      width: auto;
      height: auto;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    /* 이미지 아래 텍스트 위 */
    .layout-bottom .scene-layout {
      flex-direction: column-reverse;
    }

    /* 이미지 좌측 텍스트 우측 */
    .layout-left .scene-layout {
      flex-direction: row;
    }

    .layout-left .scene-image {
      max-width: 45%;
    }

    /* 이미지 우측 텍스트 좌측 */
    .layout-right .scene-layout {
      flex-direction: row-reverse;
    }

    .layout-right .scene-image {
      max-width: 45%;
    }

    .scene-text {
      flex: 1;
      min-width: 0;
    }

    .scene-text h2 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.4;
      letter-spacing: -0.5px;
    }

    .scene-text p {
      font-size: 18px;
      line-height: 1.8;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    /* 풀 이미지 오버레이 */
    .layout-full {
      position: relative;
    }

    .layout-full .scene-layout {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 60px;
      align-items: flex-end;
    }

    .layout-full .scene-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
      border-radius: 0;
    }

    .layout-full .scene-text {
      position: relative;
      z-index: 2;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%);
      padding: 40px;
      border-radius: 12px;
    }

    /* 하단 네비게이션 */
    .footer {
      padding: 20px;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid var(--accent-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .nav-buttons {
      display: flex;
      gap: 10px;
    }

    button {
      padding: 10px 20px;
      background: var(--accent-color);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .scene-counter {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .scene-indicator {
      display: flex;
      gap: 8px;
    }

    .indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .indicator-dot.active {
      background: var(--accent-color);
      transform: scale(1.2);
    }

    /* 반응형 */
    @media (max-width: 768px) {
      .scene-layout {
        flex-direction: column;
        padding: 20px;
        gap: 20px;
      }

      .layout-left .scene-layout,
      .layout-right .scene-layout {
        flex-direction: column;
      }

      .layout-left .scene-image,
      .layout-right .scene-image {
        max-width: 100%;
      }

      .scene-text h2 {
        font-size: 24px;
      }

      .scene-text p {
        font-size: 16px;
      }

      .header h1 {
        font-size: 22px;
      }

      .footer {
        flex-wrap: wrap;
      }
    }

    /* 인쇄 스타일 */
    @media print {
      body {
        background: white;
      }

      .header, .footer {
        display: none;
      }

      .scene-container {
        page-break-after: always;
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 헤더 -->
    <div class="header">
      <h1>${this.escapeHtml(projectName)}</h1>
      <p>${scenes.length}개 씬 · ${template.font} · ${template.color}</p>
    </div>

    <!-- 콘텐츠 -->
    <div class="content">
      ${scenes
        .map(
          (scene, idx) => `
        <div class="scene-container ${idx === 0 ? 'active' : ''}" data-index="${idx}">
          <div class="scene-layout layout-${layoutType}">
            ${scene.imageUrl ? `<img src="${this.escapeHtml(scene.imageUrl)}" alt="Scene" class="scene-image" />` : ''}
            <div class="scene-text">
              <h2>씬 ${idx + 1}</h2>
              <p>${this.escapeHtml(scene.text)}</p>
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <!-- 푸터 (네비게이션) -->
    ${
      showNavigation
        ? `
    <div class="footer">
      <div class="nav-buttons">
        <button id="prevBtn">← 이전</button>
        <button id="nextBtn">다음 →</button>
      </div>
      <div class="scene-counter">
        <span id="sceneNumber">1</span> / ${scenes.length}
      </div>
      <div class="scene-indicator">
        ${scenes.map((_, idx) => `<div class="indicator-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></div>`).join('')}
      </div>
    </div>
    `
        : ''
    }
  </div>

  <script>
    // 상태 관리
    let currentIndex = 0;
    const totalScenes = ${scenes.length};
    const autoPlayEnabled = ${autoPlay ? 'true' : 'false'};

    function updateScene(index) {
      if (index < 0 || index >= totalScenes) return;

      currentIndex = index;

      // 씬 표시 업데이트
      document.querySelectorAll('.scene-container').forEach((el) => {
        el.classList.remove('active');
      });
      document.querySelectorAll('.scene-container')[index].classList.add('active');

      // 카운터 업데이트
      if (document.getElementById('sceneNumber')) {
        document.getElementById('sceneNumber').textContent = index + 1;
      }

      // 인디케이터 업데이트
      document.querySelectorAll('.indicator-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });

      // 버튼 상태 업데이트
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === totalScenes - 1;
    }

    // 이벤트 리스너
    if (document.getElementById('prevBtn')) {
      document.getElementById('prevBtn').addEventListener('click', () => updateScene(currentIndex - 1));
    }
    if (document.getElementById('nextBtn')) {
      document.getElementById('nextBtn').addEventListener('click', () => updateScene(currentIndex + 1));
    }

    // 인디케이터 클릭
    document.querySelectorAll('.indicator-dot').forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        updateScene(index);
      });
    });

    // 키보드 네비게이션
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') updateScene(currentIndex - 1);
      if (e.key === 'ArrowRight') updateScene(currentIndex + 1);
    });

    // 초기 상태
    updateScene(0);

    // 자동 재생
    ${
      autoPlay
        ? `
    let autoPlayInterval = setInterval(() => {
      if (currentIndex < totalScenes - 1) {
        updateScene(currentIndex + 1);
      } else {
        clearInterval(autoPlayInterval);
      }
    }, 5000);
    `
        : ''
    }
  </script>
</body>
</html>`;
  }

  /**
   * HTML을 파일로 다운로드
   */
  async downloadHTML(html: string, filename: string): Promise<void> {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 색상 스키마 가져오기
   */
  private getColorScheme(
    colorName: string
  ): { primary: string; secondary: string; accent: string; textPrimary: string; textSecondary: string } {
    const schemes: Record<
      string,
      { primary: string; secondary: string; accent: string; textPrimary: string; textSecondary: string }
    > = {
      '차가운 블루': {
        primary: '#0f172a',
        secondary: '#1e3a8a',
        accent: '#3b82f6',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1'
      },
      '따뜻한 오렌지': {
        primary: '#7c2d12',
        secondary: '#92400e',
        accent: '#f97316',
        textPrimary: '#fefce8',
        textSecondary: '#fed7aa'
      },
      '신비로운 보라': {
        primary: '#2e1065',
        secondary: '#581c87',
        accent: '#a855f7',
        textPrimary: '#faf5ff',
        textSecondary: '#e9d5ff'
      },
      '세련된 회색': {
        primary: '#1f2937',
        secondary: '#374151',
        accent: '#9ca3af',
        textPrimary: '#f9fafb',
        textSecondary: '#d1d5db'
      },
      '생생한 무지개': {
        primary: '#831843',
        secondary: '#be185d',
        accent: '#ec4899',
        textPrimary: '#fdf2f8',
        textSecondary: '#fbcfe8'
      },
      '어두운 밤': {
        primary: '#0c0a09',
        secondary: '#1c1917',
        accent: '#78716c',
        textPrimary: '#faf8f7',
        textSecondary: '#a8a29e'
      }
    }

    return schemes[colorName] || schemes['신비로운 보라']
  }

  /**
   * 폰트 패밀리 가져오기
   */
  private getFontFamily(fontName: string): string {
    const fonts: Record<string, string> = {
      'Noto Sans':
        '"Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'Noto Serif':
        '"Noto Serif KR", Georgia, "Times New Roman", serif',
      'Playfair Display':
        '"Playfair Display", Georgia, serif',
      'Roboto Mono':
        '"Roboto Mono", Courier, monospace',
      'Gowun Batang':
        '"Gowun Batang", Georgia, serif'
    }

    return fonts[fontName] || fonts['Noto Sans']
  }

  /**
   * HTML 이스케이프
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (char) => map[char])
  }
}

export const htmlExporter = new HTMLExporter()
export default htmlExporter
