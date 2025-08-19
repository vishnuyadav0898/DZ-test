// // utils/minioClient.js
// const Minio = require("minio");

// const minioClient = new Minio.Client({
//   endPoint: process.env.MINIO_ENDPOINT,
//   port: 9000,
//   useSSL: false,
//   accessKey: process.env.MINIO_ACCESS_KEY,
//   secretKey: process.env.MINIO_SECRET_KEY,
// });

// const BUCKET_NAME = "user";

// (async () => {
//   const exists = await minioClient.bucketExists(BUCKET_NAME);
//   if (!exists) {
//     await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
//     console.log(`Bucket '${BUCKET_NAME}' created`);
//   }
// })();

// module.exports = {
//   minioClient,
//   BUCKET_NAME,
// };