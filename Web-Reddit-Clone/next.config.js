const { APP_DOMAINS } = process.env;
const appDomains = APP_DOMAINS.split(" ");

module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    domains: ["www.gravatar.com", ...appDomains],
  },
};
