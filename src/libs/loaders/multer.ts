import path from 'path';
import multer from 'multer';

const MIME_TYPES: { [key: string]: string } = {
    'text/csv': 'csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        const name = file.originalname.split(' ').join('_');
        const nameNoExtension = name.split('.')[0];
        if (!MIME_TYPES[file.mimetype]) {
            cb(new Error('invalid extension'), '');
        }
        const extension = MIME_TYPES[file.mimetype];
        cb(null, nameNoExtension + Date.now() + '.' + extension);
    },
});

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 8000000,
    },
});
