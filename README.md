# 🤖 Charisro AI Company

Charisro(카리스로)는 완전 자율형 AI 에이전트들이 협력하여 아이디어를 기획하고 어플리케이션 설계 및 발표자료(PPTX)까지 구축해내는 시스템입니다.
수석 PM, UX/UI 전문가, 수석 엔지니어, PPT 마스터가 CrewAI를 기반으로 협업합니다.

## ✨ 주요 기능
- **Streamlit Web Dashboard**: 직관적인 웹 대시보드를 통해 프로젝트를 편리하게 관리하고 결과물을 브라우저상에서 다운로드 받을 수 있습니다.
- **다중 모델 지원 (Multi-LLM Selector)**: Gemini, GPT-4o, Claude 등 역할별로 최적의 언어 모델을 웹에서 동적으로 배정할 수 있습니다.
- **RAG 기반 지능형 텍스트 추출**: PDF, PPTX, TXT 등 문서 파일을 드래그 앤 드롭 업로드하면 에이전트가 이를 Context로 자동 학습합니다.
- **PPTX 파일 자동 생성 툴**: 텍스트를 파싱하는 수준을 넘어 발표 대본에 맞춘 10장 구성의 파워포인트(`.pptx`) 파일을 자동 생성합니다. (Custom Tool)

## 🚀 실행 및 설치 방법

### 1단계: 가상 환경 생성 및 진입
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2단계: 패키지 설치
```bash
pip install -r requirements.txt
```

### 3단계: 환경 변수 세팅 (선택)
`.env` 파일을 루트에 생성하여 다음 키를 미리 세팅할 수 있습니다. (설정하지 않으면 웹 UI에서 입력 가능합니다!)
```env
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### 4단계: 어플리케이션 구동
```bash
streamlit run app.py
```
브라우저 탭이 자동으로 생성되며, (http://localhost:8501) 에서 작업이 가능해집니다.
