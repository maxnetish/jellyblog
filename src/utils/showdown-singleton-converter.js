import showdown from 'showdown';
import pubSettings from '../../config/pub-settings.json';

const showdownConverter = new showdown.Converter(pubSettings.showdownOptions);

export default showdownConverter;