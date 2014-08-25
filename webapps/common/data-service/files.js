/**
 * Created by mgordeev on 08.08.2014.
 */
define('data.files',
    [
        'ko',
        'jquery',
        'data.mapper',
        'data.utils'
    ],
    function (ko, $, mapper, dataUtils) {
        var FileInfo = function (row) {
                row = row || {};

                this.name = row.name;
                this.date = new Date(row.ctime);
                this.size = row.size;
                this.url = row.url;
                this.visible = ko.observable(true);
            },
            readUploadDir = function () {
                return $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/upload',
                    converters: {
                        'text json': mapper.create(FileInfo)
                    }
                })
                    .fail(dataUtils.onFail);
            },
            uploadFile = function (fileToUpload) {
                var formData = new FormData();
                formData.append('file_0', fileToUpload);

                return $.ajax({
                    type: 'POST',
                    url: '/api/upload',
                    data: formData,
                    processData: false,
                    contentType: false,
                    //contentType: 'multipart/form-data',
                    //headers: {'Content-Type': undefined},
                    converters: {
                        'text json': mapper.create(FileInfo)
                    }
                })
                    .fail(dataUtils.onFail);
            },
            removeFile = function (pathToRemove) {
                return $.ajax({
                    type: 'DELETE',
                    url: '/api/upload',
                    data: {
                        path: pathToRemove
                    }
                })
                    .fail(dataUtils.onFail);
            },
            uploadJsonPosts = function(fileObject){
                var formData = new FormData();
                formData.append('file_json_posts', fileObject);

                return $.ajax({
                    type: 'POST',
                    url: '/api/upload',
                    data: formData,
                    processData: false,
                    contentType: false
                })
                    .fail(dataUtils.onFail);
            };

        return {
            Model: FileInfo,
            query: readUploadDir,
            upload: uploadFile,
            remove: removeFile,
            uploadJsonPosts: uploadJsonPosts
        };
    });