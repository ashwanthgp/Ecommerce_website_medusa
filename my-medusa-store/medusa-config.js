const dotenv = require("dotenv");

// Determine the correct environment file based on NODE_ENV
let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

// Load environment variables from the specified file
try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {
  console.error(`Failed to load ${ENV_FILE_NAME}`, e);
}

// Default CORS values
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

// Default Database and Redis URLs
const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Plugins configuration
const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve:`medusa-payment-razorpay`,
    options:{
         key_id: process.env.RAZORPAY_ID,
                key_secret: process.env.RAZORPAY_SECRET,
                razorpay_account: process.env.RAZORPAY_ACCOUNT,                
                automatic_expiry_period: 30, /*any value between 12 minutes and 30 days expressed in minutes*/
                manual_expiry_period: 20,
                refund_speed: "normal", 
                webhook_secret: process.env.RAZORPAY_SECRET,
    }
  },
  
  {
    resolve: 'medusa-plugin-meilisearch',
    options: {
      config: {
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
      },
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: [
              "title", 
              "description",
              "variant_sku",
            ],
            displayedAttributes: [
              "id", 
              "title", 
              "description", 
              "variant_sku", 
              "thumbnail", 
              "handle",
            ],
          },
          primaryKey: "id",
          transformer: (product) => ({
            id: product.id, 
            title: product.title,
            description: product.description,
            variant_sku: product.variant_sku,
            thumbnail: product.thumbnail,
            handle: product.handle,
            //include other attributes as needed
          }),
        },
      },
    },
  },   
  
  {
    resolve: 'medusa-plugin-sendgrid',
    options: {
      api_key: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
      order_placed_template: process.env.SENDGRID_ORDER_PLACED_ID,
      localization: {
        "de-DE": { // locale key
          order_placed_template: process.env.SENDGRID_ORDER_PLACED_ID_LOCALIZED,
        },
      },
    },
  },



  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      develop: {
        open: process.env.OPEN_BROWSER !== "false",
      },
    },
  },
];

// Modules configuration (uncomment to enable Redis)
// const modules = {
//   eventBus: {
//     resolve: "@medusajs/event-bus-redis",
//     options: {
//       redisUrl: REDIS_URL
//     }
//   },
//   cacheService: {
//     resolve: "@medusajs/cache-redis",
//     options: {
//       redisUrl: REDIS_URL
//     }
//   },
// };

// Project configuration
/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwt_secret: process.env.JWT_SECRET || "supersecret",
  cookie_secret: process.env.COOKIE_SECRET || "supersecret",
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  // Uncomment the following lines to enable REDIS
  // redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  // modules, // Uncomment this line to enable Redis modules
};
