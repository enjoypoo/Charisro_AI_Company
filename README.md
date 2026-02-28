# 🤖 Charisro(카리스로) AI 스튜디오

Charisro(카리스로)는 완전 자율형 AI 에이전트들이 협력하여 아이디어를 분석, 설계하고 어플리케이션 코딩 및 발표자료(PPTX)까지 논스톱으로 구축해내는 강력한 AI 워크스페이스입니다. 수석 PM, UX/UI 전략가, 수석 엔지니어, PPT 마스터가 CrewAI 기반으로 한 팀이 되어 일합니다.

## ✨ 26년형 메이저 업데이트 기능 가이드
- **Modern UI & Dashboard**: 최신 SaaS 트렌드에 맞춘 카드형 UI 및 아코디언 메뉴(Expander), 커스텀 CSS 적용으로 직관적인 컨트롤이 가능합니다.
- **선택적 파이프라인 (Checkboxes)**: 기획(필수)을 제외한 디자인, 코딩, 발표 자료 제작을 체크박스로 개별 선택하여 원하지 않는 과정의 딜레이를 획기적으로 줄였습니다. 
- **NotebookLM 딥-컨텍스트(RAG)**: PDF, PPTX, TXT 등 텍스트 기반 자료를 다수 업로드하면, 에이전트들의 뇌(Memory)에 절대적 우선순위 자료로 각인되어 사용자의 의도를 완벽히 트래킹합니다.
- **나노바나나 (Gemini Imagen 3.0) 엔진 탑재**: PPT 마스터가 발표 자료를 만들 때 전문적인 영어 비즈니스 이미지 프롬프트를 자가 생성하고, 구글의 첨단 Image API를 호출하여 메모리단(io.BytesIO)에서 즉시 슬라이드에 이미지를 심어줍니다.
- **다이나믹 프로젝트 폴더**: 이전의 히스토리 폴더 패키지들을 풀다운 메뉴로 불러와서 손쉽게 이어서 작업할 수 있습니다.
- **다중 모델 무한 스위칭**: Gemini 최신 모델, GPT-4o, Claude 3.5 Sonnet 등 역할별로 최적의 언어 모델을 앱에서 바로 지정할 수 있습니다.

## 🚀 설치 및 로컬 서버 가동법

### 1. 가상 환경 및 패키지 설치
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. 환경 변수 세팅 (선택)
웹 UI 좌측 사이드바에서 키를 직접 입력할 수도 있지만, 매번 입력하기 번거롭다면 프로젝트 루트에 `.env` 파일을 생성하고 아래 항목들을 기입하세요.
```env
# OpenAI 및 기본 에이전트용
OPENAI_API_KEY=your_key_here
# 수석 PM 기획 및 나노바나나 콜라보 이미지 생성용 (필수)
GEMINI_API_KEY=your_key_here
# 개발자 코딩용 (Claude 선택 시)
ANTHROPIC_API_KEY=your_key_here
```

### 3. 어플리케이션 구동
```bash
streamlit run app.py
```
브라우저 탭이 자동으로 생성되며, 카리스로 팀이 즉시 업무에 투입될 준비를 마칩니다. 
결과물은 `projects/[프로젝트명]/outputs/` 폴더에 마크다운, PDF, CSS, JS, PPTX 형식으로 자동 저장됩니다.
