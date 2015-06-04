var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var componentFlux = require('./general-settings-flux');

var GeneralSettingsForm = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        return {
            data: {},
            pristine: true
        };
    },
    render: function () {
        return <section>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-offset-2 col-md-8">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <span className="panel-title">General settings</span>
                            </div>
                            <div className="panel-body">
                                <form name="general-settings-form">
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label htmlFor="site-title" className="col-md-2 control-label">Site
                                                title</label>

                                            <div className="col-md-10">
                                                <input type="text"
                                                       name="siteTitle"
                                                       id="site-title"
                                                       className="form-control"
                                                       placeholder="Enter site title"
                                                       required
                                                       value={this.state.data.siteTitle}
                                                       onChange={this.textFieldChanged}/>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>;
    },
    componentDidMount: function () {
        componentFlux.actions.componentMounted();
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },
    componentWillUnmount: function () {

    },
    textFieldChanged: function (e) {
        componentFlux.actions.valueChanged({
            key: e.target.name,
            value: e.target.value
        })
    },
    onStoreChanged: function (storeData) {
        this.setState(_.cloneDeep(storeData));
    }
});

module.exports = GeneralSettingsForm;