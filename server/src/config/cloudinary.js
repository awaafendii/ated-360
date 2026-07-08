import { v2 as cloudinary } from "cloudinary";

// Configuration optionnelle : si les identifiants Cloudinary ne sont pas
// renseignés (dev sans compte configuré), les routes d'upload renverront
// une erreur explicite plutôt que d'échouer silencieusement.
export const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn("⚠️ Cloudinary non configuré — l'upload de fichiers (CV, preuves) est désactivé.");
}

export function uploadBuffer(buffer, { folder, resourceType = "auto" }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export { cloudinary };
