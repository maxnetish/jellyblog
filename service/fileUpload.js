var Multer = require('multer');

var multerMiddlewareOptions = {
    dest: './build/upload',
    limits: {
        fieldNameSize: 255,
        fieldSize: 262144,
        fields: 16,
        fileSize: 67108864,
        files: 8,
        parts: 8
    },
    onFileUploadStart: function(file, req, res){
        // only admin
        if (!req.userHasAdminRights) {
            //fileUtils.removeTempFiles(req.files);
            return false;
        }
    }
};

module.exports = {
    multerMiddleware: Multer(multerMiddlewareOptions)
};
