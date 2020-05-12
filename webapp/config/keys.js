// add this file to .gitignore
module.exports = {
  // github.com > Settings > Developer settings
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  },
  // portal.azure.com > App registration
  azure: {
    clientID: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  },
  mongodb: {
    dbURI: process.env.MONGODB_URI
  },
  session: {
    cookieKey: process.env.COOKIE_KEY
  },
  mqtt: {
    host: process.env.MQTT_HOST,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  }
};
