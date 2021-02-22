// Core
import path from 'path';
import fse from 'fs-extra';
import klaw from 'klaw';

const PATH = path.resolve('logs/rest');

export default async (req, res) => {
  const {
    query: { userId },
    method,
  } = req;
  if (method === 'POST') {
    await fse.writeFile(`${PATH}/${req.body.logId}.json`, JSON.stringify(req.body, null, 4), 'utf-8');

    res.status(201).json({ name: 'POST response', message: `created at ${new Date().toISOString()}` });
  } else if (method === 'GET') {
    const filesData = [];
    const promises = [];

    klaw(PATH)
      .on('data', (item) => {
        if (item.path.toLowerCase().endsWith(".json")) {
          const promise = new Promise((resolve, reject) => {
            fse.readFile(item.path, (err, data) => {
              if (err) return console.error(err);
              const parsedData = JSON.parse(data);
              if (userId) {
                if (parsedData.userId === parseInt(userId)) {
                  filesData.push(parsedData);
                }
              } else {
                filesData.push(parsedData);
              }

              resolve();
            });
          });
          promises.push(promise);
        }
      })
      .on('end', () => {
        Promise.all(promises).then(() => {
          res.status(200).json({ name: 'GET response', filesData });
        });
      });
  }
}
