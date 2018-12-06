import ace from 'brace';

import 'brace/mode/markdown';
import 'brace/mode/html';

import 'brace/theme/chrome';
import 'brace/theme/clouds';
import 'brace/theme/github';
import 'brace/theme/monokai';
import 'brace/theme/twilight';

const defaultConfig = {
    theme: 'Github',
    mode: 'MD'
};

const aceModesMap = {
    'MD': 'ace/mode/markdown',
    'HTML': 'ace/mode/html'
};

const aceThemesMap = {
    'Chrome': 'ace/theme/chrome',
    'Clouds': 'ace/theme/clouds',
    'Github': 'ace/theme/github',
    'Monokai': 'ace/theme/monokai',
    'Twilight': 'ace/theme/twilight'
};

export default {
    name: 'jb-brace-editor',
    props: {
        'id': {
            type: String,
            required: true
        },
        'config': {
            type: Object,
            default: () => defaultConfig
        },
        'value': {
            type: String,
            default: ''
        }
    },
    watch: {
        value (newValue) {
            if (this.editor && this.editor.getValue() !== newValue) {
                this.editor.setValue(newValue, -1);
            }
        },
        config (newConfig) {
            if (this.editor) {
                this.editor.getSession().setMode(aceModesMap[newConfig.mode] || aceModesMap[defaultConfig.mode]);
                this.editor.setTheme(aceThemesMap[newConfig.theme] || aceThemesMap[defaultConfig.theme]);
            }
        }
    },
    mounted () {
        // didn't call during SSR
        // but this is what we need, because ace requires real DOM
        this.editor = ace.edit(this.id);
        this.editor.getSession().setMode(aceModesMap[this.config.mode] || aceModesMap[defaultConfig.mode]);
        this.editor.setTheme(aceThemesMap[this.config.theme] || aceThemesMap[defaultConfig.theme]);
        this.editor.on("change", e => {
            let editorValue = this.editor.getValue();
            if (this.value !== editorValue) {
                this.$emit('input', editorValue);
            }
        });
        this.editor.setValue(this.value, -1)
    },
    updated () {
        if (this.editor && this.editor.getValue() !== this.value) {
            this.editor.setValue(this.value, -1);
        }
    },
    destroyed () {
        if (this.editor) {
            this.editor.destroy();
        }
    }
};