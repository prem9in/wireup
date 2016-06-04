import $ from 'jquery';
import React from 'react';
import _ from 'underscore';
import resources from 'i18n/strings_en';
import stateManager from 'route/statemanager';

'use strict';

export default class Base extends React.Component {

    constructor(props) {
        super(props);
        this.modelsforchange = [];
        this.modelstofetch = [];
        this.aggregatedModelsForChange = [];
    }

    registerForChange(model) {
        if (model) {
            if (_.isArray(model)){
                this.aggregatedModelsForChange = _.union(this.aggregatedModelsForChange, model);
            } else {
                this.modelsforchange.push(model);
            }
        }
    }

    registerForFetch(model) {
        if (model) {
            this.modelstofetch.push(model);
        }
    }

    fetchmodels() {
        if (this.modelstofetch && this.modelstofetch.length > 0) {
            for (let model of this.modelstofetch) {
                if (model) {
                    model.fetch();
                }
            }
        }
    }

    bindaggModelsForChange() {
        if (this.aggregatedModelsForChange && this.aggregatedModelsForChange.length > 0) {
            let promises = [];
            for (let aggModel of this.aggregatedModelsForChange) {
                if (aggModel) {
                    let mpromise = $.Deferred();
                    aggModel.on('change', mpromise.resolve);
                    promises.push({promise: mpromise, model: aggModel});
                }
            }
            if (promises.length > 0) {
                let defs = _.map(promises, function(p){ return p.promise; });
                $.when.apply($, defs).then(() => {
                    for (let pr of promises) {
                        pr.model.off('change', pr.promise.resolve);
                    }
                    this.forceUpdate();
                    this.bindaggModelsForChange();
                });
            }
        }
    }

    bindmodelsForChange() {
        if (this.modelsforchange && this.modelsforchange.length > 0) {
            for (let model of this.modelsforchange) {
                if (model) {
                    // use arrow function for binding to this
                    model.on('change', () => {
                        this.forceUpdate();
                    });
                }
            }
        }
    }

    componentDidMount() {
        this.bindmodelsForChange();
        this.bindaggModelsForChange();
        this.fetchmodels();
    }
    
    render() {
        return null;
    }    
}

Base.defaultProps = {
    resources: resources,
    stateManager: stateManager
};
