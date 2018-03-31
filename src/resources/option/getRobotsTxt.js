import {Option} from '../../models';


function fetch() {
    let self = this;

    return Option.findOne({key: 'ROBOTS.TXT'}, {_id: false, 'value': true}, {lean: true})
        .exec()
        .then(result => {
            if(!(result && result.value)) {
                return result;
            }
            return result.value;
        });
}

export default fetch;