module.exports = {
  hooks: {
    readPackage(pkg, context) {
      const needsBundle = ['@humeai/assistant', '@humeai/assistant-react'];

      if (needsBundle.includes(pkg.name)) {
        // run pnpm build in that folder
        pkg.scripts = {
          postinstall: 'pnpm build',
        };
      }

      return pkg;
    },
  },
};
