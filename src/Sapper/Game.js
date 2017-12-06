import React from "react";

import "./game.css";
import Init from "./Init";
import Preset from "./Preset";
import Cell from "./Cell";
import Counter from "./Counter";

import createHistory from 'history/createBrowserHistory';
import queryString from 'query-string';


const history = createHistory();


export default class Game extends React.Component
{
    constructor(props) {
        super(props);

        this.pressed = '';

        this.handleTimer = null;
        this.handleTimeout = 100;

        this.gameStart = null;
        this.gameTimer = null;

        this.limits = {
            minRows: 3,
            maxRows: 20,
            minCols: 3,
            maxCols: 100,
            minPerc: 10,
            maxPerc: 90,
        };
        this.faces = {
            regular: 'regular',
            pressed: 'pressed',
            warning: 'warning',
            dead: 'dead',
            win: 'win'
        };

        this.preset = {
            easy: {
                rows: 9,
                cols: 9,
                percent: 12.3,
            },
            middle: {
                rows: 16,
                cols: 16,
                percent: 15.6,
            },
            hard: {
                rows: 16,
                cols: 30,
                percent: 20.6,
            }
        };

        this.setting = {
            rows: 0,
            cols: 0,
            percent: 0,
        };

        this.bombCount = 0;
        this.gameOver = false;

        this.constructBoard = this.constructBoard.bind(this);

        this.mouseUp = this.mouseUp.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseOver = this.mouseOver.bind(this);

        this.state = {
            initialized: false,
            timer: 0,
            bombCount: 0,
            board: [],
            face: this.faces.regular
        };
    }

    componentDidMount() {
        const data = queryString.parse(history.location.search);

        if(data.rows && data.cols && data.percent) {
            this.constructBoard(data);
        }
    }

    constructBoard(data) {

        this.gameOver = false;

        this.setting = data;

        history.replace({
            pathname: '',
            search: queryString.stringify(data)
        });

        const freeCell = data.rows * data.cols;

        this.bombCount = Math.round((freeCell - 1) * (data.percent / 100));

        const board = [];

        // creating board
        for(let i = 0 ; i < freeCell; i++) {
            board.push({
                open: false,
                bomb: false,
                level: 0,
                flagged: false,
                pressed: false,
                status: {
                    blown: false,
                    bomb: false,
                    wrong: false,
                },
            });
        }
        // fill bombs
        for(let i = 0 ; i < this.bombCount; i++) {
            let index = Math.floor(Math.random() * freeCell);
            while(board[index].bomb === true) {
                index = Math.floor(Math.random() * freeCell);
            }
            board[index].bomb = true;
        }
        // fill digits
        for(let i = 0; i < board.length; i++) {
            if(board[i].bomb) continue;
            let bombs = 0;
            const siblings = this.getSiblings(i);

            for(let j=0;j<siblings.length;j++) {
                if(board[siblings[j]].bomb) bombs++;
            }
            board[i].level = bombs;
        }

        this.setState({
            initialized: true,
            bombCount: this.bombCount,
            board: board,
        });
    }

    mouseOver(e, i) {
        if(this.gameOver) return;
        e.preventDefault();
        this.handlePress(i);
    }

    mouseDown(e, i) {
        e.preventDefault();
        if(this.gameOver) return;
        let currAction;

        switch(e.nativeEvent.which) {
            case 3:
                currAction = 'right';
                break;
            case 1:
            default:
                currAction = 'left';
        }
        this.pressed += this.pressed ? ' ' + currAction : currAction;

        if(this.pressed !== 'right') {
            this.setState({face: this.faces.warning});
        }

        this.handlePress(i);
    }

    mouseUp(e, i) {
        e.preventDefault();
        
        if(this.gameOver) return;

        this.setState({face: this.faces.regular});

        if(!this.gameTimer) {
            this.gameStart = new Date().getTime() - 1000;
            this.setState({timer: parseInt((new Date().getTime() - this.gameStart) / 1000, 10)});
            this.gameTimer = setInterval(()=>{
                this.setState({timer: parseInt((new Date().getTime() - this.gameStart) / 1000, 10)});
            }, 1000);
        }

        let currAction;

        switch(e.nativeEvent.which) {
            case 3:
                currAction = 'right';
                break;
            case 1:
            default:
                currAction = 'left';
        }

        this.pressed = this.pressed.replace(currAction, '').trim();
        if(this.handleTimer + this.handleTimeout > new Date().getTime()) {
            this.handleBoth(i);
        } else if(this.pressed) {
            this.handleTimer = new Date().getTime();
        } else if(currAction === 'left'){
            this.handleLeft(i);
        } else if(currAction === 'right') {
            this.handleRight(i);
        }
    }

    getPos(i) {
        const row = Math.floor(i/this.setting.cols);
        const col = i - row*this.setting.cols;
        return {
            row: row,
            col: col,
        }
    }

    getIndex(c) {
        if(
            c.col < 0 ||
            c.col >= this.setting.cols ||
            c.row < 0 ||
            c.row >= this.setting.rows
        ) return null;

        return c.row*this.setting.cols + c.col;
    }

    getSiblings(i) {
        let c = this.getPos(i);

        const res = [];
        const arr = [
            {row:c.row-1, col:c.col-1},
            {row:c.row-1, col:c.col},
            {row:c.row-1, col:c.col+1},
            {row:c.row, col:c.col-1},
            {row:c.row, col:c.col+1},
            {row:c.row+1, col:c.col-1},
            {row:c.row+1, col:c.col},
            {row:c.row+1, col:c.col+1},
        ];
        for(let j = 0; j < arr.length; j++) {
            let _i = this.getIndex(arr[j]);
            if(_i !== null) {
                res.push(_i);
            }
        }
        return res;
    }

    runOpener(i, board) {
        if(!board[i].level) {
            const indices = this.getSiblings(i);
            for (let j = 0; j < indices.length; j++) {
                if (!board[indices[j]].bomb && !board[indices[j]].open) {
                    board[indices[j]].open = true;
                    if (!board[indices[j]].level) {
                        this.runOpener(indices[j], board);
                    }
                }
            }
        }
        return board;
    }

    checkWin(board) {
        let bombs = 0;
        board.map((cell) => {
            if(cell.bomb && cell.flagged) bombs++;
            return cell;
        });

        if(bombs === this.bombCount) {
            this.gameOver = true;
            const board = this.state.board.slice();
            board.map((cell) => {
                if(!cell.flagged) cell.open = true;
                return cell;
            });
            this.gameStart = 0;
            clearInterval(this.gameTimer);
            this.gameTimer = null;
            this.setState({board: board, face: this.faces.win});
        }
    }

    forceGameOver(board) {
        this.gameOver = true;
        board.map((item) => {
            if(item.bomb && !item.status.blown && !item.status.wrong) item.status.bomb = true;
            return item;
        });
        this.gameStart = 0;
        clearInterval(this.gameTimer);
        this.gameTimer = null;
    }

    handleLeft(i) {
        const board = this.state.board.slice();
        if(board[i].flagged || board[i].open) return;
        board[i].open = true;
        if(board[i].bomb) {
            board[i].status.blown = true;
            this.forceGameOver(board);
            this.setState({face: this.faces.dead});
        } else if(!board[i].level) {
            this.runOpener(i, board);
            this.checkWin(board);
        }
        board.map((cell)=>{
            cell.pressed = false;
            return cell;
        });

        this.setState({board: board});
    }

    handleRight(i) {
        const board = this.state.board.slice();
        let bombCount = this.state.bombCount;
        if(!board[i].open) {
            board[i].flagged = !board[i].flagged;
            bombCount = board[i].flagged ? this.state.bombCount - 1: this.state.bombCount + 1;
            board[i].pressed = false;
            this.checkWin(board);
        }
        board.map((cell)=>{
            cell.pressed = false;
            return cell;
        });
        this.setState({
            bombCount: bombCount,
            board: board
        });
    }

    handlePress(i) {
        if(this.pressed.match(/\s/)) {
            const board = this.state.board.slice();
            const indices = this.getSiblings(i);
            board.map((cell, index) => {
                cell.pressed = !cell.flagged && (indices.indexOf(index) !== -1 || index === i);
                return cell;
            });

            this.setState({board: board});

        } else if(this.pressed) {
            const board = this.state.board.slice();
            board.map((cell, index) => {
                cell.pressed = !cell.flagged && index === i && this.pressed !== 'right';
                return cell;
            });
            this.setState({board: board});
        }
    }

    handleBoth(i) {
        const board = this.state.board.slice();

        if(board[i].open && board[i].level) {

            const indices = this.getSiblings(i);

            let flags = 0;
            let bombs = 0;

            for (let j = 0; j < indices.length; j++) {
                if(board[indices[j]].flagged) flags++;
                if(board[indices[j]].bomb) bombs++;
            }

            if(flags === bombs) {
                for (let j = 0; j < indices.length; j++) {
                    if(board[indices[j]].flagged !== board[indices[j]].bomb) {
                        if(board[indices[j]].flagged) {
                            board[indices[j]].status.wrong = true;
                        } else if(board[indices[j]].bomb) {
                            board[indices[j]].status.blown = true;
                        }
                        this.forceGameOver(board);
                        this.setState({face: this.faces.dead});
                    }

                    if (!board[indices[j]].level && !board[indices[j]].open && !board[indices[j]].flagged) {
                        this.runOpener(indices[j], board);
                    }
                    if(!board[indices[j]].flagged) {
                        board[indices[j]].open = true;
                    }
                }
            }
        }
        board.map((cell) => {
            cell.pressed = false;
            return cell;
        });
        this.setState({board: board});

    }

    render() {

        if(!this.state.initialized) {
            return (
                <div className="init-screen">
                    <div className="init-screen__cell">
                        <Preset title="easy" data={this.preset.easy} onClick={this.constructBoard}/>
                        <Preset title="middle" data={this.preset.middle} onClick={this.constructBoard}/>
                        <Preset title="hard" data={this.preset.hard} onClick={this.constructBoard}/>
                    </div>
                    <div className="init-screen__cell">
                        <Init limits={this.limits} onSubmit={this.constructBoard} />
                    </div>
                </div>
            );

        }

        let counter = 0;
        const rows = [];

        for(let row = 0; row < this.setting.rows; row++) {
            let cells = [];
            for(let col = 0; col < this.setting.cols; col++) {
                cells.push(<Cell
                    key={col}
                    index={counter}
                    data={this.state.board[counter++]}
                    onMouseDown={this.mouseDown}
                    onMouseUp={this.mouseUp}
                    onMouseOver={this.mouseOver}
                />);
            }
            rows.push(<div key={row} className="board__row">{cells}</div> )
        }

        return (
            <div className="board">
                <div className="board__hublot">
                    <Counter count={this.state.bombCount}/>
                    <div
                        className={"board__face board__face_" + this.state.face}
                        onMouseUp={()=>{
                            this.setState({face: this.faces.regular, timer: 0});
                            this.forceGameOver(this.state.board);
                            this.constructBoard(this.setting);
                        }}
                        onMouseDown={()=>{
                            this.setState({face: this.faces.pressed});
                        }}
                        onMouseOut={()=>{
                            this.setState({face: this.faces.regular});
                        }}
                        >
                    </div>
                    <Counter count={this.state.timer}/>
                </div>
                <div className="board__table">
                {rows}
                </div>
                <button onClick={()=>{
                    this.forceGameOver(this.state.board);
                    history.replace({
                        pathname: ''
                    });
                    this.setState({
                        initialized: false,
                        timer: 0
                    });
                }}>start new game</button>
            </div>);

    }
}




