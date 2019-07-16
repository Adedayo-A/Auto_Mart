const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: 'ddf91r8gu',
  api_key: '724667567854695',
  api_secret: 'rKYUG6gXrlsWEmqOx_Sp4SNAsf8',
});

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb) {
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
// Init Upload
const upload = multer({
  storage,
  limits: { fileSize: 1000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('myImage');

  // Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype); 
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}
    

const imgUploader = (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    const email = authData.user.email;
    if (err) {
      res.status(403).json({
        message: 'error..invalid token',
      });
    } else {
      upload(req, res, (err) => {
        if (err) {
          console.log('error ' + err );
          res.send({
            msg: err,
          });
        } else {
          if (req.file == undefined) {
            console.log('undefined');
            res.send({
             msg: 'Error: No File Selected!',
            });
          } else {
            const file = `public/uploads/${req.file.filename}`;
            cloudinary.uploader.upload(file, { tags: 'gotemps', resource_type: 'auto' })
            .then((file) => {
              console.log('Public id of the file is  ' + file.public_id);
              console.log('Url of the file is  ' + file.url);
              const image_url = file.url; // save the url to your model
              console.log('uploaded');
              console.log(image_url);
              res.send({
                msg: 'File Uploaded!',
                image_url,
              });
            }).catch((err) => {
                 if (err) { 
                  console.warn('error heere' + err);
                 }
              });
          }
        }
      });
    }
  });
};

module.exports = {
  imgUploader,
};