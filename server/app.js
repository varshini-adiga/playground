const express = require('express');
const { fileSystem } = require('./router');
const path = require('path');

const app = express();

app.use(express.json());

app.use('/api/filesystem', fileSystem);

app.get('*', (req, res) => {
    res.sendFile(`${path.join(__dirname, "public")}/index.html`);
});

const PORT = parseInt(process.env.PORT, 10) || 9999;
app.listen(PORT, () => {
    console.info(`Express server is listening PORT (${PORT})`);
}).on('error', error => {
    console.error(`ERROR: ${error.message}`);
});
