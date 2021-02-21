// Core
import path from 'path';
import fse from 'fs-extra';
import klaw from 'klaw';

const PATH = path.resolve('logs/graphql');

export default function logHandler({ query, method }, res) {
  const { id } = query;
  const promises = [];
  const filtered = [];

  if (method === 'QUERY') {
    klaw(PATH)
      .on('data', (item) => {
        if (item.path.toLowerCase().endsWith(".json")) {
          const promise = new Promise((resolve, reject) => {
            fse.readFile(item.path, (err, data) => {
              if (err) return console.error(err);

              const parsedData = JSON.parse(data);
              if (parsedData.logId === parseInt(id)) {
                filtered.push(parsedData);
              }

              resolve();
            });
          });
          promises.push(promise);
        }
      })
      .on('end', () => {
        Promise.all(promises).then(() => {          
          if (filtered.length > 0) {
            res.status(200).json(filtered[0])
          } else {
            res.status(404).json({ message: `Log with id: ${id} not found.` })
          }
        });
      });
  }
}
