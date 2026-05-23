export const projects = [
  {
    id: 'finos',
    title: 'FinOS',
    subtitle: 'FinTech',
    description: 'A comprehensive financial operating system designed to streamline banking and investment management. Built with high-security standards and real-time data processing capabilities.',
    longDescription: 'FinOS is a next-generation financial management platform. It features real-time transaction tracking, automated budgeting, and deep investment analytics. The platform uses advanced encryption and multi-factor authentication to ensure maximum security for users\' financial data.',
    color: '#4B0082', // Indigo
    tags: ['React', 'Node.js', 'PostgreSQL', 'Fintech'],
    image: 'https://images.unsplash.com/photo-1551288049-bbbda546697a?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'vhire',
    title: 'VHire',
    subtitle: 'Interview Platform',
    description: 'An AI-powered interview platform that simplifies the recruitment process. Features automated scheduling, real-time coding assessments, and candidate feedback loops.',
    longDescription: 'VHire revolutionizes the hiring process by integrating AI-driven insights into candidate evaluations. It provides a seamless interface for both recruiters and applicants, featuring collaborative coding environments and automated interview summarization.',
    color: '#005A9C', // Deep Blue
    tags: ['React', 'Socket.io', 'WebRTC', 'AI'],
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'documind-ai',
    title: 'DocuMind AI',
    subtitle: 'Document Assistant',
    description: 'An intelligent document management system that uses NLP to categorize, summarize, and extract key information from large volumes of text.',
    longDescription: 'DocuMind AI leverages Large Language Models to transform how organizations handle documentation. It can automatically extract metadata, generate summaries, and provide conversational search capabilities over your entire document library.',
    color: '#006400', // Dark Green
    tags: ['Python', 'React', 'OpenAI API', 'NLP'],
    image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=1000'
  }
];

export const getProjects = () => {
  if (typeof window === 'undefined') return projects;
  const local = localStorage.getItem('custom_projects');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      return [...projects, ...parsed];
    } catch (e) {
      console.error('Failed to parse custom projects', e);
    }
  }
  return projects;
};

export const addProject = (project) => {
  if (typeof window === 'undefined') return;
  const local = localStorage.getItem('custom_projects');
  let custom = [];
  if (local) {
    try {
      custom = JSON.parse(local);
    } catch (e) {
      console.error(e);
    }
  }
  custom.push(project);
  localStorage.setItem('custom_projects', JSON.stringify(custom));
};

export const deleteProject = (id) => {
  if (typeof window === 'undefined') return;
  const local = localStorage.getItem('custom_projects');
  let custom = [];
  if (local) {
    try {
      custom = JSON.parse(local);
    } catch (e) {
      console.error(e);
    }
  }
  custom = custom.filter(p => p.id !== id);
  localStorage.setItem('custom_projects', JSON.stringify(custom));
};
