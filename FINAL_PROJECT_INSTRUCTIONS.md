# AI-Assisted Deep Learning Project

> Vanderbilt Data Science — Deep Learning final project. Team size: 1–3 students | Total: 300 points.
>
> This file is a Markdown transcription of `Final Project Instruction.pdf` so the requirements are
> easy to reference in the repo.

## 1. Project Purpose

The goal is to complete the full life cycle of a modern deep learning application: define a
problem, select data, build or adapt a model, evaluate it, analyze failures, and deploy a usable
online application. You are encouraged to use generative AI tools such as ChatGPT, Claude,
Gemini, or coding assistants to work more efficiently, but you remain responsible for
understanding and verifying the final system.

This course does not assume that students own GPUs. Projects should therefore be feasible
with free or limited cloud resources. Transfer learning, lightweight fine-tuning, frozen feature
extractors, compact models, and CPU-friendly inference are strongly encouraged.

## 2. Team Size and Scope

Teams may have one, two, or three students. Scope should scale with team size. In
multi-student teams, simply assigning one person to the model, one to the website, and one to
the report is not sufficient. Each student must explain at least one model, experiment, or
evaluation component that they personally implemented, while all members are expected to
understand the overall system.

## 3. Core Technical Requirements

The project must contain at least one genuine deep neural network that is central to the
application. You must be able to explain the model input and output, preprocessing,
architecture, training or adaptation strategy, objective or loss when applicable, inference
pipeline, and evaluation metrics. Pretrained models are welcome, but they may not be treated
as unexplained black boxes. A pure wrapper around an external model API does not qualify as
the main deep learning component.

## 4. Data Policy

Well-documented public datasets are strongly preferred because they allow you to focus on
deep learning, make evaluation more reproducible, and reduce time spent on collection and
labeling. Suitable sources include established academic datasets, Hugging Face Datasets,
Kaggle datasets with clear provenance and licensing, torchvision or TensorFlow datasets, UCI
resources, government open-data portals, and other reputable repositories.

You should understand dataset size, labels, class balance, licensing, bias, train/validation/test
splits, and possible data leakage. Creating your own dataset is strongly not recommended and
provides no automatic extra credit.

## 5. Acceptable and Unacceptable Approaches

Acceptable approaches include training a modest neural network, transfer learning, lightweight
fine-tuning, pretrained embeddings, model compression, quantization, pruning, distillation, and
other compute-efficient methods. Traditional machine learning may be used as a baseline.

Projects do not qualify if they are primarily a web-development exercise, a traditional
machine-learning project with no meaningful neural component, a pure commercial API
wrapper, or a downloaded pretrained model wrapped in a simple interface with no serious
evaluation, comparison, or error analysis. Projects requiring extensive GPU time may be
rejected unless the team has already secured appropriate computing resources.

## 6. Online Application and Deployment

The final system must provide a usable application with the pipeline
**user input → preprocessing → deep learning inference → clearly presented output**.
Gradio, Streamlit, Flask, FastAPI, or a JavaScript front end with a Python backend, or similar
tools are acceptable. A simple and reliable interface is preferred to a visually elaborate one.

The application should be available through a working online URL and should perform real
model inference. CPU-friendly deployment is preferred. Teams should also keep a local
runnable backup. A static mockup, screenshots, or a prerecorded interface alone do not count
as deployment.

## 7. Grading: 300 Points

### Proposal (pdf format) — 50 points

| Component | Points | Description |
| --- | --- | --- |
| Problem definition and motivation | 10 | Clearly explain the problem being solved and why it matters. |
| Target user and use case | 5 | Identify who will use the system and what they will use it for. |
| Public dataset | 10 | Identify an appropriate public dataset and explain its size, labels, inputs, outputs, and suitability for the task. |
| Proposed deep learning approach | 10 | Describe the planned model or model family and explain why it is appropriate. |
| Evaluation plan | 5 | Specify the main quantitative metrics and how performance will be evaluated. |
| Computing feasibility | 5 | Explain why training and experimentation are realistic given available computing resources and time. |
| Deployment plan | 5 | Explain how the trained model will be deployed in an online application. |

**Total: 50 pts**

### Final Submission Files — 50 points

Each student submits one URL, one report, and one video.

- **Deploy One URL (web url format) — 10 pts.** Deployed App. Submit the working online deep learning application. For a 2–3 student team, all members may submit the same application URL.
- **Submit One Report (md format) — 10 pts.** Individual Report. Each student submits a different report describing the project, model, key results, experiments, evaluation, failure analysis, personal technical contribution, and use of Gen-AI. Reports from team members should reflect their own work and understanding.
- **Submit One Video (mp4 format) — 10 pts.** Individual Video. Each student submits a different 3–8 minute video showing how to run the demo using the above URL and present the `.md` Report. For team projects, the URL may be shared, but the report and video must be individual submissions and fundamentally different.
- **Correct File Naming — 10 pts.** All submitted files must follow the required naming convention exactly:
  - Report: `FirstName_LastName_VUID_Report.md`
  - Video: `FirstName_LastName_VUID_Video.mp4`
- **Correct Submission Format — 10 pts.** All submission components must use the required format:
  - URL: working URL
  - Report: `.md` format
  - Video: `.mp4` format
  - Video length: approximately 3–8 minutes

### a. Technical Contribution and Individual Accountability (Overall) — 50 points

| Component | Points | Description |
| --- | --- | --- |
| Identifiable technical contribution | 15 | Each student must have a clearly identifiable technical contribution such as model development, model comparison, experimentation, evaluation, optimization, or deployment. |
| Technical depth | 20 | The contribution should involve meaningful technical work rather than only interface design, documentation, or project coordination. |
| Understanding of own contribution | 10 | The student should be able to clearly explain the implementation, design decisions, limitations, and results of their work. |
| Understanding of the overall system | 5 | The student should understand how the major parts of the project fit together. |

**Total: 50 pts**

### b. Online Deployment and Application Quality (for "One URL") — 50 points

| Component | Points | Description |
| --- | --- | --- |
| Working online application | 20 | The project must provide a working online application accessible through a browser. |
| Real model inference | 10 | The application must run the actual trained model or inference pipeline rather than return hard-coded or simulated outputs. |
| Input/output behavior | 10 | Inputs should be processed correctly and outputs should be meaningful, understandable, and consistent with the model. |
| Latency and usability | 5 | Inference time should be reasonable and the application should be easy to use. |
| Interface quality | 5 | The interface should be clear and usable. Visual polish is helpful but is less important than functionality. |

**Total: 50 pts**

### c. Report and Technical Documentation (for "One Report") — 50 points

| Component | Points | Description |
| --- | --- | --- |
| Problem, data, and model description | 10 | Clearly explain the task, dataset, preprocessing, model, and technical approach. |
| Training and experimental methodology | 10 | Describe training procedures, important hyperparameters, comparisons, and experimental setup. |
| Results and interpretation | 10 | Clearly summarize the main results and explain what they mean. |
| Failure/error analysis | 10 | Discuss important weaknesses, failure cases, or limitations of the system. |
| Deployment documentation | 5 | Explain how the model is deployed and how the application performs inference. |
| Figures, tables, and writing quality | 5 | Figures and tables should be clear and appropriately labeled, and technical writing should be concise and accurate. |

**Total: 50 pts**

### e. Pre-recorded Presentation Quality (for "One Video") — 50 points

| Component | Points | Description |
| --- | --- | --- |
| Show How to Run a Demo | 10 | Clearly demonstrate the deployed application using the submitted URL. |
| Cover Project Documentation | 10 | Clearly explain the main contents of your Markdown (`.md`) document, including the project goal, model, dataset, evaluation, and how to run or use the application. |
| Individual Contribution | 15 | Clearly explain what you personally implemented, tested, evaluated, or deployed, which distinguishes your work from your teammates' contributions. |
| Explain Gen-AI Usage | 10 | Clearly identify which and how tools were used, such as ChatGPT, Claude, Gemini, Copilot, or similar systems, and what they were used for. |
| Presentation Clarity | 5 | The video should be organized, understandable, and technically accurate. Professional video editing is not required. |

**Total: 50 pts**

## What Makes a Strong Project?

The goal of the final project is to show people (not only me) your AI skills through a shareable
website URL. A strong project should result in a URL that you are proud to demonstrate,
confident to share with a hiring manager, and able to keep using as part of your portfolio
throughout your career.

A strong project does not require a huge dataset, expensive GPUs, a massive model, or a fancy
website. The best projects combine a clear and meaningful problem, a reputable public dataset,
an appropriate deep learning approach, well-designed experiments, careful evaluation, honest
failure analysis, responsible and effective use of Gen-AI, and a reliable deployed application.
