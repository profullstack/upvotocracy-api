import multer from 'multer';
import shortid from 'shortid';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import Upload from '../models/upload';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.type == 'image') cb(null, './uploads/images');
    if (file.type == 'video') cb(null, './uploads/videos');
  },
  filename(req, file, cb) {
    file.id = shortid.generate();
    cb(null, `${file.id}.${file.extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const videoExtensions = ['mov', 'mp4', 'webm'];
  const imageExtensions = ['jpg', 'svg', 'jpeg', 'png', 'gif', 'pdf'];

  file.extension = file.originalname.split('.').pop().toLowerCase();

  if (videoExtensions.includes(file.extension)) {
    file.type = 'video';
    cb(null, true);
  } else if (imageExtensions.includes(file.extension)) {
    file.type = 'image';
    cb(null, true);
  } else cb(null, false);
};

const getThumbnail = (path, id) => {
  return new Promise((resolve, reject) => {
    ffmpeg(path)
      .on('filenames', filenames => {
        resolve(filenames[0]);
      })
      .on('error', err => {
        console.error(err.message);
      })
      .takeScreenshots({
        filename: `${id}_thumb.png`,
        count: 1,
        timemarks: ['25%'],
      }, './uploads/images');
  });
};

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_UPLOAD_SIZE,
  },
  fileFilter,
});

export const uploadFile = async (req, res) => {
  if (req.file) {
    let thumb = null;
    const upload = {
      name: req.file.id,
      author: req.user.id,
      type: req.file.type,
      path: req.file.path,
    };

    if (req.file.type == 'video') {
      // todo: convert to h264/mp4
      // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#cloning-an-ffmpegcommand

      const thumbName = await getThumbnail(req.file.path, req.file.id);
      thumb = `${process.env.SITE_URL}/api/1/i/${thumbName}`;
      upload.thumbPath = `uploads/images/${thumbName}`;
    }

    await Upload.create(upload)
      .catch(err => res.status(500).send(err));

    res.status(201).json({
      status: 'file uploaded',
      url: `${process.env.SITE_URL}/api/1/${req.file.type == 'image' ? 'i' : 'v'}/${req.file.filename}`,
      mediaName: req.file.id,
      thumb,
    });
  } else {
    res.status(500).json({ errors: 'internal server error' });
  }
};

export const deleteFile = path => {
  if (path.split('/')[0] === 'uploads') {
    fs.unlink(path, async err => {
      if (err) throw err;
      await Upload.deleteOne({ path });
    });
  }
};

export default {
  uploadFile,
  multerUpload,
  deleteFile,
};
