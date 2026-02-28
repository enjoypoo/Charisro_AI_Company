import os
import io
import json
import streamlit as st
import PyPDF2
from pptx import Presentation
from dotenv import load_dotenv

# CrewAI & Tools
from crewai import Agent, Task, Crew, Process
from crewai_tools import DirectoryReadTool, FileReadTool, FileWriterTool
from crewai.tools import tool

# 환경 변수 로드
load_dotenv()

# ==========================================
# 1. 파일 텍스트 추출 (RAG 기초) 컴포넌트
# ==========================================
def extract_text_from_file(uploaded_file):
    text = ""
    file_type = uploaded_file.name.split('.')[-1].lower()
    try:
        if file_type == 'pdf':
            pdf_reader = PyPDF2.PdfReader(uploaded_file)
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif file_type == 'pptx':
            prs = Presentation(uploaded_file)
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text += shape.text + "\n"
        elif file_type == 'txt':
            text = uploaded_file.getvalue().decode("utf-8")
    except Exception as e:
        st.error(f"파일 텍스트 추출 중 오류 발생 ({uploaded_file.name}): {e}")
    return text

# ==========================================
# 2. PPTX 자동 생성 커스텀 도구 (Agent 용)
# ==========================================
@tool("CreatePptxTool")
def create_pptx_tool(json_slides_data: str) -> str:
    """
    이 도구는 JSON 형태의 슬라이드 데이터를 받아 10장 분량의 실제 파워포인트 파일(.pptx)을 생성하고 
    저장합니다. 데이터 형식은 JSON 문자열이어야 합니다:
    [
      {"title": "슬라이드 1 제목", "content": "본문 내용이나 핵심 문구"}
    ]
    """
    try:
        slides_data = json.loads(json_slides_data)
        prs = Presentation()
        output_dir = os.environ.get("CURRENT_PROJECT_OUTPUT_DIR", "outputs")
        
        for i, slide_info in enumerate(slides_data):
            if i >= 10: break
            title_text = slide_info.get("title", "")
            content_text = slide_info.get("content", "")
            if i == 0:
                slide_layout = prs.slide_layouts[0]
                slide = prs.slides.add_slide(slide_layout)
                title = slide.shapes.title
                subtitle = slide.placeholders[1]
                title.text = title_text
                subtitle.text = content_text
                for paragraph in title.text_frame.paragraphs:
                    for run in paragraph.runs: run.font.name = 'Malgun Gothic'
                for paragraph in subtitle.text_frame.paragraphs:
                    for run in paragraph.runs: run.font.name = 'Malgun Gothic'
            else:
                slide_layout = prs.slide_layouts[1]
                slide = prs.slides.add_slide(slide_layout)
                title = slide.shapes.title
                body = slide.placeholders[1]
                title.text = title_text
                body.text = content_text
                for paragraph in title.text_frame.paragraphs:
                    for run in paragraph.runs: run.font.name = 'Malgun Gothic'
                for paragraph in body.text_frame.paragraphs:
                    for run in paragraph.runs: run.font.name = 'Malgun Gothic'
                        
        output_path = os.path.join(output_dir, "presentation.pptx")
        prs.save(output_path)
        return f"성공적으로 {output_path} 파일이 생성되었습니다."
    except Exception as e:
        return f"PPTX 파일 생성 중 오류가 발생했습니다: {str(e)}"

# ==========================================
# 3. CrewAI 에이전트 팩토리 함수
# ==========================================
def run_crew(project_name, topic, context_text, llm_configs):
    base_dir = os.path.join("projects", project_name)
    output_dir = os.path.join(base_dir, "outputs")
    os.environ["CURRENT_PROJECT_OUTPUT_DIR"] = output_dir

    file_writer_tool = FileWriterTool()
    file_read_tool = FileReadTool()
    directory_read_tool = DirectoryReadTool(directory=output_dir)

    agent_tools = [directory_read_tool, file_read_tool, file_writer_tool]
    ppt_tools = [directory_read_tool, file_read_tool, file_writer_tool, create_pptx_tool]

    chief_pm = Agent(
        role='카리스로 수석 PM',
        goal=f'"{topic}" 프로젝트의 상세 기획안(PRD)을 작성하고 {output_dir}/plan.md 파일에 저장함',
        backstory='당신은 카리스로의 리더입니다. 논리적이고 체계적인 의사결정 전문가이자 훌륭한 문서 작성자입니다. 항상 한국어로 작성하며 전문 기술 용어는 영어와 병기합니다.',
        llm=llm_configs['pm_llm'],
        verbose=True,
        allow_delegation=True,
        tools=agent_tools
    )

    designer = Agent(
        role='UX/UI 전략가',
        goal=f'기획안을 바탕으로 Tailwind CSS 스타일 시트와 UI 컴포넌트 구조를 작성하고 {output_dir}/style.css 및 {output_dir}/ui_components.md로 저장함',
        backstory='미니멀리즘을 선호하는 베테랑 디자이너입니다. Tailwind CSS에 능통합니다.',
        llm=llm_configs['designer_llm'],
        verbose=True,
        tools=agent_tools
    )

    developer = Agent(
        role='수석 엔지니어',
        goal=f'기획안과 디자인을 참조하여 Next.js/Node.js 핵심 로직 코드를 구상하고 {output_dir}/app.js에 저장함',
        backstory='확장성 있는 코드를 작성하는 풀스택 개발 전문가입니다. 최신 React 생태계와 Node.js 백엔드를 설계합니다.',
        llm=llm_configs['developer_llm'],
        verbose=True,
        tools=agent_tools
    )

    ppt_master = Agent(
        role='PPT 마스터',
        goal=f'결과물을 취합해 투자 유치용 대본({output_dir}/pitch_script.md)을 쓰고, CreatePptxTool을 사용해 파워포인트 파일(presentation.pptx)을 자동 생성함',
        backstory='비즈니스 문서를 시각적으로 완벽히 정리하는 전문가. 파이썬 기반 PPTX 생성기를 완벽히 다룹니다.',
        llm=llm_configs['ppt_llm'],
        verbose=True,
        tools=ppt_tools
    )

    plan_description = f'''
    1. 주제: "{topic}"
    2. 아래 제공된 참고 문서(Context)의 내용을 최우선으로 반영하여 상세 기획안(PRD)을 작성하세요.
    [참고 문서 내용 시작]
    {context_text}
    [참고 문서 내용 끝]
    3. 반드시 `FileWriterTool`을 사용하여 작업 결과를 `{output_dir}/plan.md` 파일로 저장하세요.
    '''
    task_plan = Task(
        description=plan_description,
        expected_output=f"상세 PRD가 포함된 {output_dir}/plan.md 파일",
        agent=chief_pm
    )

    task_design = Task(
        description=f'''
        1. `FileReadTool`을 사용하여 `{output_dir}/plan.md` 파일을 읽어 프로젝트 기획안을 파악하세요.
        2. 기획안을 바탕으로 매력적인 Tailwind CSS 기반의 스타일 시트를 작성해 `{output_dir}/style.css`로 저장하세요.
        3. UI 컴포넌트 구조 명세서를 작성해 `{output_dir}/ui_components.md`로 저장하세요.
        ''',
        expected_output=f"{output_dir}/style.css 및 {output_dir}/ui_components.md 파일",
        agent=designer,
        context=[task_plan]
    )

    task_develop = Task(
        description=f'''
        1. `DirectoryReadTool` 및 `FileReadTool`을 사용해 `{output_dir}/plan.md`와 `{output_dir}/ui_components.md`, `{output_dir}/style.css`를 참조하세요.
        2. 실제 동작 가능한 Next.js/Node.js 핵심 로직 코드(API 및 컴포넌트 구조)를 작성하세요.
        3. 코드를 `{output_dir}/app.js`에 저장하세요.
        ''',
        expected_output=f"{output_dir}/app.js 파일",
        agent=developer,
        context=[task_design]
    )

    task_document = Task(
        description=f'''
        1. 앞선 기획, 디자인, 개발 파일들을 읽어 종합하여 발표 대본을 작성하고 `{output_dir}/pitch_script.md`에 저장하세요.
        2. 작성한 대본을 바탕으로 총 10장 구성의 슬라이드 데이터를 JSON 포맷({{"title": "...", "content": "..."}})으로 구성하세요.
        3. 도출된 JSON 문자열을 `CreatePptxTool`에 넘겨 호출하여 `{output_dir}/presentation.pptx` 파일 자동 생성을 완료하세요.
        ''',
        expected_output=f"{output_dir}/pitch_script.md 및 {output_dir}/presentation.pptx (실제 파일 생성 증빙)",
        agent=ppt_master,
        context=[task_develop]
    )

    charisro_team = Crew(
        agents=[chief_pm, designer, developer, ppt_master],
        tasks=[task_plan, task_design, task_develop, task_document],
        process=Process.sequential
    )
    
    return charisro_team.kickoff(inputs={'topic': topic})

# ==========================================
# 4. Streamlit UI (main)
# ==========================================
def main():
    st.set_page_config(page_title="Charisro AI Dashboard", page_icon="🤖", layout="wide")
    
    st.title("🤖 카리스로(Charisro) AI 자율 기획 시스템")
    st.markdown("수석 PM, UX/UI 전문가, 개발자, PPT 마스터가 파일 시스템을 제어하며 협업하는 완전 자율형 작업 공간입니다.")
    
    # 사이드바 설정 영역
    with st.sidebar:
        st.header("1. API 연동 상태")
        
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            st.success("✅ OpenAI API Key 등록됨")
        else:
            new_openai = st.text_input("OpenAI API Key (미입력 시 에러 가능)", type="password")
            if new_openai: os.environ["OPENAI_API_KEY"] = new_openai
            
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            st.success("✅ Gemini API Key 등록됨")
        else:
            new_gemini = st.text_input("Gemini API Key (미입력 시 에러 가능)", type="password")
            if new_gemini: os.environ["GEMINI_API_KEY"] = new_gemini
            
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        if anthropic_key:
            st.success("✅ Anthropic API Key 등록됨")
        else:
            new_anthropic = st.text_input("Anthropic API Key (Claude 구동 시 필요)", type="password")
            if new_anthropic: os.environ["ANTHROPIC_API_KEY"] = new_anthropic

        st.divider()
        st.header("2. 에이전트 모델 설정")
        pm_model = st.selectbox("수석 PM", ["gemini/gemini-2.5-flash", "gemini/gemini-2.5-pro", "gemini/gemini-1.5-pro"])
        designer_model = st.selectbox("UX/UI 전략가", ["openai/gpt-4o", "openai/gpt-4-turbo"])
        developer_model = st.selectbox("수석 엔지니어", ["anthropic/claude-3-opus-20240229", "anthropic/claude-sonnet-4-6", "anthropic/claude-3-5-sonnet-20241022", "gemini/gemini-2.5-flash"])
        ppt_model = st.selectbox("PPT 마스터", ["openai/gpt-4o", "openai/gpt-4-turbo"])
        
        st.divider()
        st.header("3. 프로젝트 설정")
        project_name = st.text_input("프로젝트 이름 (폴더 단위로 쓰입니다)", value="demo_project")
        work_mode = st.selectbox("작업 모드", ["신규 생성 (처음부터 기획)", "기존 문서 분석 후 확장"])
        
    llm_configs = {
        'pm_llm': pm_model,
        'designer_llm': designer_model,
        'developer_llm': developer_model,
        'ppt_llm': ppt_model
    }

    base_dir = os.path.join("projects", project_name)
    uploads_dir = os.path.join(base_dir, "uploads")
    outputs_dir = os.path.join(base_dir, "outputs")
    
    # 메인 영역
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("1. 기획 지시사항")
        topic = st.text_area("프로젝트 주제 / 핵심 키워드 / 주요 기능을 상세히 입력하세요.", height=150)
        
        st.info(f"작업 투입 모델: \n\n🦸‍♂️ **PM**: `{pm_model}` | 👩‍🎨 **디자이너**: `{designer_model}` | 👩‍💻 **엔지니어**: `{developer_model}` | 📊 **PPT 마스터**: `{ppt_model}`")
        
    with col2:
        st.subheader("2. 지능형 참고 파일 (RAG)")
        uploaded_files = st.file_uploader(
            "참고할 문서(PDF, PPTX, TXT)를 무제한으로 드래그 앤 드롭 하세요.",
            type=["pdf", "pptx", "txt"],
            accept_multiple_files=True
        )
        
    if st.button("🚀 카리스로 팀 가동하기 (Kickoff)", use_container_width=True):
        if not topic.strip():
            st.error("프로젝트 주제를 입력해주세요!")
            return
            
        # 선택된 프로바이더에 해당하는 API 키가 환경 변수에 존재하는지 확인하는 방어 기제
        used_providers = [m.split('/')[0] for m in llm_configs.values()]
        if "gemini" in used_providers and not os.getenv("GEMINI_API_KEY"):
            st.error("Gemini 모델이 선택되었지만 API Key가 누락되었습니다. 사이드바에 입력해주세요.")
            return
        if "openai" in used_providers and not os.getenv("OPENAI_API_KEY"):
            st.error("OpenAI 모델이 선택되었지만 API Key가 누락되었습니다. 사이드바에 입력해주세요.")
            return
        if "anthropic" in used_providers and not os.getenv("ANTHROPIC_API_KEY"):
            st.error("Anthropic(Claude) 모델이 선택되었지만 API Key가 누락되었습니다. 사이드바에 입력해주세요.")
            return
            
        os.makedirs(uploads_dir, exist_ok=True)
        os.makedirs(outputs_dir, exist_ok=True)
        
        context_text = ""
        if uploaded_files:
            with st.spinner("업로드된 문서를 분석 중입니다..."):
                for uf in uploaded_files:
                    file_path = os.path.join(uploads_dir, uf.name)
                    with open(file_path, "wb") as f:
                        f.write(uf.getbuffer())
                    extracted = extract_text_from_file(uf)
                    if extracted:
                        context_text += f"\n\n--- [파일명: {uf.name}] ---\n" + extracted
            st.success(f"{len(uploaded_files)}개 문서 추출 완료! 전략에 자동으로 참고됩니다.")
            
        with st.status("🧠 에이전트 군단이 작업을 수행하고 있습니다...", expanded=True) as status:
            st.write(f"- 📁 결과물 저장 경로: `projects/{project_name}/outputs/`")
            try:
                result = run_crew(project_name, topic, context_text, llm_configs)
                status.update(label="✅ 모든 작업이 완료되었습니다!", state="complete", expanded=False)
            except Exception as e:
                status.update(label="❌ 에러가 발생했습니다.", state="error")
                st.error(f"실행 중 구조적 오류가 발생했습니다: {str(e)}")
                return
                
        st.success("문서 생성이 완벽하게 완료되었습니다! 아래 폴더 단위 대시보드를 확인하세요.")
        
    st.divider()
    
    st.header("📊 결과물 대시보드")
    if os.path.exists(outputs_dir):
        files = os.listdir(outputs_dir)
        if files:
            tab1, tab2, tab3, tab4, tab5 = st.tabs(["기획서 (plan.md)", "디자인/UI 명세", "소스 코드 (app.js)", "발표 대본", "최종 PPTX 파일"])
            
            def read_file(filename):
                path = os.path.join(outputs_dir, filename)
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as f:
                        return f.read()
                return "파일이 아직 생성되지 않았습니다."
                
            def get_file_bytes(filename):
                path = os.path.join(outputs_dir, filename)
                if os.path.exists(path):
                    with open(path, "rb") as f:
                        return f.read()
                return None
            
            with tab1:
                st.markdown(read_file("plan.md"))
                bt = get_file_bytes("plan.md")
                if bt: st.download_button("📝 plan.md 다운로드", data=bt, file_name="plan.md", mime="text/markdown")
            
            with tab2:
                st.subheader("1. 스타일 시트 (style.css)")
                st.code(read_file("style.css"), language="css")
                bt1 = get_file_bytes("style.css")
                if bt1: st.download_button("🎨 style.css 다운로드", data=bt1, file_name="style.css")
                
                st.subheader("2. UI 컴포넌트 명세서")
                st.markdown(read_file("ui_components.md"))
                bt2 = get_file_bytes("ui_components.md")
                if bt2: st.download_button("🧩 ui_components.md 다운로드", data=bt2, file_name="ui_components.md")
                
            with tab3:
                st.code(read_file("app.js"), language="javascript")
                bt = get_file_bytes("app.js")
                if bt: st.download_button("💻 app.js 다운로드", data=bt, file_name="app.js")
                
            with tab4:
                st.markdown(read_file("pitch_script.md"))
                bt = get_file_bytes("pitch_script.md")
                if bt: st.download_button("🎙️ pitch_script.md 다운로드", data=bt, file_name="pitch_script.md")
                
            with tab5:
                st.info("PPT 마스터가 `python-pptx`를 통해 자동 생성한 발표 파일입니다.")
                bt = get_file_bytes("presentation.pptx")
                if bt: 
                    st.download_button(
                        label="📥 presentation.pptx 다운로드", 
                        data=bt, file_name="presentation.pptx", 
                        mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        type="primary"
                    )
        else:
            st.info("아직 생성된 결과물이 없습니다.")
    else:
        st.info(f"`{project_name}` 프로젝트 폴더가 존재하지 않습니다. 주제를 입력하고 가동해보세요!")

if __name__ == "__main__":
    main()
