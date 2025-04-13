const development = {
  apiUrl: 'http://localhost:3000/api'
};

const production = {
  apiUrl: '/api'
};

const config = process.env.NODE_ENV === 'production' ? production : development;

export default config;
