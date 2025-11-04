import type { StudyTopic } from './types';
import {
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  SitemapIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ComputerDesktopIcon,
  BuildingLibraryIcon,
  TableCellsIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  XCircleIcon,
  ZoomInIcon,
  ArrowLeftIcon,
  RestartIcon,
  SearchIcon,
} from './components/Icons';

export const TOPICS: StudyTopic[] = [
  {
    id: 'administrative-supervision',
    title: 'Administrative Supervision',
    description: 'Overseeing administrative staff and functions, including planning, performance evaluation, and team motivation.',
    icon: BriefcaseIcon,
    iconName: 'management people team supervision',
    officialDescription: 'These questions test for knowledge of the principles and practices employed in planning, organizing, and controlling the activities of a work unit toward predetermined objectives. The concepts covered, usually in a situational question format, include such topics as assigning and reviewing work; evaluating performance; maintaining work standards; motivating and developing subordinates; implementing procedural change; increasing efficiency; and dealing with problems of absenteeism, morale, and discipline.',
    subTopics: [
      { id: 'planning-organizing', title: 'Planning & Organizing Work', description: 'Assigning tasks, setting standards, and reviewing work.', icon: ClipboardDocumentListIcon, iconName: 'planning tasks organization' },
      { id: 'performance-evaluation', title: 'Performance Evaluation', description: 'Techniques for evaluating employee performance and providing feedback.', icon: ChartBarIcon, iconName: 'performance review feedback' },
      { id: 'motivation-development', title: 'Motivation & Development', description: 'Strategies for motivating and developing subordinates.', icon: AcademicCapIcon, iconName: 'motivation training development' },
      { id: 'workplace-issues', title: 'Handling Workplace Issues', description: 'Addressing morale, absenteeism, and disciplinary problems.', icon: UsersIcon, iconName: 'morale discipline hr issues' }
    ]
  },
  {
    id: 'administrative-techniques',
    title: 'Administrative Techniques and Practices',
    description: 'Master modern techniques for efficient and effective office and process management.',
    icon: CogIcon,
    iconName: 'process techniques practices management',
    subTopics: [
        { id: 'workflow-optimization', title: 'Workflow Optimization', description: 'Analyzing and improving administrative workflows for efficiency.', icon: SitemapIcon, iconName: 'workflow process optimization' },
        { id: 'records-management', title: 'Records Management', description: 'Best practices for managing digital and physical records.', icon: ArchiveBoxIcon, iconName: 'records archive document management' },
        { id: 'resource-scheduling', title: 'Resource Scheduling', description: 'Techniques for scheduling staff, meetings, and other resources.', icon: BriefcaseIcon, iconName: 'scheduling resources planning' },
    ]
  },
  {
      id: 'analyzing-evaluating-information',
      title: 'Analyzing and Evaluating Information',
      description: 'Develop skills to critically analyze data and technical information to support decision-making.',
      icon: ChartBarIcon,
      iconName: 'data analysis chart graph information',
      subTopics: [
          { id: 'data-sourcing', title: 'Data Sourcing & Validation', description: 'Identifying reliable sources of information and validating data integrity.', icon: DocumentCheckIcon, iconName: 'data source validation' },
          { id: 'quantitative-analysis', title: 'Quantitative Analysis', description: 'Using numerical data to identify trends and patterns.', icon: TableCellsIcon, iconName: 'quantitative analysis numbers' },
          { id: 'qualitative-analysis', title: 'Qualitative Analysis', description: 'Interpreting non-numerical data like reports and feedback.', icon: DocumentTextIcon, iconName: 'qualitative analysis text' },
      ]
  },
  {
      id: 'evaluating-conclusions',
      title: 'Evaluating Conclusions from Factual Information',
      description: 'Techniques for validating conclusions and ensuring they are supported by evidence.',
      icon: DocumentCheckIcon,
      iconName: 'fact check conclusions report validation',
      officialDescription: 'These questions test your ability to evaluate and draw conclusions from factual information presented. Each question consists of a set of factual statements and a conclusion. You will be asked to determine whether the conclusion can be proven to be true by the facts, proven to be false by the facts, or if the facts are inadequate to prove the conclusion.',
      subTopics: [
          { id: 'logical-fallacies', title: 'Identifying Logical Fallacies', description: 'Recognizing common errors in reasoning to avoid flawed conclusions.', icon: XCircleIcon, iconName: 'logic fallacies reasoning' },
          { id: 'evidence-assessment', title: 'Assessing Evidence Sufficiency', description: 'Determining if the available facts are adequate to support a conclusion.', icon: ZoomInIcon, iconName: 'evidence assessment facts' },
          { id: 'deductive-inductive', title: 'Deductive vs. Inductive Reasoning', description: 'Understanding the difference between reasoning from general principles and specific observations.', icon: SitemapIcon, iconName: 'deductive inductive reasoning' },
      ]
  },
  {
      id: 'flowchart-reasoning',
      title: 'Logical Reasoning using Flowcharts',
      description: 'Using flowcharts and diagrams to model processes and solve complex logical problems.',
      icon: SitemapIcon,
      iconName: 'flowchart logic reasoning diagram process',
      officialDescription: 'These questions test for ability to reason logically by solving problems involving given variables expressed in flowcharts and accompanying information. All information needed to answer the questions is included within the flowcharts and the accompanying information. Prior knowledge of flowchart conventions is necessary to answer these questions.',
      subTopics: [
          { id: 'flowchart-symbols', title: 'Flowchart Symbols & Conventions', description: 'Understanding standard symbols for processes, decisions, and terminators.', icon: CogIcon, iconName: 'flowchart symbols conventions' },
          { id: 'tracing-paths', title: 'Tracing Logic Paths', description: 'Following the flow of a diagram based on given conditions and variables.', icon: ArrowLeftIcon, iconName: 'flowchart tracing logic path' },
          { id: 'complex-decisions', title: 'Complex Decision Structures', description: 'Analyzing flowcharts with nested decisions and multiple conditions.', icon: ComputerDesktopIcon, iconName: 'flowchart decision logic complex' },
      ]
  },
  {
      id: 'report-preparation',
      title: 'Preparing Reports and Official Documents',
      description: 'Best practices for creating clear, concise, and professional technical reports and documentation.',
      icon: DocumentTextIcon,
      iconName: 'reports documents writing preparation',
      subTopics: [
          { id: 'technical-writing', title: 'Technical Writing Standards', description: 'Principles of clarity, conciseness, and accuracy in technical documents.', icon: AcademicCapIcon, iconName: 'technical writing standards' },
          { id: 'data-visualization', title: 'Data Visualization in Reports', description: 'Effectively presenting data using charts, graphs, and tables.', icon: ChartBarIcon, iconName: 'data visualization charts reports' },
          { id: 'document-formatting', title: 'Document Formatting & Structure', description: 'Organizing information logically with proper formatting for readability.', icon: DocumentCheckIcon, iconName: 'formatting document structure' },
      ]
  },
  {
      id: 'strategic-planning',
      title: 'Strategic Planning, Budgets, and Contracts',
      description: 'Covers fiscal analysis, budget management, and contract administration in an IT context.',
      icon: ClipboardDocumentListIcon,
      iconName: 'planning budget contract finance strategy',
      subTopics: [
          { id: 'it-strategic-planning', title: 'IT Strategic Planning', description: 'Aligning IT goals and projects with organizational objectives.', icon: BuildingLibraryIcon, iconName: 'strategy planning it' },
          { id: 'budget-management', title: 'Budget Management & Fiscal Analysis', description: 'Creating, managing, and analyzing IT budgets.', icon: ChartBarIcon, iconName: 'budget finance analysis' },
          { id: 'contract-administration', title: 'Contract Administration', description: 'Overseeing the lifecycle of IT contracts and vendor agreements.', icon: DocumentTextIcon, iconName: 'contract vendor management' },
      ]
  },
  {
      id: 'supervision',
      title: 'Supervision',
      description: 'Core principles of supervising technical teams, including motivation, delegation, and performance management.',
      icon: UsersIcon,
      iconName: 'management people team supervision',
      officialDescription: 'These questions test for knowledge of the principles and practices employed in planning, organizing, and controlling the activities of a work unit toward predetermined objectives. The concepts covered, usually in a situational question format, include such topics as assigning and reviewing work; evaluating performance; maintaining work standards; motivating and developing subordinates; implementing procedural change; increasing efficiency; and dealing with problems of absenteeism, morale, and discipline.',
      subTopics: [
          { id: 'delegation-empowerment', title: 'Delegation & Empowerment', description: 'Effectively assigning tasks and empowering team members.', icon: CogIcon, iconName: 'delegation empowerment team' },
          { id: 'team-communication', title: 'Team Communication', description: 'Fostering clear and effective communication within a technical team.', icon: UsersIcon, iconName: 'communication team soft skills' },
          { id: 'conflict-resolution', title: 'Conflict Resolution', description: 'Managing and resolving disagreements within the team.', icon: XCircleIcon, iconName: 'conflict resolution team' },
          { id: 'change-management', title: 'Implementing Change', description: 'Guiding a team through procedural or technological changes.', icon: RestartIcon, iconName: 'change management process' },
      ]
  },
  {
      id: 'system-analysis',
      title: 'System Analysis and Design',
      description: 'Understand the lifecycle of IT systems, from requirements gathering to design and implementation.',
      icon: ComputerDesktopIcon,
      iconName: 'system analysis design technology computer',
      officialDescription: 'These questions test for techniques and concepts of computer systems analysis and design. They cover such subjects as feasibility and applications studies, systems development tools and software, the systems life cycle, types of systems (e.g., client/server, Web-based), controls, and systems documentation, testing, and implementation.',
      subTopics: [
          { id: 'sdlc', title: 'Systems Development Life Cycle (SDLC)', description: 'Understanding phases like planning, analysis, design, implementation, and maintenance.', icon: SitemapIcon, iconName: 'sdlc lifecycle development' },
          { id: 'requirements-gathering', title: 'Requirements Gathering', description: 'Techniques for eliciting and documenting user and system requirements.', icon: DocumentTextIcon, iconName: 'requirements analysis gathering' },
          { id: 'system-modeling', title: 'System Modeling & Design', description: 'Using tools to create models and design system architecture.', icon: CogIcon, iconName: 'system model design architecture' },
          { id: 'testing-implementation', title: 'System Testing & Implementation', description: 'Strategies for testing, deployment, and post-implementation review.', icon: DocumentCheckIcon, iconName: 'testing deployment implementation' },
      ]
  },
  {
      id: 'admin-principles',
      title: 'Understanding and Applying Administrative Principles',
      description: 'Applying fundamental administrative theories to real-world IT scenarios.',
      icon: BuildingLibraryIcon,
      iconName: 'principles administration theory structure',
      subTopics: [
          { id: 'org-structure', title: 'Organizational Structure & Design', description: 'Understanding different organizational models and their impact.', icon: SitemapIcon, iconName: 'organization structure hierarchy' },
          { id: 'policy-procedure', title: 'Policy and Procedure Application', description: 'Interpreting and applying official policies and procedures.', icon: DocumentTextIcon, iconName: 'policy procedure rules' },
          { id: 'public-administration', title: 'Principles of Public Administration', description: 'Core concepts of administration within a government context.', icon: BuildingLibraryIcon, iconName: 'public administration government' },
      ]
  },
  {
      id: 'tabular-data',
      title: 'Understanding and Interpreting Tabular Data',
      description: 'Skills for extracting insights and trends from spreadsheets, databases, and other tabular data formats.',
      icon: TableCellsIcon,
      iconName: 'data table spreadsheet database interpretation',
      officialDescription: 'These questions test your ability to understand, analyze, and use the internal logic of data presented in tabular form. You may be asked to perform tasks such as completing tables, drawing conclusions from them, analyzing data trends or interrelationships, and revising or combining data sets. The concepts of rate, ratio, and proportion are tested. Mathematical operations are simple, and computational speed is not a major factor in the test. You should bring with you a hand-held battery- or solar-powered calculator for use on this test. You will not be permitted to use the calculator function of your cell phone.',
      subTopics: [
          { id: 'data-extraction', title: 'Data Extraction & Filtering', description: 'Locating and isolating specific information within large datasets.', icon: SearchIcon, iconName: 'data extraction filter search' },
          { id: 'trend-analysis', title: 'Trend & Pattern Analysis', description: 'Identifying trends, relationships, and anomalies in tabular data.', icon: ChartBarIcon, iconName: 'trend analysis pattern data' },
          { id: 'calculations', title: 'Rates, Ratios, and Proportions', description: 'Performing calculations to derive meaningful metrics from data.', icon: CogIcon, iconName: 'calculations ratio rate proportion' },
      ]
  },
  {
      id: 'interacting-others',
      title: 'Working and Interacting with Others',
      description: 'Essential soft skills for collaboration, communication, and stakeholder management in a technical environment.',
      icon: UsersIcon,
      iconName: 'collaboration communication team soft skills',
      subTopics: [
          { id: 'interpersonal-skills', title: 'Interpersonal Communication', description: 'Effectively communicating with colleagues, stakeholders, and the public.', icon: UsersIcon, iconName: 'communication interpersonal skills' },
          { id: 'teamwork-collaboration', title: 'Teamwork and Collaboration', description: 'Working effectively as part of a team to achieve common goals.', icon: UsersIcon, iconName: 'teamwork collaboration group' },
          { id: 'customer-service', title: 'Customer & Stakeholder Relations', description: 'Providing excellent service to internal and external stakeholders.', icon: BriefcaseIcon, iconName: 'customer service stakeholder' },
      ]
  }
];