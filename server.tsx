const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3001; // Use a different port to avoid conflicts

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

app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});