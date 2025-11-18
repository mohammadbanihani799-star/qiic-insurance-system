const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE;

const client = new CosmosClient({ endpoint, key });

const database = client.database(databaseId);

const containers = {
  vehicles: database.container(process.env.COSMOS_CONTAINER_VEHICLES),
  customers: database.container(process.env.COSMOS_CONTAINER_CUSTOMERS),
  policies: database.container(process.env.COSMOS_CONTAINER_POLICIES),
  claims: database.container(process.env.COSMOS_CONTAINER_CLAIMS)
};

// Initialize database and containers
async function initializeDatabase() {
  try {
    console.log('Initializing Azure Cosmos DB...');
    
    // Create database if it doesn't exist
    const { database: db } = await client.databases.createIfNotExists({
      id: databaseId
    });
    console.log(`Database "${databaseId}" ready`);

    // Create containers with partition keys
    const containerConfigs = [
      {
        id: process.env.COSMOS_CONTAINER_CUSTOMERS,
        partitionKey: { paths: ['/customerId'] }
      },
      {
        id: process.env.COSMOS_CONTAINER_VEHICLES,
        partitionKey: { paths: ['/customerId'] }
      },
      {
        id: process.env.COSMOS_CONTAINER_POLICIES,
        partitionKey: { paths: ['/customerId'] }
      },
      {
        id: process.env.COSMOS_CONTAINER_CLAIMS,
        partitionKey: { paths: ['/policyId'] }
      }
    ];

    for (const config of containerConfigs) {
      await db.containers.createIfNotExists(config);
      console.log(`Container "${config.id}" ready`);
    }

    console.log('Azure Cosmos DB initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
}

module.exports = {
  client,
  database,
  containers,
  initializeDatabase
};
