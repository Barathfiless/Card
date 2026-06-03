/**
 * Devicon logo URLs for tech stack tags.
 * Express uses the wordmark SVG so it stays visible on light pill backgrounds.
 */
export const EXPRESS_LOGO_URL =
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original-wordmark.svg';

const TAG_LOGOS = {
  react: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'react.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  reactjs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'next.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
  nextjs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
  javascript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  js: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  typescript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  ts: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  'tailwind css': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
  tailwind: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
  tailwindcss: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
  'node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  nodejs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  node: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  nestjs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg',
  'nest.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg',
  java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  'spring boot': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
  spring: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
  python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  postgresql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  postgres: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  mysql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  mongodb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  mongo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  redis: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
  git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  aws: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
  'amazon web services':
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
  postman: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
  html: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  html5: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  css: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  css3: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  figma: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
  sass: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg',
  angular: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
  vue: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
  'vue.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
  vuejs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
  firebase: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg',
  kubernetes: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg',
  k8s: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg',
  express: EXPRESS_LOGO_URL,
  'express.js': EXPRESS_LOGO_URL,
  expressjs: EXPRESS_LOGO_URL,
  bootstrap: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
  redux: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
  graphql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',
  'c++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  'c#': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
  django: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
  flask: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
};

function normalizeTagKey(tag) {
  const t = tag.trim().toLowerCase();
  if (t === 'expressjs' || t === 'express js') return 'express';
  return t;
}

export function getTagLogoUrl(tag) {
  if (!tag) return null;
  return TAG_LOGOS[normalizeTagKey(tag)] || null;
}
