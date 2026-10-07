import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

function publicUploadPlugin() {
  return {
    name: 'public-upload-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/upload-public', (req: any, res: any, next: any) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const { filename, base64 } = JSON.parse(body);
            if (!filename || !base64) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'filename and base64 required' }));
            }
            const safeName = path.basename(filename);
            const publicDir = path.resolve(__dirname, 'public');
            if (!fs.existsSync(publicDir)) {
              fs.mkdirSync(publicDir, { recursive: true });
            }
            const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(cleanBase64, 'base64');
            const targetPath = path.join(publicDir, safeName);
            fs.writeFileSync(targetPath, buffer);

            // Also copy to alias if standard name
            if (safeName === 'Patel Motors Premium Bike Showcase.png' || safeName === 'patel-hero-desktop.png') {
              fs.writeFileSync(path.join(publicDir, 'patel-hero-desktop.png'), buffer);
              fs.writeFileSync(path.join(publicDir, 'Patel Motors Premium Bike Showcase.png'), buffer);
            } else if (safeName === 'Patel Motors_ Premium Bikes Showroom.png' || safeName === 'patel-hero-mobile.png') {
              fs.writeFileSync(path.join(publicDir, 'patel-hero-mobile.png'), buffer);
              fs.writeFileSync(path.join(publicDir, 'Patel Motors_ Premium Bikes Showroom.png'), buffer);
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, path: `/${safeName}` }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), publicUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
