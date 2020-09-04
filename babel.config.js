module.exports = function(api) {
  api.cache(false);

  const presets = [];

  const plugins = [
    ['@babel/proposal-object-rest-spread'],
  ];

  return {
    presets,
    plugins,
    sourceMaps: "inline",
    ignore: [
      (process.env.NODE_ENV !== 'test' ?  "**/*.test.js" : null)
    ].filter(n => n)
  };
};
