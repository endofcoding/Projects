module.exports = {
  project: '<builtin>',
  dependencies: {
    forbid: [
      {
        name: 'new Date',
        message:
          'Use a proper datetime library. See: https://github.com/you-dont-need/You-Dont-Need-Momentjs',
      },
    ],
    allow: [
      '@react-navigation',
      'react-native',
    ],
  },
};
