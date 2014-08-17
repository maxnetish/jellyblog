/**
 * Created by Gordeev on 16.08.2014.
 */
var createModel = function(mongoose){
      var Schema = mongoose.Schema;

    var schema = new Schema({
        userName: {
            type: String,
            required: false
        },
        requestUrl: {
            type: String,
            required: false
        }
    });

    return mongoose.model('Log', schema);
};

exports.createLogRecordModel = createModel;