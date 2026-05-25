import finosShowcase from '../assets/finos_showcase.png';
import vhireShowcase from '../assets/vhire_showcase.png';
import documindShowcase from '../assets/documind_showcase.png';

export const projects = [
  {
    id: 'finos',
    title: 'FinOS',
    subtitle: 'FinTech',
    description: 'A comprehensive financial operating system designed to streamline banking and investment management. Built with high-security standards and real-time data processing capabilities.',
    longDescription: 'FinOS is a next-generation financial management platform. It features real-time transaction tracking, automated budgeting, and deep investment analytics. The platform uses advanced encryption and multi-factor authentication to ensure maximum security for users\' financial data.',
    color: '#002855', // MSCI dark navy / Indigo
    tags: ['React', 'Node.js', 'PostgreSQL', 'Fintech'],
    image: finosShowcase
  },
  {
    id: 'vhire',
    title: 'VHire',
    subtitle: 'Interview Platform',
    description: 'An AI-powered interview platform that simplifies the recruitment process. Features automated scheduling, real-time coding assessments, and candidate feedback loops.',
    longDescription: 'VHire revolutionizes the hiring process by integrating AI-driven insights into candidate evaluations. It provides a seamless interface for both recruiters and applicants, featuring collaborative coding environments and automated interview summarization.',
    color: '#005A9C', // Deep Blue
    tags: ['React', 'Socket.io', 'WebRTC', 'AI'],
    image: vhireShowcase
  },
  {
    id: 'documind-ai',
    title: 'DocuMind AI',
    subtitle: 'Document Assistant',
    description: 'An intelligent document management system that uses NLP to categorize, summarize, and extract key information from large volumes of text.',
    longDescription: 'DocuMind AI leverages Large Language Models to transform how organizations handle documentation. It can automatically extract metadata, generate summaries, and provide conversational search capabilities over your entire document library.',
    color: '#006400', // Dark Green
    tags: ['Python', 'React', 'OpenAI API', 'NLP'],
    image: documindShowcase
  }
];

// Local helper to get deleted project ids
const getDeletedProjectIds = () => {
  if (typeof window === 'undefined') return new Set();
  const local = localStorage.getItem('deleted_project_ids');
  if (local) {
    try {
      return new Set(JSON.parse(local));
    } catch (e) {
      console.error('Failed to parse deleted project ids', e);
    }
  }
  return new Set();
};

const saveDeletedProjectIds = (ids) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('deleted_project_ids', JSON.stringify(Array.from(ids)));
};

export const getProjects = () => {
  const all = getAllInventoryProjects();
  const deletedIds = getDeletedProjectIds();
  return all.filter(p => !deletedIds.has(p.id));
};

export const getAllInventoryProjects = () => {
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
  window.dispatchEvent(new CustomEvent('projectsUpdated'));
};

export const deleteProject = (id) => {
  const deletedIds = getDeletedProjectIds();
  deletedIds.add(id);
  saveDeletedProjectIds(deletedIds);
  window.dispatchEvent(new CustomEvent('projectsUpdated'));
};

export const restoreProject = (id) => {
  const deletedIds = getDeletedProjectIds();
  deletedIds.delete(id);
  saveDeletedProjectIds(deletedIds);
  window.dispatchEvent(new CustomEvent('projectsUpdated'));
};

export const isProjectDeleted = (id) => {
  const deletedIds = getDeletedProjectIds();
  return deletedIds.has(id);
};

export const getDeletedProjects = () => {
  const all = getAllInventoryProjects();
  const deletedIds = getDeletedProjectIds();
  return all.filter(p => deletedIds.has(p.id));
};
