const app = require('./app');
const connectToDatabase = app.connectToDatabase;

if (require.main === module) {
  connectToDatabase()
    .then(() => {
      const port = process.env.PORT || 3000;
      app.listen(port, () => console.log(`http://localhost:${port}`));
    })
    .catch(error => {
      console.error('MongoDB алдаа:', error.message);
      process.exitCode = 1;
    });
}

module.exports = app;