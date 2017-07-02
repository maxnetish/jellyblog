
function download(obj, name) {
    let serialized = JSON.stringify(obj, null, 4);
    let elem = document.createElement('a');
    let file = new Blob([serialized], {type: 'text/plain'});
    elem.href = URL.createObjectURL(file);
    elem.download = name;
    elem.click();
}

export default download;