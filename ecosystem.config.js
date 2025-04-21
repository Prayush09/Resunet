module.exports = {
    apps: [
      {
        name: 'resunest',
        script: 'npm',
        args: 'start',
        cwd: './', // your project root directory
        env: {
          NODE_ENV: 'production'
        },
        watch: false
      }
    ]
  };
  