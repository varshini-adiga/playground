const fs = require('fs-extra');
const express = require('express');
const fsApi = express();

fsApi.post('/read', (req, res) => {
  const fileContents = fs.readFileSync(`${req.body.filePath}`, 'utf8');
  return res.json(fileContents);
});

fsApi.get('/getcwd', (req, res) => {
  const currentDir = process.cwd();
  return res.json(currentDir);
});

module.exports = fsApi;
