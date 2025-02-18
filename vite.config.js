import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Handlebars from 'handlebars';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  plugins: [{
    name: 'handlebars',
    transformIndexHtml: {
      enforce: 'pre',
      async transform() {
        const componentHome = await fs.promises.readFile(
          resolve(__dirname, 'src/partials/components/componentHome.hbs'),
          'utf-8'
        );
        const componentHelp = await fs.promises.readFile(
          resolve(__dirname, 'src/partials/components/componentHelp.hbs'),
          'utf-8'
        );
        const componentCreate = await fs.promises.readFile(
          resolve(__dirname, 'src/partials/components/componentCreate.hbs'),
          'utf-8'
        );
        const componentNewPost = await fs.promises.readFile(
          resolve(__dirname, 'src/partials/components/componentNewPost.hbs'),
          'utf-8'
        );
        const componentPreview = await fs.promises.readFile(
          resolve(__dirname, 'src/partials/components/componentPreview.hbs'),
          'utf-8'
        );
        const componentCreateGroup = await fs.promises.readFile(
          resolve(__dirname, 'src/partials/components/componentCreateGroup.hbs'),
          'utf-8'
        );
        const componentEditGroup = await fs.promises.readFile(
          resolve(__dirname, 'src/partials/components/componentEditGroup.hbs'),
          'utf-8'
        );


        Handlebars.registerPartial('componentHome', componentHome);
        Handlebars.registerPartial('componentCreate', componentCreate);
        Handlebars.registerPartial('componentNewPost', componentNewPost);
        Handlebars.registerPartial('componentPreview', componentPreview);
        Handlebars.registerPartial('componentHelp', componentHelp);
        Handlebars.registerPartial('componentCreateGroup', componentCreateGroup);
        Handlebars.registerPartial('componentEditGroup', componentEditGroup);
        const defaultData = {
          channels: [
            { title: 'РИА Новости', username: '@rian_ru', avatar: '/images/create/default.png' },
            { title: 'ТАСС', username: '@tass_agency', avatar: '/images/create/default.png' },
            { title: 'Интерфакс', username: '@interfax', avatar: '/images/create/default.png' },
            { title: 'Коммерсантъ', username: '@kommersant', avatar: '/images/create/default.png' },
            { title: 'Ведомости', username: '@vedomosti', avatar: '/images/create/default.png' },
            { title: 'Forbes', username: '@forbes_ru', avatar: '/images/create/default.png' },
            { title: 'РБК', username: '@rbc_news', avatar: '/images/create/default.png' },
            { title: 'Медуза', username: '@meduzalive', avatar: '/images/create/default.png' },
            { title: 'Дождь', username: '@tvrain', avatar: '/images/create/default.png' },
            { title: 'BBC Russia', username: '@bbcrussian', avatar: '/images/create/default.png' }
          ],
          groups: [
            { title: 'Чат РИА', username: '@ria_chat', avatar: '/images/create/default.png', members: 1234 },
            { title: 'Чат ТАСС', username: '@tass_chat', avatar: '/images/create/default.png', members: 567 },
          ]
        };

        const combinedHtml = `
          <!DOCTYPE html>
          <html lang="ru">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>TG Application</title>
              <link rel="stylesheet" href="/src/css/global.css">
              <script type="module" src="/src/js/app.js"></script>
            </head>
            <body>
              <template id="route-/">
                ${Handlebars.compile(componentHome)(defaultData)}
              </template>
              <template id="route-/create">
                ${Handlebars.compile(componentCreate)(defaultData)}
              </template>
              <template id="route-/new-post">
                ${Handlebars.compile(componentNewPost)(defaultData)}
              </template>
              <template id="route-/preview">
                ${Handlebars.compile(componentPreview)(defaultData)}
              </template>
              <template id="route-/help">
                ${Handlebars.compile(componentHelp)(defaultData)}
              </template>
              <template id="route-/create-group">
                ${Handlebars.compile(componentCreateGroup)(defaultData)}
              </template>
              <template id="route-/edit-group">
                ${Handlebars.compile(componentEditGroup)(defaultData)}
              </template>
              <div id="app"></div>
              <div id="global-data" 
                data-channels='${JSON.stringify(defaultData.channels)}'
                data-groups='${JSON.stringify(defaultData.groups)}'
                style="display:none;">
              </div>
            </body>
          </html>
        `;

        return combinedHtml;
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.endsWith('.hbs')) {
          const filePath = resolve(__dirname, req.url.slice(1));
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/plain');
            res.end(content);
          } catch (error) {
            next(error);
          }
        } else {
          next();
        }
      });
    }
  }],
  publicDir: 'public'
});