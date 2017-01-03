const name = 'dateAndTime';

function func(dateSerializedAsJson) {
    if (!dateSerializedAsJson) {
        return dateSerializedAsJson;
    }
    let dateParsed;
    let result;
    try {
        dateParsed = new Date(dateSerializedAsJson);
    }
    catch (err) {
        console.warn(`Can not parse string [${dateSerializedAsJson}] as Date`);
        result = 'No date'
    }

    result = result || dateParsed.toLocaleString();
    return result;
}
export {
    name,
    func
};