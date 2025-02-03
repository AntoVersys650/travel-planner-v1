import { createProxyMiddleware, Express } from 'http-proxy-middleware';

module.exports = function (app: Express) {
  app.use(
    '/api/geonames',
    createProxyMiddleware({
      target: 'https://api.geonames.org',
      changeOrigin: true,
      pathRewrite: {
        '^/api/geonames': '',
      },
    })
  );
};