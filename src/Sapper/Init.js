import React from "react";
import Counter from "./Counter";

export default class Init extends React.Component
{
    constructor(props) {
        super(props);

        const limits = this.props.limits || {
            minRows: 3,
            maxRows: 20,
            minCols: 3,
            maxCols: 100,
            minPerc: 10,
            maxPerc: 90,
        };

        this.state = {
            data: [
                {
                    name: "rows",
                    error: null,
                    value: 0,
                    min: limits.minRows,
                    max: limits.maxRows,
                },
                {
                    name: "cols",
                    error: null,
                    value: 0,
                    min: limits.minCols,
                    max: limits.maxCols,
                },
                {
                    name: "percent",
                    error: null,
                    value: 0,
                    min: limits.minPerc,
                    max: limits.maxPerc,
                },
            ]
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    keyUp(e, i) {

        const index = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].indexOf(e.key);
        if (e.type === 'keydown' && index !== -1) {
            const data = this.state.data.slice();
            const val = parseInt(data[i].value || 0, 10);
            const dir = index <= 1 ? 1 : -1;
            console.log(val + dir);
            if((dir === 1 && val + dir <= data[i].max) || (dir === -1 && val + dir >= data[i].min)) {
                this.handleIntInput(val+dir, i);
            }
        } else if(index === -1 && e.key !== 'Tab'){
            this.handleIntInput(e.target.value, i);
        }
    }

    handleIntInput(val, i) {
        const data = this.state.data.slice();
        // 0. empty
        if(!val || !val.toString().trim()) {
            data[i].error = "field must not be empty";
            data[i].value = 0;
        // 1. only int
        } else if(val.toString().match(/\D/)) {
            data[i].error = "field must contains only digits";
            val = parseInt(val, 10);
        // 2. valid min/max
        } else if(data[i].min !== undefined && parseInt(val, 10) < data[i].min) {
            data[i].error = "field must not be less than " + data[i].min;
        } else if(data[i].max !== undefined  && parseInt(val, 10) > data[i].max) {
            data[i].error = "field must not be greater than " + data[i].max;
        // 3. remove error if exists
        } else if(data[i].error) {
            data[i].error = null;
        }
        data[i].value = parseInt(val, 10);
        // 4. set state
        this.setState({data: data});
    }

    handleSubmit(e) {

        const data = this.state.data;
        let config = {};
        let error = false;
        for(let i=0; i < data.length; i++) {
            if(data[i].error || !data[i].value) {
                error = true;
                this.handleIntInput(data[i].value, i);
            }
            config[data[i].name] = data[i].value;
        }
        if(error) {
            e.preventDefault();
            return;
        }
        this.props.onSubmit(config);
    }

    renderInput(title, i) {
        return (
            <div className="config__row">
                <legend>{title}</legend>
                <Counter count={this.state.data[i].value}/>
                <input type="text" onKeyDown={(e) => this.keyUp(e, i)} onKeyUp={(e) => this.keyUp(e, i)}/>
                {this.state.data[i].error &&
                <p className="config__error">{this.state.data[i].error}</p>
                }
            </div>
        );
    }

    render() {
        return (
            <form className="config" onSubmit={this.handleSubmit}>
                {this.renderInput("rows count", 0)}
                {this.renderInput("columns count", 1)}
                {this.renderInput("mine percentage", 2)}
                <input className="config__submit" type="submit" value="go on" />
            </form>
        );
    }
}